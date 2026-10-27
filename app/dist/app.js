const d3 = window.d3;

const ISO2 = {
  IND:"IN",BGD:"BD",PAK:"PK",LKA:"LK",NPL:"NP",IDN:"ID",VNM:"VN",THA:"TH",MYS:"MY",PHL:"PH",
  SAU:"SA",ARE:"AE",EGY:"EG",MAR:"MA",TUR:"TR",TUN:"TN",MEX:"MX",COL:"CO",BRA:"BR",PER:"PE",
  CHL:"CL",ARG:"AR",ECU:"EC",NGA:"NG",ZAF:"ZA",KEN:"KE",JPN:"JP",KOR:"KR",CHN:"CN",UZB:"UZ"
};

const RATING_LABELS = {
  demand: "Outcome Demand",
  paid_conversion: "Paid Conversion",
  delivery: "Digital Delivery",
  distribution: "Distribution / B2B",
  whitespace: "Whitespace / Gap",
  feasibility: "Operating Feasibility",
  evidence_confidence: "Evidence Confidence"
};

const COMPARE_KEYS = ["demand", "paid_conversion", "distribution", "whitespace", "delivery", "feasibility"];

const $ = id => document.getElementById(id);

const state = {
  metric: "launch_fit",
  cluster: "all",
  route: "all",
  minimumEvidence: 0,
  query: "",
  selected: "IND",
  compare: ["IND", "MEX", "JPN"],
  theme: "briefing",
  sortKey: "currentMetric",
  sortAsc: false
};

let data, markets, sourceIndex;
let mapSvg, mapLayer, mapPaths, zoomBehavior, activeProjection, worldGeoFeatures = [];

function flag(iso3) {
  const c = ISO2[iso3];
  return c ? String.fromCodePoint(...[...c].map(x => 127397 + x.charCodeAt(0))) : "🌐";
}

function metricValue(m) {
  if (state.metric === "launch_fit") return m.derived.launch_fit;
  if (state.metric === "ef_2025") return m.ef_2025;
  return m.ratings[state.metric];
}

function metricLabel() {
  return data?.application?.metric_definitions[state.metric]?.label || state.metric;
}

function matchingMarkets() {
  const query = state.query.trim().toLowerCase();
  return markets.filter(m => {
    const matchCluster = state.cluster === "all" || m.cluster.toLowerCase().includes(state.cluster.toLowerCase());
    const matchRoute = state.route === "all" || m.status === state.route;
    const matchConfidence = m.ratings.evidence_confidence >= state.minimumEvidence;
    const matchQuery = !query || (m.country + " " + m.iso3 + " " + m.cluster + " " + m.status + " " + m.buyer + " " + m.target).toLowerCase().includes(query);
    return matchCluster && matchRoute && matchConfidence && matchQuery;
  });
}

function sourceFor(ref) {
  return sourceIndex.get(ref) || { id: "direct_source", url: ref, use: "Official Country Sourced Evidence", quality: "Observed country report" };
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
}

function formatInline(str) {
  let s = esc(str);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1 ↗</a>');
  return s;
}

function parseMarkdownToHtml(md) {
  if (!md) return "<p>Detailed executive dossier not found for this market.</p>";
  const lines = md.split("\n");
  let html = "";
  let inList = false;
  let inTable = false;

  for (let line of lines) {
    line = line.trim();
    if (!line) {
      if (inList) { html += inList === "ol" ? "</ol>" : "</ul>"; inList = false; }
      if (inTable) { html += "</tbody></table>"; inTable = false; }
      continue;
    }
    if (line.startsWith("# ")) { html += `<h2>${formatInline(line.slice(2))}</h2>`; continue; }
    if (line.startsWith("## ")) { html += `<h2>${formatInline(line.slice(3))}</h2>`; continue; }
    if (line.startsWith("### ")) { html += `<h3>${formatInline(line.slice(4))}</h3>`; continue; }
    if (line.startsWith("|") && line.endsWith("|")) {
      const parts = line.slice(1, -1).split("|").map(s => s.trim());
      if (parts.every(p => /^:?-+:?$/.test(p))) continue;
      if (!inTable) {
        inTable = true;
        html += "<table><thead><tr>" + parts.map(p => `<th>${formatInline(p)}</th>`).join("") + "</tr></thead><tbody>";
        continue;
      } else {
        html += "<tr>" + parts.map(p => `<td>${formatInline(p)}</td>`).join("") + "</tr>";
        continue;
      }
    } else if (inTable) {
      html += "</tbody></table>";
      inTable = false;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) { html += "<ul>"; inList = "ul"; }
      html += `<li>${formatInline(line.slice(2))}</li>`;
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      if (!inList) { html += "<ol>"; inList = "ol"; }
      html += `<li>${formatInline(line.replace(/^\d+\.\s/, ""))}</li>`;
      continue;
    }
    if (inList) { html += inList === "ol" ? "</ol>" : "</ul>"; inList = false; }
    html += `<p>${formatInline(line)}</p>`;
  }
  if (inList) html += inList === "ol" ? "</ol>" : "</ul>";
  if (inTable) html += "</tbody></table>";
  return html;
}

function openArticle(iso) {
  const market = markets.find(m => m.iso3 === iso) || markets.find(m => m.iso3 === state.selected);
  if (!market) return;
  state.selected = market.iso3;

  $("articleHeroImg").src = market.image_url;
  $("articleCountryTitle").innerHTML = `${flag(market.iso3)} ${esc(market.country)}`;
  $("articleClusterBadge").textContent = (market.cluster || "GLOBAL").toUpperCase();
  $("articleRouteBadge").textContent = market.status;
  $("articleFitBadge").textContent = `Launch Fit: ${market.derived.launch_fit} / 10`;
  $("articleEfBadge").textContent = `EF EPI 2025: ${market.ef_2025}`;

  $("articleBody").innerHTML = parseMarkdownToHtml(market.dossier_markdown);

  $("articleModal").classList.add("open");
  $("articleModal").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeArticle() {
  $("articleModal").classList.remove("open");
  $("articleModal").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function navArticle(direction) {
  const curIdx = markets.findIndex(m => m.iso3 === state.selected);
  let nextIdx = curIdx + direction;
  if (nextIdx < 0) nextIdx = markets.length - 1;
  if (nextIdx >= markets.length) nextIdx = 0;
  openArticle(markets[nextIdx].iso3);
  selectMarket(markets[nextIdx].iso3, false);
}

/* Theme-Aware Vibrant Heatmap Palettes */
function getThemePalette(theme) {
  switch (theme) {
    case "ops":
      return ["#163820", "#235c34", "#388e3c", "#76c043", "#b7ff65", "#ffaa00", "#ff3333"];
    case "satellite":
      return ["#034078", "#0077b6", "#00b4d8", "#48cae4", "#00f5a0", "#ffd166", "#ef476f"];
    case "field":
      return ["#1e3a8a", "#0284c7", "#0d9488", "#10b981", "#f59e0b", "#f43f5e", "#e11d48"];
    case "cyberpunk":
      return ["#3b0764", "#6b21a8", "#a855f7", "#ec4899", "#ff2a85", "#00f0ff", "#ffe600"];
    case "briefing":
    default:
      return ["#38bdf8", "#06b6d4", "#10b981", "#eab308", "#f97316", "#ef4444"];
  }
}

function getScoreColorScale(values) {
  const extent = d3.extent(values);
  const min = extent[0] !== undefined ? extent[0] : 0;
  const max = extent[1] !== undefined ? extent[1] : 10;
  const domain = min === max ? [min - 1, max + 1] : [min, max];
  const palette = getThemePalette(state.theme);
  return d3.scaleSequential()
    .domain(domain)
    .interpolator(d3.interpolateRgbBasis(palette));
}

function updateLegend(values) {
  const extent = d3.extent(values);
  const min = extent[0] !== undefined ? extent[0] : 0;
  const max = extent[1] !== undefined ? extent[1] : 10;
  const q1 = min + (max - min) * 0.25;
  const mid = min + (max - min) * 0.5;
  const q3 = min + (max - min) * 0.75;

  const isEf = state.metric === "ef_2025";
  const fmt = v => isEf ? Math.round(v) : v.toFixed(1);

  $("legendMin").textContent = fmt(min);
  $("legendQ1").textContent = fmt(q1);
  $("legendMid").textContent = fmt(mid);
  $("legendQ3").textContent = fmt(q3);
  $("legendMax").textContent = fmt(max);

  const palette = getThemePalette(state.theme);
  $("legendBar").style.background = `linear-gradient(90deg, ${palette.join(", ")})`;

  // Pointer position for selected country
  const selectedMarket = markets.find(m => m.iso3 === state.selected);
  if (selectedMarket && min !== max) {
    const curVal = metricValue(selectedMarket);
    const pct = Math.max(0, Math.min(100, ((curVal - min) / (max - min)) * 100));
    $("legendPointer").style.left = `${pct}%`;
    $("legendPointer").style.display = "block";
  } else {
    $("legendPointer").style.display = "none";
  }
}

function renderMap() {
  if (!mapPaths || !worldGeoFeatures.length) return;
  const shown = matchingMarkets();
  const shownIds = new Set(shown.map(m => m.iso3));
  const byIso = new Map(markets.map(m => [m.iso3, m]));
  const values = shown.map(metricValue);
  const colorScale = getScoreColorScale(values);

  mapPaths
    .classed("market", f => byIso.has(f.properties.id))
    .classed("dimmed", f => byIso.has(f.properties.id) && !shownIds.has(f.properties.id))
    .classed("selected", f => f.properties.id === state.selected)
    .transition().duration(250)
    .style("fill", f => {
      const market = byIso.get(f.properties.id);
      if (!market) return null; // Uses CSS .country.base (var(--map-land))
      if (!shownIds.has(market.iso3)) return null;
      return colorScale(metricValue(market));
    });

  updateLegend(values);
  renderKPIs(shown);
}

function renderKPIs(shown) {
  $("kpiShownCount").textContent = shown.length;
  $("kpiMetricName").textContent = metricLabel();

  const sorted = shown.slice().sort((a, b) => metricValue(b) - metricValue(a));
  const leader = sorted[0];
  if (leader) {
    $("kpiLeader").textContent = `Top: ${leader.country} (${metricValue(leader)}${state.metric === "ef_2025" ? "" : " / 10"})`;
  } else {
    $("kpiLeader").textContent = "—";
  }

  const selectedMarket = markets.find(m => m.iso3 === state.selected);
  if (selectedMarket) {
    $("kpiSelectedCountry").textContent = `${selectedMarket.country} ${flag(selectedMarket.iso3)}`;
    $("kpiSelectedRoute").textContent = selectedMarket.status;
  }
}

function renderDetail() {
  const market = markets.find(m => m.iso3 === state.selected);
  if (!market) {
    $("marketDetail").hidden = true;
    $("emptyDetail").hidden = false;
    return;
  }

  const def = data.application.metric_definitions[state.metric];
  const curVal = metricValue(market);
  const isCompared = state.compare.includes(market.iso3);

  const dimensionRows = COMPARE_KEYS.map(k => {
    const val = market.ratings[k];
    const pct = val * 10;
    return `
      <div class="dimension-row">
        <span class="dim-label">${esc(RATING_LABELS[k])}</span>
        <div class="dim-track"><div class="dim-fill" style="width: ${pct}%;"></div></div>
        <span class="dim-val">${val}</span>
      </div>`;
  }).join("");

  const sourcesMarkup = market.sources.map(ref => {
    const s = sourceFor(ref);
    return `<a class="source-pill" href="${esc(s.url)}" target="_blank" rel="noreferrer" title="${esc(s.use)}">🔗 ${esc(s.id.replaceAll("_", " "))} ↗</a>`;
  }).join("");

  $("marketDetail").innerHTML = `
    <div class="detail-header">
      <div class="detail-title">
        <span class="detail-flag">${flag(market.iso3)}</span>
        <div>
          <h3>${esc(market.country)}</h3>
          <p>${esc(market.cluster)} · ISO: <strong>${esc(market.iso3)}</strong></p>
        </div>
      </div>
      <span class="route-badge">${esc(market.status)}</span>
    </div>

    <!-- Active Metric Spotlight -->
    <div class="metric-spotlight">
      <div class="spotlight-info">
        <h4>${esc(def.label)}</h4>
        <p>${esc(def.higher_is)}</p>
      </div>
      <div class="spotlight-score">${esc(curVal)}${state.metric === "ef_2025" ? "" : "<span style='font-size:16px;font-weight:600;color:var(--muted)'>/10</span>"}</div>
    </div>

    <!-- 6 Assessment Dimensions -->
    <div class="info-block">
      <h4>Evaluation Dimensions</h4>
      <div class="detail-dimensions">
        ${dimensionRows}
        <div class="dimension-row" style="margin-top:4px;">
          <span class="dim-label">🛡️ Evidence Conf.</span>
          <div class="dim-track"><div class="dim-fill" style="width: ${market.ratings.evidence_confidence * 10}%; background: var(--accent-2);"></div></div>
          <span class="dim-val">${market.ratings.evidence_confidence}</span>
        </div>
      </div>
    </div>

    <!-- Commercial Deep Dive -->
    <div class="info-block">
      <h4>🎯 Target Role & Outcome</h4>
      <p>${esc(market.target)}</p>
    </div>

    <div class="info-block">
      <h4>💳 Likely Payer Reality</h4>
      <p>${esc(market.buyer)}</p>
    </div>

    <div class="info-block">
      <h4>⚔️ Incumbent Supply & Risk</h4>
      <p style="margin-bottom:6px;"><strong>Supply:</strong> ${esc(market.supply)}</p>
      <p><strong>Main Risk:</strong> ${esc(market.risk)}</p>
    </div>

    <div class="info-block">
      <h4>📚 Verified Evidence Sources</h4>
      <div class="source-pills">${sourcesMarkup}</div>
    </div>

    <div class="detail-actions">
      <button id="compareBtn" class="btn ${isCompared ? 'btn-primary' : ''}" type="button">
        ${isCompared ? "✓ Compared" : "+ Compare"}
      </button>
      <button id="exportCountryBtn" class="btn" type="button">
        📥 Export (.json)
      </button>
    </div>
    <button id="openArticleBtn" class="btn btn-primary" style="width:100%;margin-top:8px;" type="button">
      📖 Read Full Market Dossier & Blueprint
    </button>
  `;

  $("emptyDetail").hidden = true;
  $("marketDetail").hidden = false;

  $("openArticleBtn").addEventListener("click", () => openArticle(market.iso3));
  $("compareBtn").addEventListener("click", () => toggleCompare(market.iso3));
  $("exportCountryBtn").addEventListener("click", () => {
    download(`esl-market-${market.iso3.toLowerCase()}.json`, JSON.stringify(market, null, 2), "application/json");
  });
}

function renderTable() {
  let list = matchingMarkets().slice();
  $("thMetricLabel").textContent = metricLabel();

  list.sort((a, b) => {
    let va, vb;
    switch (state.sortKey) {
      case "country": va = a.country; vb = b.country; break;
      case "status": va = a.status; vb = b.status; break;
      case "demand": va = a.ratings.demand; vb = b.ratings.demand; break;
      case "paid": va = a.ratings.paid_conversion; vb = b.ratings.paid_conversion; break;
      case "b2b": va = a.ratings.distribution; vb = b.ratings.distribution; break;
      case "whitespace": va = a.ratings.whitespace; vb = b.ratings.whitespace; break;
      case "evidence": va = a.ratings.evidence_confidence; vb = b.ratings.evidence_confidence; break;
      case "currentMetric":
      default:
        va = metricValue(a); vb = metricValue(b); break;
    }
    if (typeof va === "string") {
      return state.sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return state.sortAsc ? va - vb : vb - va;
  });

  $("marketRows").innerHTML = list.map(m => {
    const curVal = metricValue(m);
    const isCompared = state.compare.includes(m.iso3);
    const isSelected = m.iso3 === state.selected;
    return `
      <tr class="${isSelected ? 'tr-selected' : ''}">
        <td>
          <div class="td-country" data-select="${m.iso3}">
            <span style="font-size:18px;">${flag(m.iso3)}</span>
            <div>
              <strong>${esc(m.country)}</strong>
              <div style="font-size:11px;color:var(--muted);">${esc(m.cluster)}</div>
            </div>
          </div>
        </td>
        <td><span class="td-route">${esc(m.status)}</span></td>
        <td class="td-score td-current">${esc(curVal)}</td>
        <td class="td-score">${m.ratings.demand}</td>
        <td class="td-score">${m.ratings.paid_conversion}</td>
        <td class="td-score">${m.ratings.distribution}</td>
        <td class="td-score">${m.ratings.whitespace}</td>
        <td class="td-score">${m.ratings.evidence_confidence}</td>
        <td>
          <button class="btn-mini ${isCompared ? 'active' : ''}" data-compare="${m.iso3}" type="button">
            ${isCompared ? "Added" : "+ Compare"}
          </button>
          <button class="btn-mini" data-read-article="${m.iso3}" type="button" title="Read Market Dossier">📖</button>
        </td>
      </tr>`;
  }).join("") || `<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--muted);">No markets match current filters.</td></tr>`;

  document.querySelectorAll("[data-select]").forEach(el => {
    el.addEventListener("click", () => selectMarket(el.dataset.select, true));
  });

  document.querySelectorAll("[data-compare]").forEach(el => {
    el.addEventListener("click", () => toggleCompare(el.dataset.compare));
  });

  document.querySelectorAll("[data-read-article]").forEach(el => {
    el.addEventListener("click", () => openArticle(el.dataset.readArticle));
  });
}

function renderWatchlist() {
  $("watchlist").innerHTML = data.application.honorable_mentions.map(w => `
    <li>
      <strong>${flag(w.iso3)} ${esc(w.country)} <span class="route-badge">${esc(w.iso3)}</span></strong>
      <span>${esc(w.why)}</span>
    </li>
  `).join("");
}

function renderCompare() {
  const selected = state.compare.map(iso => markets.find(m => m.iso3 === iso)).filter(Boolean);
  $("compareSection").hidden = selected.length === 0;

  $("comparisonGrid").innerHTML = selected.map(m => {
    const bars = COMPARE_KEYS.map(k => `
      <div class="dimension-row" style="margin-bottom:5px;">
        <span class="dim-label" style="width:85px;font-size:11px;">${esc(RATING_LABELS[k])}</span>
        <div class="dim-track"><div class="dim-fill" style="width: ${m.ratings[k] * 10}%;"></div></div>
        <span class="dim-val" style="font-size:11px;">${m.ratings[k]}</span>
      </div>`).join("");

    return `
      <article class="comparison-card">
        <header>
          <h4>${flag(m.iso3)} ${esc(m.country)}</h4>
          <button class="btn-mini" data-remove-compare="${m.iso3}" type="button">✕</button>
        </header>
        <div class="comp-route">${esc(m.status)}</div>
        <div style="margin-bottom:12px;">${bars}</div>
        <button class="btn btn-mini" style="width:100%;" data-select="${m.iso3}" type="button">Inspect Market</button>
      </article>`;
  }).join("");

  document.querySelectorAll("[data-remove-compare]").forEach(btn => {
    btn.addEventListener("click", () => toggleCompare(btn.dataset.removeCompare));
  });
  document.querySelectorAll(".comparison-card [data-select]").forEach(btn => {
    btn.addEventListener("click", () => selectMarket(btn.dataset.select, true));
  });
}

function toggleCompare(iso) {
  if (state.compare.includes(iso)) {
    state.compare = state.compare.filter(x => x !== iso);
  } else if (state.compare.length < 3) {
    state.compare.push(iso);
  } else {
    alert("You can compare up to 3 markets simultaneously.");
    return;
  }
  renderCompare();
  renderTable();
  renderDetail();
}

function selectMarket(iso, scroll = false) {
  state.selected = iso;
  renderMap();
  renderDetail();
  renderTable();
  if (scroll) {
    $("detailPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function setMetric(metricKey) {
  state.metric = metricKey;
  const def = data.application.metric_definitions[metricKey];
  $("metricTitle").textContent = def.label;
  $("metricDefinition").textContent = def.higher_is;
  $("metricTypeBadge").textContent = (def.type || "ASSESSED").toUpperCase();

  document.querySelectorAll(".metric-chip").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.metric === metricKey);
  });

  renderMap();
  renderTable();
  renderDetail();
}

function setTheme(themeKey) {
  state.theme = themeKey;
  document.body.dataset.theme = themeKey;

  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.theme === themeKey);
  });

  renderMap();
}

function setupEvents() {
  // Theme Buttons
  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", () => setTheme(btn.dataset.theme));
  });

  // Metric Chips
  document.querySelectorAll(".metric-chip").forEach(chip => {
    chip.addEventListener("click", () => setMetric(chip.dataset.metric));
  });

  // Cluster Filter Tabs
  document.querySelectorAll(".cluster-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".cluster-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      state.cluster = tab.dataset.cluster;
      renderMap();
      renderTable();
      renderKPIs(matchingMarkets());
    });
  });

  // Search Input
  $("searchInput").addEventListener("input", e => {
    state.query = e.target.value;
    renderMap();
    renderTable();
    renderKPIs(matchingMarkets());
  });

  // Export
  $("exportButton").addEventListener("click", () => {
    download("esl-atlas-filtered-markets.json", JSON.stringify({
      exported_at: new Date().toISOString(),
      metric: state.metric,
      filters: { cluster: state.cluster, query: state.query },
      markets: matchingMarkets()
    }, null, 2), "application/json");
  });

  // Read Mode Header & Modal Navigation
  $("readModeHeaderBtn").addEventListener("click", () => openArticle(state.selected));
  $("closeArticleBtn").addEventListener("click", closeArticle);
  $("articlePrevBtn").addEventListener("click", () => navArticle(-1));
  $("articleNextBtn").addEventListener("click", () => navArticle(1));
  $("articleModal").addEventListener("click", e => {
    if (e.target === $("articleModal")) closeArticle();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && $("articleModal").classList.contains("open")) {
      closeArticle();
    }
  });

  $("clearCompare").addEventListener("click", () => {
    state.compare = [];
    renderCompare();
    renderTable();
    renderDetail();
  });

  // Table Column Sort
  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (state.sortKey === key) {
        state.sortAsc = !state.sortAsc;
      } else {
        state.sortKey = key;
        state.sortAsc = false;
      }
      renderTable();
    });
  });
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showTooltip(event, f) {
  const market = markets.find(m => m.iso3 === f.properties.id);
  if (!market || !matchingMarkets().some(m => m.iso3 === market.iso3)) return;
  const tip = $("mapTooltip");
  tip.innerHTML = `
    <strong>${flag(market.iso3)} ${esc(market.country)}</strong>
    <div>${esc(metricLabel())}: <span class="tip-val">${metricValue(market)}${state.metric === "ef_2025" ? "" : " / 10"}</span></div>
    <div style="font-size:11px;color:var(--muted);">${esc(market.status)}</div>
  `;
  tip.hidden = false;
  moveTooltip(event);
}

function moveTooltip(event) {
  const box = $("mapWrap").getBoundingClientRect();
  const tip = $("mapTooltip");
  tip.style.left = Math.min(event.clientX - box.left + 14, box.width - 220) + "px";
  tip.style.top = Math.max(16, event.clientY - box.top - 20) + "px";
}

function hideTooltip() {
  $("mapTooltip").hidden = true;
}

async function createMap() {
  mapSvg = d3.select("#worldMap");
  try {
    const res = await fetch("./world-countries-geo.json");
    if (!res.ok) throw new Error("Could not load world map geojson");
    const geoData = await res.json();
    worldGeoFeatures = geoData.features;

    const width = $("mapWrap").clientWidth || 860;
    const height = $("mapWrap").clientHeight || 520;

    activeProjection = d3.geoNaturalEarth1().fitExtent([[14, 14], [width - 14, height - 14]], {
      type: "FeatureCollection",
      features: worldGeoFeatures
    });

    const geoPath = d3.geoPath(activeProjection);
    mapSvg.attr("viewBox", `0 0 ${width} ${height}`);

    mapLayer = mapSvg.append("g").attr("class", "map-countries");

    mapPaths = mapLayer.selectAll("path")
      .data(worldGeoFeatures)
      .join("path")
      .attr("class", "country base")
      .attr("d", geoPath)
      .on("mouseenter", (event, f) => showTooltip(event, f))
      .on("mousemove", moveTooltip)
      .on("mouseleave", hideTooltip)
      .on("click", (event, f) => {
        const iso = f.properties.id;
        if (markets.some(m => m.iso3 === iso)) {
          selectMarket(iso, true);
        }
      });

    zoomBehavior = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", event => {
        mapLayer.attr("transform", event.transform);
      });

    mapSvg.call(zoomBehavior);

    $("zoomIn").addEventListener("click", () => mapSvg.transition().duration(250).call(zoomBehavior.scaleBy, 1.45));
    $("zoomOut").addEventListener("click", () => mapSvg.transition().duration(250).call(zoomBehavior.scaleBy, 0.7));
    $("zoomReset").addEventListener("click", () => mapSvg.transition().duration(250).call(zoomBehavior.transform, d3.zoomIdentity));

    new ResizeObserver(() => resizeMap()).observe($("mapWrap"));
    renderMap();
  } catch (error) {
    console.error("Map initialization error:", error);
    $("mapWrap").innerHTML = `<div class="detail-empty"><div class="detail-orb">!</div><h3>Map failed to load</h3><p>${esc(error.message)}</p></div>`;
  }
}

function resizeMap() {
  if (!mapPaths || !worldGeoFeatures.length) return;
  const width = $("mapWrap").clientWidth || 860;
  const height = $("mapWrap").clientHeight || 520;
  activeProjection = d3.geoNaturalEarth1().fitExtent([[14, 14], [width - 14, height - 14]], {
    type: "FeatureCollection",
    features: worldGeoFeatures
  });
  const geoPath = d3.geoPath(activeProjection);
  mapSvg.attr("viewBox", `0 0 ${width} ${height}`);
  mapPaths.attr("d", geoPath);
}

async function init() {
  let response;
  try {
    response = await fetch("/api/market-data");
    if (!response.ok) throw new Error();
  } catch {
    response = await fetch("./market-data.json");
  }
  if (!response.ok) throw new Error("Market intelligence pack could not be loaded");

  data = await response.json();
  markets = data.market_records;
  sourceIndex = new Map(data.global_sources.map(s => [s.id, s]));

  setupEvents();
  renderWatchlist();
  renderTable();
  renderDetail();
  renderCompare();
  await createMap();
}

init().catch(err => {
  console.error("Fatal startup error:", err);
  document.body.innerHTML = `<main class="app-shell"><h1>Global ESL Market Atlas</h1><p>Fatal error loading evidence pack.</p></main>`;
});
