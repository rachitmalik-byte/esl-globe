const d3 = window.d3;

const ISO2 = {
  IND:"IN",BGD:"BD",PAK:"PK",LKA:"LK",NPL:"NP",IDN:"ID",VNM:"VN",THA:"TH",MYS:"MY",PHL:"PH",
  SAU:"SA",ARE:"AE",EGY:"EG",MAR:"MA",TUR:"TR",TUN:"TN",MEX:"MX",COL:"CO",BRA:"BR",PER:"PE",
  CHL:"CL",ARG:"AR",ECU:"EC",NGA:"NG",ZAF:"ZA",KEN:"KE",JPN:"JP",KOR:"KR",CHN:"CN",UZB:"UZ",
  CRI:"CR",ROU:"RO",KAZ:"KZ",POL:"PL"
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

const COMPARE_KEYS = ["demand", "paid_conversion", "distribution", "whitespace", "delivery", "feasibility", "evidence_confidence"];

const DIMENSION_META = {
  demand: {
    title: "Outcome Demand",
    icon: "💼",
    weight: "30% Weight",
    weightNum: 0.30,
    definition: "Urgent, career-critical necessity of professional spoken English for domestic employment, corporate promotion, MNC hiring, and IT/BPO outsourcing.",
    metricsTracked: "BPO / tech outsourcing sector scale, MNC white-collar employment, bilingual hiring salary differentials (2–4× wage jump).",
    rubric: {
      high: "8–10: English directly unlocks 2–4× higher salaries or is mandatory for tech/BPO hiring. Severe career penalty for non-fluency.",
      mid: "5–7: Valued in corporate management and multinational hubs, but large domestic economy operates in local language.",
      low: "1–4: English is primarily academic or recreational with negligible immediate wage return in local job market."
    }
  },
  paid_conversion: {
    title: "Paid Conversion",
    icon: "💳",
    weight: "20% Weight",
    weightNum: 0.20,
    definition: "Capacity and demonstrated willingness to pay recurring monthly SaaS subscription fees ($15–$100+/mo) rather than relying exclusively on free ad-supported apps.",
    metricsTracked: "Digital payment & credit card penetration, recurring subscription adoption (Netflix/Spotify/SaaS ARPU), disposable income per capita.",
    rubric: {
      high: "8–10: Established consumer subscription culture ($15–$100+/mo), high card penetration, corporate L&D subsidies readily accessible.",
      mid: "5–7: Willing to pay for guaranteed outcomes or one-off exam prep ($5–$25), but high price sensitivity to recurring auto-renewals.",
      low: "1–4: High tolerance for ads; default expectation of free digital content (YouTube/freemium apps); friction on recurring billing."
    }
  },
  distribution: {
    title: "Distribution / B2B Fit",
    icon: "🏢",
    weight: "20% Weight",
    weightNum: 0.20,
    definition: "Access to scalable institutional channels (enterprises, university placement cells, BPO academies) to acquire learners efficiently without high consumer ad CAC.",
    metricsTracked: "Corporate training market maturity, BPO corporate training spend, university-to-corporate hiring pipelines.",
    rubric: {
      high: "8–10: Receptive enterprise L&D buyers, formal procurement channels, staffing agencies eager to co-finance upskilling.",
      mid: "5–7: Semi-receptive corporate training market, but fragmented procurement cycles and relationship-heavy sales.",
      low: "1–4: Atomized consumer-only market; minimal enterprise training spend; extreme dependence on Meta/Google paid social ads."
    }
  },
  whitespace: {
    title: "Whitespace Gap",
    icon: "🧭",
    weight: "15% Weight",
    weightNum: 0.15,
    definition: "Market room for a differentiated, role-specific spoken voice AI product against incumbents and direct substitutes.",
    metricsTracked: "Voice AI competitor density, 1-on-1 human tutoring market share, offline cram school market structure.",
    rubric: {
      high: "8–10: Unserved voice AI greenfield; dominated by legacy grammar test crammers with no interactive spoken roleplay.",
      mid: "5–7: Moderate competition from 1-on-1 human tutoring platforms (Cambly, NativeCamp), but voice AI roleplay remains differentiated.",
      low: "1–4: Saturated red ocean with aggressive funded voice AI competitors (e.g. Speak, Elsa, Duolingo Max) heavily bidding on ads."
    }
  },
  delivery: {
    title: "Digital Delivery",
    icon: "⚡",
    weight: "10% Weight",
    weightNum: 0.10,
    definition: "Network and technological infrastructure quality for real-time, low-latency (<800ms) WebRTC voice interaction and seamless checkout.",
    metricsTracked: "4G/5G mobile data coverage & reliability, WebRTC roundtrip latency, local instant payment rails (UPI, Pix, Apple Pay).",
    rubric: {
      high: "8–10: Ubiquitous high-speed 4G/5G, reliable <800ms WebRTC voice turnaround, seamless 1-click mobile checkout.",
      mid: "5–7: Good connectivity in major metros, but occasional audio latency spikes or payment drop-offs in secondary cities.",
      low: "1–4: High mobile data costs, spotty coverage outside capital, audio streaming lag, cumbersome payment checkout."
    }
  },
  feasibility: {
    title: "Operating Feasibility",
    icon: "⚖️",
    weight: "5% Weight",
    weightNum: 0.05,
    definition: "Practical ease of localizing voice recognition models, complying with local digital taxation, data sovereignty, and foreign remittances.",
    metricsTracked: "Local accent acoustic diversity, data privacy/localization laws, cross-border remittance taxes, entity setup requirements.",
    rubric: {
      high: "8–10: Frictionless cross-border SaaS operation, standard card processing, standard English dialect models work out-of-the-box.",
      mid: "5–7: Requires localized speech acoustic tuning (heavy L1 transfer / code-switching) or local digital services tax compliance.",
      low: "1–4: Strict data localization (must host in-country), stringent foreign exchange controls, or mandatory local joint venture."
    }
  },
  evidence_confidence: {
    title: "Evidence Confidence",
    icon: "🛡️",
    weight: "Diagnostic Index",
    weightNum: 0,
    definition: "Empirical verification depth and citation quality backing this dossier (e.g. primary enterprise interviews, statutory filings, census data vs desk proxies).",
    metricsTracked: "Independent primary citations, audited corporate filings, government labor statistics, multilateral reports.",
    rubric: {
      high: "8–10: Verified by primary corporate buyer interviews, statutory disclosures, and authoritative national economic data.",
      mid: "5–7: Sourced from reputable secondary industry reports (EF EPI, Statista, global bank research) and cross-regional comparisons.",
      low: "1–4: Inferred from regional proxies or preliminary desk assumptions. Requires field validation before committing capital."
    }
  }
};

const $ = id => document.getElementById(id);

const state = {
  metric: "launch_fit",
  cluster: "all",
  route: "all",
  scoreTier: "all",
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
    // Cluster / Region filter
    let matchCluster = true;
    if (state.cluster !== "all") {
      const c = state.cluster.toLowerCase();
      const mc = (m.cluster || "").toLowerCase();
      if (c === "mena / africa") {
        matchCluster = mc.includes("mena") || mc.includes("africa");
      } else {
        matchCluster = mc.includes(c);
      }
    }

    // Route filter
    let matchRoute = true;
    if (state.route !== "all") {
      const s = (m.status || "").toLowerCase();
      if (state.route === "enterprise") {
        matchRoute = s.includes("enterprise") || s.includes("premium");
      } else if (state.route === "nearshoring") {
        matchRoute = s.includes("nearshor") || s.includes("remote-work");
      } else if (state.route === "bpo") {
        matchRoute = s.includes("bpo") || s.includes("services");
      } else if (state.route === "validation") {
        matchRoute = s.includes("validation") || s.includes("home");
      } else {
        matchRoute = s.includes(state.route.toLowerCase());
      }
    }

    // Score Tier filter
    let matchScore = true;
    const fit = m.derived ? m.derived.launch_fit : 0;
    if (state.scoreTier === "tier1") {
      matchScore = fit >= 7.5;
    } else if (state.scoreTier === "tier2") {
      matchScore = fit >= 6.0 && fit < 7.5;
    } else if (state.scoreTier === "tier3") {
      matchScore = fit < 6.0;
    }

    // Confidence
    const matchConfidence = (m.ratings?.evidence_confidence ?? 0) >= state.minimumEvidence;

    // Search query
    const iso2Code = (ISO2[m.iso3] || "").toLowerCase();
    const matchQuery = !query || (m.country + " " + m.iso3 + " " + iso2Code + " " + m.cluster + " " + m.status + " " + m.buyer + " " + m.target).toLowerCase().includes(query);

    return matchCluster && matchRoute && matchScore && matchConfidence && matchQuery;
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

function renderScreeningScorecard(market) {
  const ratings = market.ratings || {};
  const fitScore = market.derived ? market.derived.launch_fit : 0;

  let tierLabel = "Tier 3: Watchlist";
  let tierClass = "tier-watchlist";
  if (fitScore >= 7.5) {
    tierLabel = "🟢 Tier 1: Priority Launch";
    tierClass = "tier-priority";
  } else if (fitScore >= 6.0) {
    tierLabel = "🟡 Tier 2: Selective Expansion";
    tierClass = "tier-selective";
  }

  const weightedKeys = ["demand", "paid_conversion", "distribution", "whitespace", "delivery", "feasibility"];

  const cardsHtml = weightedKeys.map(k => {
    const meta = DIMENSION_META[k];
    const score = ratings[k] ?? 0;
    const scoreColorClass = score >= 8 ? "score-high" : score >= 5 ? "score-mid" : "score-low";
    const fillColorClass = score >= 8 ? "fill-green" : score >= 5 ? "fill-amber" : "fill-rose";

    return `
      <article class="dimension-scorecard-card">
        <div class="scorecard-card-header">
          <div class="scorecard-card-title-group">
            <span class="dim-icon">${meta.icon}</span>
            <div>
              <div class="dim-title-row">
                <h4 class="dim-title">${esc(meta.title)}</h4>
                <span class="dim-weight-badge">${meta.weight}</span>
              </div>
              <p class="dim-definition">${esc(meta.definition)}</p>
            </div>
          </div>
          <div class="scorecard-score-box">
            <span class="score-number ${scoreColorClass}">${score}</span>
            <span class="score-denom">/ 10</span>
          </div>
        </div>

        <div class="score-bar-track">
          <div class="score-bar-fill ${fillColorClass}" style="width: ${score * 10}%;"></div>
        </div>

        <details class="rubric-details">
          <summary class="rubric-summary">
            <span>📐 View Metric Signals & Scoring Rubric</span>
            <span class="rubric-arrow">▾</span>
          </summary>
          <div class="rubric-content">
            <div class="rubric-signals">
              <strong>Metrics Evaluated:</strong> ${esc(meta.metricsTracked)}
            </div>
            <div class="rubric-tiers">
              <div class="rubric-tier tier-high">
                <span class="tier-tag">8–10 (High):</span>
                <span>${esc(meta.rubric.high)}</span>
              </div>
              <div class="rubric-tier tier-mid">
                <span class="tier-tag">5–7 (Moderate):</span>
                <span>${esc(meta.rubric.mid)}</span>
              </div>
              <div class="rubric-tier tier-low">
                <span class="tier-tag">1–4 (Low):</span>
                <span>${esc(meta.rubric.low)}</span>
              </div>
            </div>
          </div>
        </details>
      </article>
    `;
  }).join("");

  const confScore = ratings.evidence_confidence ?? 0;
  const confColorClass = confScore >= 8 ? "score-high" : confScore >= 5 ? "score-mid" : "score-low";
  const confFillClass = confScore >= 8 ? "fill-teal" : confScore >= 5 ? "fill-amber" : "fill-rose";
  const confMeta = DIMENSION_META.evidence_confidence;

  return `
    <div class="screening-section">
      <div class="screening-section-header">
        <div class="screening-header-text">
          <span class="eyebrow">SCREENING ASSESSMENT SCORECARD</span>
          <h3 class="screening-title">Strategic Launch Fit & Dimension Ratings</h3>
          <p class="screening-desc">Evaluated across 6 weighted operational dimensions to determine expansion viability, plus 1 diagnostic evidence confidence index.</p>
        </div>
        <button class="btn btn-mini open-methodology-btn" type="button">📊 Methodology & Terms Guide</button>
      </div>

      <!-- Formula & Live Score Callout -->
      <div class="formula-callout-card">
        <div class="formula-topline">
          <div>
            <span class="formula-label">COMPOSITE LAUNCH FIT SCORE</span>
            <div class="formula-score-big">${fitScore} <span class="formula-denom">/ 10</span></div>
          </div>
          <div class="formula-tier-badge ${tierClass}">${tierLabel}</div>
        </div>
        <div class="formula-equation">
          <div class="formula-math-header">Mathematical Weighting Formula:</div>
          <code class="formula-math">Fit = (0.30 × Demand) + (0.20 × Paid) + (0.20 × B2B) + (0.15 × Whitespace) + (0.10 × Delivery) + (0.05 × Feasibility)</code>
          <div class="formula-calculation">
            <strong>Substituted calculation for ${esc(market.country)}:</strong><br>
            <code>(${ratings.demand ?? 0} × 0.30) + (${ratings.paid_conversion ?? 0} × 0.20) + (${ratings.distribution ?? 0} × 0.20) + (${ratings.whitespace ?? 0} × 0.15) + (${ratings.delivery ?? 0} × 0.10) + (${ratings.feasibility ?? 0} × 0.05) = <strong>${fitScore} / 10</strong></code>
          </div>
        </div>
      </div>

      <!-- 6 Weighted Dimension Scorecards -->
      <div class="scorecards-grid">
        ${cardsHtml}
      </div>

      <!-- Evidence Confidence Diagnostic Card -->
      <div class="confidence-diagnostic-card">
        <div class="confidence-topline">
          <div class="confidence-info">
            <span class="dim-icon">${confMeta.icon}</span>
            <div>
              <div class="dim-title-row">
                <h4 class="dim-title">${esc(confMeta.title)} (Empirical Verification Rigor)</h4>
                <span class="dim-weight-badge badge-diagnostic">${confMeta.weight}</span>
              </div>
              <p class="dim-definition">${esc(confMeta.definition)}</p>
            </div>
          </div>
          <div class="confidence-score-badge">
            <span class="score-number ${confColorClass}">${confScore}</span>
            <span class="score-denom">/ 10</span>
          </div>
        </div>
        <div class="score-bar-track">
          <div class="score-bar-fill ${confFillClass}" style="width: ${confScore * 10}%;"></div>
        </div>
        <details class="rubric-details">
          <summary class="rubric-summary">
            <span>📐 View Evidence Verification Benchmarks</span>
            <span class="rubric-arrow">▾</span>
          </summary>
          <div class="rubric-content">
            <div class="rubric-signals">
              <strong>Metrics Evaluated:</strong> ${esc(confMeta.metricsTracked)}
            </div>
            <div class="rubric-tiers">
              <div class="rubric-tier tier-high">
                <span class="tier-tag">8–10 (High):</span>
                <span>${esc(confMeta.rubric.high)}</span>
              </div>
              <div class="rubric-tier tier-mid">
                <span class="tier-tag">5–7 (Moderate):</span>
                <span>${esc(confMeta.rubric.mid)}</span>
              </div>
              <div class="rubric-tier tier-low">
                <span class="tier-tag">1–4 (Low):</span>
                <span>${esc(confMeta.rubric.low)}</span>
              </div>
            </div>
          </div>
        </details>
        <div class="confidence-note">
          💡 <em>Analytical Guardrail:</em> Evidence Confidence is kept strictly separate from Launch Fit so high-potential markets with early-stage data are flagged for validation interviews rather than unfairly penalized.
        </div>
      </div>
    </div>
  `;
}

function renderMethodologyContent() {
  return `
    <div class="methodology-section">
      <span class="eyebrow">STRATEGIC PREMISE & THESIS</span>
      <h3>🎯 Purpose: AI-First Spoken English with Teacher Escalation</h3>
      <p>
        The <strong>Global ESL Market Atlas</strong> screens 30 high-priority international markets to evaluate their suitability for launching an <strong>AI-first spoken-English learning platform with optional human mentor escalation</strong>.
      </p>
      <div class="guardrail-box">
        <h4>⚠️ The Vanity Metric Trap: Downloads ≠ Willingness to Pay</h4>
        <p>
          Consumer language learning apps often report massive download volumes in emerging markets. However, high app store installs and poor national fluency do <strong>not</strong> prove consumer subscription willingness. Users in price-sensitive geographies frequently churn after free trials or rely exclusively on ad-supported freemium tiers. This Atlas evaluates commercial monetization reality, not vanity engagement.
        </p>
      </div>
      <p>
        <strong>Why Spoken English?</strong> Fluency and confidence in professional settings (interviews, MNC client meetings, engineering standups) cannot be acquired through passive multiple-choice quizzes (Duolingo style) or rote grammar translation. Our model leverages voice AI to handle 85%+ of situational roleplay, accent tuning, and fluency drills at near-zero marginal cost, while reserving live human mentors for high-stakes interview prep and executive escalations.
      </p>
    </div>

    <div class="methodology-section">
      <span class="eyebrow">MATHEMATICAL MODEL</span>
      <h3>📐 Composite Launch Fit Formula & Strategic Tiers</h3>
      <p>
        Every market is scored from <strong>1 to 10</strong> across six weighted operational dimensions. The Composite Launch Fit score synthesizes economic necessity, purchasing power, and channel scalability:
      </p>
      <div class="formula-equation" style="margin: 16px 0;">
        <code class="formula-math">Composite Launch Fit = (0.30 × Demand) + (0.20 × Paid Conversion) + (0.20 × Distribution) + (0.15 × Whitespace) + (0.10 × Delivery) + (0.05 × Feasibility)</code>
      </div>
      <div class="methodology-grid">
        <div class="methodology-card">
          <div class="methodology-card-header">
            <h4>🟢 Tier 1: Priority Launch</h4>
            <span class="formula-tier-badge tier-priority">Score ≥ 7.5</span>
          </div>
          <p>Exceptional convergence of urgent job-driven need, established subscription buying power, and viable B2B distribution rails. Immediate priority for market entry, localized pilots, and GTM spend.</p>
        </div>
        <div class="methodology-card">
          <div class="methodology-card-header">
            <h4>🟡 Tier 2: Selective Expansion</h4>
            <span class="formula-tier-badge tier-selective">Score 6.0 – 7.4</span>
          </div>
          <p>Strong underlying demand but gated by specific operational hurdles (e.g., lower D2C price tolerance, intense local competitors, or need for localized voice acoustic tuning). Best approached via corporate partnerships.</p>
        </div>
        <div class="methodology-card">
          <div class="methodology-card-header">
            <h4>⚪ Tier 3: Watchlist / Opportunistic</h4>
            <span class="formula-tier-badge tier-watchlist">Score &lt; 6.0</span>
          </div>
          <p>Unfavorable commercial unit economics: prohibitive consumer acquisition CAC, high digital payment friction, or strict foreign exchange / digital services tax penalties. Monitored for regulatory inflection points.</p>
        </div>
      </div>
    </div>

    <div class="methodology-section">
      <span class="eyebrow">METRIC GLOSSARY & RUBRIC</span>
      <h3>📊 The 7 Evaluation Dimensions & Scoring Criteria</h3>
      <p>
        Ratings are assigned by research analysts utilizing public verified datasets, corporate financial disclosures, and primary enterprise interviews.
      </p>
      <div class="methodology-grid">
        <div class="methodology-card">
          <div class="methodology-card-header">
            <h4>💼 Outcome Demand</h4>
            <span class="dim-weight-badge">30% Weight</span>
          </div>
          <p><strong>Definition:</strong> Urgent economic necessity of professional spoken English for job placement, corporate promotions, MNC hiring, and IT/BPO outsourcing.</p>
          <div class="methodology-rubric-mini">
            <strong>Rubric:</strong><br>
            • <strong>8–10:</strong> Mandatory for hiring; unlocks 2–4× wage jump.<br>
            • <strong>5–7:</strong> Career advantage in MNCs; local language still dominates.<br>
            • <strong>1–4:</strong> Purely academic or recreational; negligible wage lift.<br>
            <strong>Signals:</strong> BPO headcount, multinational hiring, bilingual wage differentials.
          </div>
        </div>

        <div class="methodology-card">
          <div class="methodology-card-header">
            <h4>💳 Paid Conversion</h4>
            <span class="dim-weight-badge">20% Weight</span>
          </div>
          <p><strong>Definition:</strong> Proven consumer and enterprise willingness to pay recurring monthly subscription fees ($15–$100+/mo) rather than relying on free ad-supported apps.</p>
          <div class="methodology-rubric-mini">
            <strong>Rubric:</strong><br>
            • <strong>8–10:</strong> Routine SaaS subscription habit; high credit card penetration.<br>
            • <strong>5–7:</strong> Willing to pay one-time fees ($5–$25); churn risk on auto-renewal.<br>
            • <strong>1–4:</strong> Default expectation of free learning; pirated/YouTube materials.<br>
            <strong>Signals:</strong> EdTech ARPU benchmarks, digital payment adoption, disposable income.
          </div>
        </div>

        <div class="methodology-card">
          <div class="methodology-card-header">
            <h4>🏢 Distribution / B2B Fit</h4>
            <span class="dim-weight-badge">20% Weight</span>
          </div>
          <p><strong>Definition:</strong> Access to scalable institutional channels (enterprises, universities, placement agencies) to bypass high consumer ad CAC.</p>
          <div class="methodology-rubric-mini">
            <strong>Rubric:</strong><br>
            • <strong>8–10:</strong> Centralized enterprise L&D budgets, university placement partnerships.<br>
            • <strong>5–7:</strong> Fragmented corporate training; long relationship-driven sales.<br>
            • <strong>1–4:</strong> Atomized consumer-only market; pure reliance on Meta/Google ads.<br>
            <strong>Signals:</strong> Corporate L&D spend, corporate English mandates, university-to-job pipelines.
          </div>
        </div>

        <div class="methodology-card">
          <div class="methodology-card-header">
            <h4>🧭 Whitespace Gap</h4>
            <span class="dim-weight-badge">15% Weight</span>
          </div>
          <p><strong>Definition:</strong> Room for an AI-first spoken English product without competing in an oversaturated red ocean against aggressive incumbents.</p>
          <div class="methodology-rubric-mini">
            <strong>Rubric:</strong><br>
            • <strong>8–10:</strong> Greenfield; incumbents only offer passive text/cram school prep.<br>
            • <strong>5–7:</strong> Human 1-on-1 tutoring exists; voice AI roleplay remains open.<br>
            • <strong>1–4:</strong> Saturated by heavily funded voice AI apps (Speak, Elsa, Duolingo Max).<br>
            <strong>Signals:</strong> Voice AI app store rankings, tutoring density, cram school penetration.
          </div>
        </div>

        <div class="methodology-card">
          <div class="methodology-card-header">
            <h4>⚡ Digital Delivery</h4>
            <span class="dim-weight-badge">10% Weight</span>
          </div>
          <p><strong>Definition:</strong> Mobile network speed and stability for sub-800ms WebRTC voice AI streaming and friction-free mobile checkout.</p>
          <div class="methodology-rubric-mini">
            <strong>Rubric:</strong><br>
            • <strong>8–10:</strong> Ubiquitous 4G/5G, sub-800ms voice turnaround, 1-click mobile payments.<br>
            • <strong>5–7:</strong> Metro connectivity is strong; occasional latency in Tier 2/3 cities.<br>
            • <strong>1–4:</strong> High data costs, frequent packet loss, severe checkout drop-offs.<br>
            <strong>Signals:</strong> Median mobile broadband speeds, WebRTC latency, instant payment rails.
          </div>
        </div>

        <div class="methodology-card">
          <div class="methodology-card-header">
            <h4>⚖️ Operating Feasibility</h4>
            <span class="dim-weight-badge">5% Weight</span>
          </div>
          <p><strong>Definition:</strong> Practical ease of speech recognition localization (accent tuning), data privacy compliance, foreign remittances, and corporate taxation.</p>
          <div class="methodology-rubric-mini">
            <strong>Rubric:</strong><br>
            • <strong>8–10:</strong> Frictionless cross-border SaaS operation, standard English ASR models.<br>
            • <strong>5–7:</strong> Requires local speech acoustic tuning or local digital services tax.<br>
            • <strong>1–4:</strong> Strict data localization laws, mandatory local entity, currency controls.<br>
            <strong>Signals:</strong> Ease of doing business, digital services tax (DST), ASR phonetic transfer.
          </div>
        </div>

        <div class="methodology-card" style="grid-column: 1 / -1; border-style: dashed;">
          <div class="methodology-card-header">
            <h4>🛡️ Evidence Confidence (Diagnostic Index)</h4>
            <span class="dim-weight-badge badge-diagnostic">Diagnostic (Not Weighted in Fit)</span>
          </div>
          <p><strong>Definition:</strong> Empirical verification rigor and citation coverage backing this country's market dossier. Kept independent from Launch Fit to avoid conflating data availability with market potential.</p>
          <div class="methodology-rubric-mini">
            <strong>Rubric:</strong><br>
            • <strong>8–10:</strong> Verified by primary corporate buyer interviews, audited financial disclosures, and official national census data.<br>
            • <strong>5–7:</strong> Sourced from reputable secondary industry research (EF EPI, World Bank, Statista, local trade body reports).<br>
            • <strong>1–4:</strong> Extrapolated from regional proxies or preliminary desk assumptions. Requires field validation before capital allocation.
          </div>
        </div>
      </div>
    </div>

    <div class="methodology-section">
      <span class="eyebrow">DATA INTEGRITY & GUARDRAILS</span>
      <h3>🛡️ Critical Research Guardrails</h3>
      <div class="guardrail-box">
        <h4>1. Why EF EPI is NOT National English Fluency</h4>
        <p>
          The <strong>EF English Proficiency Index (EF EPI)</strong> is an unrepresentative, self-selected internet test taken by individuals who choose to take an online test. It does <strong>not</strong> measure true national workforce fluency or commercial market size. In fact, countries with low EF EPI scores (e.g., India, Japan, Mexico) often represent the <em>highest</em> commercial demand because working professionals urgently need spoken English to qualify for multinational careers.
        </p>
      </div>
      <div class="guardrail-box">
        <h4>2. Strict Zero-Hallucination Policy on Competitor CAC & Conversion</h4>
        <p>
          Competitor customer acquisition cost (CAC), LTV/CAC ratios, and app conversion rates are closely guarded proprietary data. This Atlas adheres to a strict policy: <strong>we do not invent or hallucinate private competitor metrics</strong>. Where public first-party evidence is absent, we explicitly state that the metric is unobserved and evaluate proxy willingness-to-pay signals instead.
        </p>
      </div>
      <div class="guardrail-box">
        <h4>3. B2B / Institutional Channel Insulation</h4>
        <p>
          Consumer digital ad auctions on Meta and Google have become prohibitively expensive for language apps, with Blended CACs often exceeding $60–$120 in competitive markets. By prioritizing B2B corporate training contracts and university placement partnerships, expansion capital is preserved and customer retention is reinforced by employer mandates.
        </p>
      </div>
    </div>
  `;
}

function openMethodologyModal() {
  const body = $("methodologyBody");
  if (body && !body.innerHTML.trim()) {
    body.innerHTML = renderMethodologyContent();
  }
  const modal = $("methodologyModal");
  if (modal) {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
}

function closeMethodologyModal() {
  const modal = $("methodologyModal");
  if (modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (!$("articleModal").classList.contains("open")) {
      document.body.style.overflow = "";
    }
  }
}

function parseMarkdownToHtml(md, market) {
  if (!md) return "<p>Detailed executive dossier not found for this market.</p>";
  const lines = md.split("\n");
  let html = "";
  let inList = false;
  let inTable = false;
  let inScreeningSection = false;

  for (let line of lines) {
    line = line.trim();
    if (!line) {
      if (inList) { html += inList === "ol" ? "</ol>" : "</ul>"; inList = false; }
      if (inTable) { html += "</tbody></table>"; inTable = false; }
      continue;
    }

    if (line.toLowerCase().startsWith("## screening assessment")) {
      if (inList) { html += inList === "ol" ? "</ol>" : "</ul>"; inList = false; }
      if (inTable) { html += "</tbody></table>"; inTable = false; }
      if (market) {
        html += renderScreeningScorecard(market);
        inScreeningSection = true;
        continue;
      }
    }

    if (inScreeningSection) {
      if (line.startsWith("#")) {
        inScreeningSection = false;
      } else {
        // Skip raw markdown table & boilerplate since scorecard rendered everything with full context
        continue;
      }
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

  $("articleBody").innerHTML = parseMarkdownToHtml(market.dossier_markdown, market);

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
  if ($("kpiShownCount")) $("kpiShownCount").textContent = shown.length;
  if ($("kpiMetricName")) $("kpiMetricName").textContent = metricLabel();

  const sorted = shown.slice().sort((a, b) => metricValue(b) - metricValue(a));
  const leader = sorted[0];
  if (leader && $("kpiLeader")) {
    $("kpiLeader").textContent = `Top: ${leader.country} (${metricValue(leader)}${state.metric === "ef_2025" ? "" : " / 10"}) ▾`;
  } else if ($("kpiLeader")) {
    $("kpiLeader").textContent = "—";
  }

  const selectedMarket = markets.find(m => m.iso3 === state.selected);
  if (selectedMarket) {
    const iso2Code = ISO2[selectedMarket.iso3] || selectedMarket.iso3;
    if ($("kpiSelectedCountry")) $("kpiSelectedCountry").textContent = `${selectedMarket.country} (${iso2Code})`;
    if ($("kpiSelectedRoute")) $("kpiSelectedRoute").textContent = `${flag(selectedMarket.iso3)} ${selectedMarket.status}`;
  }
}

function renderFloatingDetail(market) {
  if (!market) {
    market = markets.find(m => m.iso3 === state.selected) || markets[0];
  }
  const card = $("floatingMarketCard");
  if (!card) return;
  if (!market) {
    card.style.display = "none";
    return;
  }
  card.style.display = "block";

  const iso2Code = ISO2[market.iso3] || market.iso3;
  if ($("floatingFlag")) $("floatingFlag").textContent = flag(market.iso3);
  if ($("floatingCountryName")) $("floatingCountryName").textContent = `${market.country} (${iso2Code})`;
  if ($("floatingCountryRegion")) $("floatingCountryRegion").textContent = market.cluster;

  const fitScore = market.derived ? market.derived.launch_fit : 0;
  if ($("floatingScoreBig")) $("floatingScoreBig").textContent = fitScore;
  if ($("floatingScoreBar")) $("floatingScoreBar").style.width = `${Math.min(100, fitScore * 10)}%`;

  const dimList = $("floatingDimensionsList");
  if (dimList) {
    const dimDefs = [
      { key: "demand", label: "Demand", weight: "30%" },
      { key: "paid_conversion", label: "Paid Conversion", weight: "20%" },
      { key: "distribution", label: "B2B Fit", weight: "20%" },
      { key: "whitespace", label: "Whitespace", weight: "15%" },
      { key: "delivery", label: "Delivery", weight: "10%" },
      { key: "feasibility", label: "Feasibility", weight: "5%" },
      { key: "evidence_confidence", label: "Evidence Conf.", weight: "Diag" }
    ];
    dimList.innerHTML = dimDefs.map(d => {
      const val = market.ratings ? (market.ratings[d.key] ?? 0) : 0;
      const pct = Math.min(100, val * 10);
      const color = val >= 8 ? "#10b981" : val >= 5 ? "#2563eb" : "#f59e0b";
      return `
        <div class="floating-dim-row" title="${esc(DIMENSION_META[d.key]?.title || d.label)} (${d.weight}): ${val}/10">
          <span class="floating-dim-label">${esc(d.label)}</span>
          <div class="floating-dim-track">
            <div class="floating-dim-fill" style="width: ${pct}%; background: ${color};"></div>
          </div>
          <span class="floating-dim-val">${val}</span>
        </div>
      `;
    }).join("");
  }
}

function renderDetail() {
  const market = markets.find(m => m.iso3 === state.selected);
  renderFloatingDetail(market);
}

function renderTable() {
  let list = matchingMarkets().slice();
  if ($("thMetricLabel")) {
    const label = metricLabel();
    $("thMetricLabel").innerHTML = esc(label).toUpperCase().replace(/\s+/, "<br>");
  }

  list.sort((a, b) => {
    let va, vb;
    switch (state.sortKey) {
      case "country": va = a.country; vb = b.country; break;
      case "status": va = a.status; vb = b.status; break;
      case "demand": va = a.ratings.demand; vb = b.ratings.demand; break;
      case "paid": va = a.ratings.paid_conversion; vb = b.ratings.paid_conversion; break;
      case "b2b": va = a.ratings.distribution; vb = b.ratings.distribution; break;
      case "whitespace": va = a.ratings.whitespace; vb = b.ratings.whitespace; break;
      case "delivery": va = a.ratings.delivery; vb = b.ratings.delivery; break;
      case "feasibility": va = a.ratings.feasibility; vb = b.ratings.feasibility; break;
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

  const rows = list.map((m, idx) => {
    const isCompared = state.compare.includes(m.iso3);
    const isSelected = m.iso3 === state.selected;
    const curVal = metricValue(m);
    const iso2Code = ISO2[m.iso3] || m.iso3;

    return `
      <tr class="${isSelected ? 'selected' : ''}" data-row-select="${m.iso3}" style="cursor:pointer;">
        <td style="color:var(--muted);font-weight:700;font-size:11px;">${idx + 1}</td>
        <td>
          <div class="table-market-cell">
            <span class="table-market-flag">${flag(m.iso3)}</span>
            <div>
              <div class="table-market-name">${esc(m.country)} <span style="font-weight:600;font-size:11px;color:var(--muted)">(${iso2Code})</span></div>
              <div class="table-market-sub">${esc(m.cluster)}</div>
            </div>
          </div>
        </td>
        <td><span class="td-route">${esc(m.status)}</span></td>
        <td class="score-bold">${curVal}</td>
        <td>${m.ratings.demand}</td>
        <td>${m.ratings.paid_conversion}</td>
        <td>${m.ratings.distribution}</td>
        <td>${m.ratings.whitespace}</td>
        <td>${m.ratings.delivery}</td>
        <td>${m.ratings.feasibility}</td>
        <td>${m.ratings.evidence_confidence}</td>
        <td style="text-align:center;">
          <button class="btn-table-action ${isCompared ? 'btn-table-added' : 'btn-table-compare'}" data-compare="${m.iso3}" type="button">
            ${isCompared ? "Added" : "+ Compare"}
          </button>
        </td>
      </tr>
    `;
  }).join("");

  $("marketRows").innerHTML = rows || `<tr><td colspan="12" style="text-align:center;padding:24px;color:var(--muted);">No markets match current filters.</td></tr>`;

  document.querySelectorAll("[data-row-select]").forEach(tr => {
    tr.addEventListener("click", e => {
      if (e.target.closest("[data-compare]")) return;
      selectMarket(tr.dataset.rowSelect, false);
    });
  });

  document.querySelectorAll("[data-compare]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      toggleCompare(btn.dataset.compare);
    });
  });
}

function renderWatchlist() {
  if (!data?.application?.honorable_mentions || !$("watchlist")) return;
  $("watchlist").innerHTML = data.application.honorable_mentions.map(w => {
    const iso2Code = ISO2[w.iso3] || w.iso3;
    return `
      <li class="watchlist-item" data-watchlist="${w.iso3}">
        <span class="watchlist-flag">${flag(w.iso3)}</span>
        <div style="flex:1;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="watchlist-title">${esc(w.country)}</span>
            <span class="watchlist-iso">${esc(w.iso3)}</span>
          </div>
          <div class="watchlist-why">${esc(w.why)}</div>
        </div>
      </li>
    `;
  }).join("");
}

function renderCompare() {
  const selected = state.compare.map(iso => markets.find(m => m.iso3 === iso)).filter(Boolean);
  const container = $("comparisonGrid");
  if (!container) return;

  if (selected.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:28px;color:var(--muted);background:var(--surface-2);border-radius:10px;">No markets selected for comparison. Click "+ Compare" on any market in the table to add up to 3 side-by-side.</div>`;
    return;
  }

  container.innerHTML = selected.map(m => {
    const fitScore = m.derived ? m.derived.launch_fit : 0;
    const iso2Code = ISO2[m.iso3] || m.iso3;
    const dimRows = [
      { key: "demand", label: "Demand" },
      { key: "paid_conversion", label: "Paid Conversion" },
      { key: "distribution", label: "B2B Fit" },
      { key: "whitespace", label: "Whitespace" },
      { key: "delivery", label: "Delivery" },
      { key: "feasibility", label: "Feasibility" },
      { key: "evidence_confidence", label: "Evidence" }
    ].map(d => {
      const val = m.ratings ? (m.ratings[d.key] ?? 0) : 0;
      const pct = Math.min(100, val * 10);
      const color = val >= 8 ? "#10b981" : val >= 5 ? "#2563eb" : "#f59e0b";
      return `
        <div class="comp-dim-row">
          <span class="comp-dim-label">${esc(d.label)}</span>
          <div class="comp-dim-track">
            <div class="comp-dim-fill" style="width: ${pct}%; background: ${color};"></div>
          </div>
          <span class="comp-dim-val">${val}</span>
        </div>
      `;
    }).join("");

    return `
      <article class="comparison-card">
        <div class="comp-card-header">
          <span class="comp-flag">${flag(m.iso3)}</span>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <h4 class="comp-card-title">${esc(m.country)} (${iso2Code})</h4>
              <button class="btn-mini btn-comp-remove" data-remove-compare="${m.iso3}" type="button" title="Remove from comparison" style="padding:2px 7px;font-size:11px;cursor:pointer;">✕</button>
            </div>
            <div class="comp-route">${esc(m.status)}</div>
          </div>
        </div>

        <div class="comp-score-section">
          <div class="comp-score-row">
            <span class="comp-score-label">Launch Fit</span>
            <span class="comp-score-val">${fitScore} <span style="font-size:12px;color:var(--muted)">/ 10</span></span>
          </div>
          <div class="floating-bar-track">
            <div class="floating-bar-fill" style="width: ${fitScore * 10}%;"></div>
          </div>
        </div>

        <div class="comp-dimensions-list">
          ${dimRows}
        </div>

        <div class="comp-card-actions">
          <button class="btn btn-mini btn-primary" data-comp-profile="${m.iso3}" type="button" style="width:100%;">
            View Full Profile →
          </button>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-remove-compare]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      toggleCompare(btn.dataset.removeCompare);
    });
  });

  document.querySelectorAll("[data-comp-profile]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      selectMarket(btn.dataset.compProfile, false);
      openArticle(btn.dataset.compProfile);
    });
  });
}

function renderInsights() {
  const container = $("topCandidatesList");
  if (!container || !markets) return;
  const top3 = markets.slice().sort((a, b) => (b.derived?.launch_fit || 0) - (a.derived?.launch_fit || 0)).slice(0, 3);

  container.innerHTML = top3.map((m, idx) => `
    <div class="top-candidate-item" style="cursor:pointer;" data-select-candidate="${m.iso3}">
      <span class="top-candidate-num">${idx + 1}.</span>
      <span style="font-size:16px;">${flag(m.iso3)}</span>
      <span class="top-candidate-name">${esc(m.country)}</span>
      <span class="top-candidate-route">· ${esc(m.cluster)}</span>
      <span class="top-candidate-score">${m.derived.launch_fit} / 10</span>
    </div>
  `).join("");

  document.querySelectorAll("[data-select-candidate]").forEach(el => {
    el.addEventListener("click", () => {
      selectMarket(el.dataset.selectCandidate, false);
      openArticle(el.dataset.selectCandidate);
    });
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
}

function selectMarket(iso, scroll = false) {
  state.selected = iso;
  const m = markets.find(x => x.iso3 === iso);
  if (m) {
    renderFloatingDetail(m);
  }
  renderMap();
  renderTable();
  renderKPIs(matchingMarkets());
  if (typeof updateAiContextDisplay === "function") {
    if (aiState.contextCountry !== null) {
      aiState.contextCountry = iso;
    }
    updateAiContextDisplay();
  }
  if (scroll) {
    const tableRow = document.querySelector(`[data-row-select="${iso}"]`);
    if (tableRow) {
      tableRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
}

function setMetric(metricKey) {
  state.metric = metricKey;

  document.querySelectorAll(".metric-chip").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.metric === metricKey);
  });

  renderMap();
  renderTable();
  renderKPIs(matchingMarkets());
  renderFloatingDetail();
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

  // Top Search Input & Table Search Input Sync
  if ($("topSearchInput")) {
    $("topSearchInput").addEventListener("input", e => {
      state.query = e.target.value;
      if ($("tableSearchInput")) $("tableSearchInput").value = state.query;
      renderMap();
      renderTable();
      renderKPIs(matchingMarkets());
    });
  }

  if ($("tableSearchInput")) {
    $("tableSearchInput").addEventListener("input", e => {
      state.query = e.target.value;
      if ($("topSearchInput")) $("topSearchInput").value = state.query;
      renderMap();
      renderTable();
      renderKPIs(matchingMarkets());
    });
  }

  // Region / Cluster Selects Sync
  if ($("mapRegionSelect")) {
    $("mapRegionSelect").addEventListener("change", e => {
      state.cluster = e.target.value;
      if ($("filterRegion")) $("filterRegion").value = state.cluster;
      renderMap();
      renderTable();
      renderKPIs(matchingMarkets());
    });
  }

  if ($("filterRegion")) {
    $("filterRegion").addEventListener("change", e => {
      state.cluster = e.target.value;
      if ($("mapRegionSelect")) $("mapRegionSelect").value = state.cluster;
      renderMap();
      renderTable();
      renderKPIs(matchingMarkets());
    });
  }

  // Strategic Route Filter
  if ($("filterRoute")) {
    $("filterRoute").addEventListener("change", e => {
      state.route = e.target.value;
      renderMap();
      renderTable();
      renderKPIs(matchingMarkets());
    });
  }

  // Score Tier Filter
  if ($("filterScore")) {
    $("filterScore").addEventListener("change", e => {
      state.scoreTier = e.target.value;
      renderMap();
      renderTable();
      renderKPIs(matchingMarkets());
    });
  }

  // Filter Reset Button
  if ($("filterResetBtn")) {
    $("filterResetBtn").addEventListener("click", () => {
      state.query = "";
      state.cluster = "all";
      state.route = "all";
      state.scoreTier = "all";
      if ($("topSearchInput")) $("topSearchInput").value = "";
      if ($("tableSearchInput")) $("tableSearchInput").value = "";
      if ($("mapRegionSelect")) $("mapRegionSelect").value = "all";
      if ($("filterRegion")) $("filterRegion").value = "all";
      if ($("filterRoute")) $("filterRoute").value = "all";
      if ($("filterScore")) $("filterScore").value = "all";
      renderMap();
      renderTable();
      renderKPIs(matchingMarkets());
    });
  }

  // Clear Comparison Button
  if ($("clearCompare")) {
    $("clearCompare").addEventListener("click", () => {
      state.compare = [];
      renderCompare();
      renderTable();
    });
  }

  // Floating Market Detail Card Controls
  if ($("closeFloatingCardBtn")) {
    $("closeFloatingCardBtn").addEventListener("click", () => {
      if ($("floatingMarketCard")) $("floatingMarketCard").style.display = "none";
    });
  }

  if ($("floatingViewProfileBtn")) {
    $("floatingViewProfileBtn").addEventListener("click", () => {
      openArticle(state.selected);
    });
  }

  // Insights Methodology & View All Links
  if ($("insightsMethodologyBtn")) {
    $("insightsMethodologyBtn").addEventListener("click", openMethodologyModal);
  }

  if ($("viewAllWatchlistBtn")) {
    $("viewAllWatchlistBtn").addEventListener("click", () => {
      openMethodologyModal();
    });
  }

  // Sidebar Nav Links
  document.querySelectorAll(".sidebar-nav-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".sidebar-nav-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
    });
  });

  if ($("navMethodology")) {
    $("navMethodology").addEventListener("click", openMethodologyModal);
  }

  // Export
  if ($("exportButton")) {
    $("exportButton").addEventListener("click", () => {
      download("esl-atlas-filtered-markets.json", JSON.stringify({
        exported_at: new Date().toISOString(),
        metric: state.metric,
        filters: { cluster: state.cluster, route: state.route, scoreTier: state.scoreTier, query: state.query },
        markets: matchingMarkets()
      }, null, 2), "application/json");
    });
  }

  // Read Mode Header & Modal Navigation
  if ($("readModeHeaderBtn")) {
    $("readModeHeaderBtn").addEventListener("click", () => openArticle(state.selected));
  }
  if ($("closeArticleBtn")) {
    $("closeArticleBtn").addEventListener("click", closeArticle);
  }
  if ($("articlePrevBtn")) {
    $("articlePrevBtn").addEventListener("click", () => navArticle(-1));
  }
  if ($("articleNextBtn")) {
    $("articleNextBtn").addEventListener("click", () => navArticle(1));
  }
  if ($("articleModal")) {
    $("articleModal").addEventListener("click", e => {
      if (e.target === $("articleModal")) closeArticle();
    });
  }

  // Methodology & Terms Modal Navigation
  if ($("methodologyHeaderBtn")) {
    $("methodologyHeaderBtn").addEventListener("click", openMethodologyModal);
  }
  if ($("articleMethodologyBtn")) {
    $("articleMethodologyBtn").addEventListener("click", openMethodologyModal);
  }
  if ($("closeMethodologyBtn")) {
    $("closeMethodologyBtn").addEventListener("click", closeMethodologyModal);
  }
  if ($("methodologyModal")) {
    $("methodologyModal").addEventListener("click", e => {
      if (e.target === $("methodologyModal")) closeMethodologyModal();
    });
  }

  // Delegated handler for any ".open-methodology-btn" buttons inside articles or panels
  document.addEventListener("click", e => {
    const btn = e.target.closest(".open-methodology-btn");
    if (btn) {
      e.preventDefault();
      openMethodologyModal();
    }
  });

  // Global ESC key handling for modals
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (aiState.isOpen) {
        closeAiChat();
      } else if ($("methodologyModal") && $("methodologyModal").classList.contains("open")) {
        closeMethodologyModal();
      } else if ($("articleModal") && $("articleModal").classList.contains("open")) {
        closeArticle();
      }
    }
  });

  // AI Copilot Integration
  if ($("openAiHeaderBtn")) {
    $("openAiHeaderBtn").addEventListener("click", e => {
      e.stopPropagation();
      toggleAiChat();
    });
  }
  if ($("aiLauncherBtn")) {
    $("aiLauncherBtn").addEventListener("click", e => {
      e.stopPropagation();
      toggleAiChat();
    });
  }
  if ($("aiCloseBtn")) {
    $("aiCloseBtn").addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      closeAiChat();
    });
  }
  if ($("articleAskAiBtn")) {
    $("articleAskAiBtn").addEventListener("click", e => {
      e.stopPropagation();
      openAiChat(state.selected);
    });
  }

  // Click outside to dismiss AI widget
  document.addEventListener("click", e => {
    if (!aiState.isOpen) return;
    const widget = $("aiChatWidget");
    if (!widget) return;
    const clickedInside = widget.contains(e.target);
    const clickedLauncher = e.target.closest("#aiLauncherBtn, #openAiHeaderBtn, #articleAskAiBtn, .btn-ai-sparkle");
    if (!clickedInside && !clickedLauncher) {
      closeAiChat();
    }
  });
  if ($("aiToggleContextBtn")) {
    $("aiToggleContextBtn").addEventListener("click", () => {
      aiState.contextCountry = aiState.contextCountry ? null : state.selected;
      updateAiContextDisplay();
      renderAiMessages();
    });
  }
  if ($("aiClearHistoryBtn")) {
    $("aiClearHistoryBtn").addEventListener("click", () => {
      aiState.history = [];
      renderAiMessages();
    });
  }
  if ($("aiChatForm")) {
    $("aiChatForm").addEventListener("submit", e => {
      e.preventDefault();
      sendAiMessage();
    });
  }
  if ($("aiChatInput")) {
    $("aiChatInput").addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendAiMessage();
      }
    });
  }

  // Delegated clicks for AI prompt chips and copy buttons
  document.addEventListener("click", e => {
    const promptBtn = e.target.closest(".ai-prompt-chip, .ai-mini-chip");
    if (promptBtn && promptBtn.dataset.prompt) {
      e.preventDefault();
      sendAiMessage(promptBtn.dataset.prompt);
      return;
    }
    const copyBtn = e.target.closest(".ai-copy-btn");
    if (copyBtn) {
      const idx = Number(copyBtn.dataset.copyIdx);
      const msg = aiState.history[idx];
      if (msg) {
        navigator.clipboard.writeText(msg.content).then(() => {
          copyBtn.textContent = "✓ Copied!";
          setTimeout(() => { copyBtn.textContent = "📋 Copy"; }, 2000);
        });
      }
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

/* =====================================================
   Atlas AI Copilot Client Implementation
   ===================================================== */
const GEMINI_CLIENT_KEY = window.GEMINI_API_KEY || localStorage.getItem("GEMINI_API_KEY") || "";

const aiState = {
  isOpen: false,
  contextCountry: "IND",
  history: [],
  isGenerating: false
};

function formatAiMarkdown(text) {
  if (!text) return "";
  let s = esc(text);
  s = s.replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/^[-*•]\s+(.+)$/gm, '<li>$1</li>');
  s = s.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
  s = s.replace(/<\/ul>\s*<ul>/g, '');
  s = s.replace(/^\d+\.\s+(.+)$/gm, '<ol-item>$1</ol-item>');
  s = s.replace(/(<ol-item>[\s\S]*?<\/ol-item>)/g, '<ol>$1</ol>');
  s = s.replace(/<ol-item>/g, '<li>').replace(/<\/ol-item>/g, '</li>');
  s = s.replace(/<\/ol>\s*<ol>/g, '');
  const paragraphs = s.split(/\n\n+/).map(p => {
    p = p.trim();
    if (!p) return "";
    if (p.startsWith("<ul") || p.startsWith("<ol") || p.startsWith("<pre")) return p;
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).filter(Boolean);

  return paragraphs.join("");
}

function updateAiContextDisplay() {
  const badge = $("aiTriggerContextBadge");
  const pill = $("aiActiveContextPill");
  const toggleBtn = $("aiToggleContextBtn");
  const chips = $("aiQuickChips");

  if (!badge || !pill) return;

  if (aiState.contextCountry) {
    const market = markets ? markets.find(m => m.iso3 === aiState.contextCountry) : null;
    const countryName = market ? market.country : aiState.contextCountry;
    badge.textContent = aiState.contextCountry;
    pill.textContent = `${flag(aiState.contextCountry)} ${countryName} (${aiState.contextCountry})`;
    if (toggleBtn) toggleBtn.textContent = "Switch to Global";

    if (chips) {
      chips.innerHTML = `
        <button class="ai-mini-chip" type="button" data-prompt="What is ${countryName}'s Launch Fit score and why?">🎯 Launch Fit</button>
        <button class="ai-mini-chip" type="button" data-prompt="Explain ${countryName}'s likely payer reality and willingness to pay.">💳 Buyer Reality</button>
        <button class="ai-mini-chip" type="button" data-prompt="What are the biggest distribution channels and risks for ${countryName}?">🏢 B2B & Risks</button>
        <button class="ai-mini-chip" type="button" data-prompt="Compare ${countryName} with Japan and Mexico.">⚖️ Compare</button>
      `;
    }
  } else {
    badge.textContent = "ALL";
    pill.textContent = "🌐 Global Universe (All 30 Markets)";
    if (toggleBtn) toggleBtn.textContent = `Focus on ${state.selected}`;

    if (chips) {
      chips.innerHTML = `
        <button class="ai-mini-chip" type="button" data-prompt="Which markets are Tier 1 Priority Launch candidates?">🏆 Top Markets</button>
        <button class="ai-mini-chip" type="button" data-prompt="Explain the difference between Demand and Paid Conversion with examples.">📊 Demand vs Paid</button>
        <button class="ai-mini-chip" type="button" data-prompt="Why is EF EPI separated from market demand in this Atlas?">🛡️ EF EPI Caveat</button>
        <button class="ai-mini-chip" type="button" data-prompt="Compare Latin America vs Southeast Asia expansion readiness.">🌎 Regional Comparison</button>
      `;
    }
  }
}

function renderAiMessages() {
  const container = $("aiChatMessages");
  if (!container) return;

  if (aiState.history.length === 0) {
    const activeMarket = markets ? markets.find(m => m.iso3 === aiState.contextCountry) : null;
    const countryName = activeMarket ? activeMarket.country : "India";
    container.innerHTML = `
      <div class="ai-welcome-card">
        <h4>✨ Welcome to Atlas AI Copilot</h4>
        <p>I am your dedicated research assistant, grounded in 30 sourced market dossiers and analytical scoring rubrics. Ask me anything about expansion priorities, buyer realities, or metric calculations.</p>
        <div class="ai-sample-prompts">
          <button class="ai-prompt-chip" type="button" data-prompt="Why is Japan ranked #1 in Launch Fit while India is 6.7?">
            <span>🎯</span> <span>Why is Japan ranked #1 in Launch Fit while India is 6.7?</span>
          </button>
          <button class="ai-prompt-chip" type="button" data-prompt="What is the recommended B2B strategy for ${countryName}?">
            <span>💼</span> <span>What is the recommended B2B strategy for ${countryName}?</span>
          </button>
          <button class="ai-prompt-chip" type="button" data-prompt="Which markets have high Outcome Demand but low Paid Conversion?">
            <span>💰</span> <span>Which markets have high Outcome Demand but low Paid Conversion?</span>
          </button>
          <button class="ai-prompt-chip" type="button" data-prompt="Explain the 6 weighted evaluation dimensions and Launch Fit formula.">
            <span>📐</span> <span>Explain the 6 weighted evaluation dimensions and Launch Fit formula.</span>
          </button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = aiState.history.map((msg, idx) => {
    const isUser = msg.role === "user";
    const formattedContent = isUser ? `<p>${esc(msg.content)}</p>` : formatAiMarkdown(msg.content);
    const copyButton = !isUser ? `
      <div class="ai-bubble-footer">
        <button class="ai-copy-btn" data-copy-idx="${idx}" type="button" title="Copy response">📋 Copy</button>
      </div>` : "";

    return `
      <div class="ai-message ${isUser ? 'user' : 'assistant'}">
        <div class="ai-bubble">
          ${formattedContent}
          ${copyButton}
        </div>
      </div>
    `;
  }).join("");

  container.scrollTop = container.scrollHeight;
}

function openAiChat(contextIso) {
  if (contextIso && markets && markets.some(m => m.iso3 === contextIso)) {
    aiState.contextCountry = contextIso;
  } else if (!aiState.contextCountry && state.selected) {
    aiState.contextCountry = state.selected;
  }

  aiState.isOpen = true;
  const widget = $("aiChatWidget");
  if (widget) {
    widget.hidden = false;
    widget.classList.add("open");
    widget.setAttribute("aria-hidden", "false");
    updateAiContextDisplay();
    renderAiMessages();
    setTimeout(() => {
      const input = $("aiChatInput");
      if (input) input.focus();
    }, 120);
  }
}

function closeAiChat() {
  aiState.isOpen = false;
  const widget = $("aiChatWidget");
  if (widget) {
    widget.classList.remove("open");
    widget.setAttribute("aria-hidden", "true");
    widget.hidden = true;
  }
}

function toggleAiChat(contextIso) {
  if (aiState.isOpen && (!contextIso || contextIso === aiState.contextCountry)) {
    closeAiChat();
  } else {
    openAiChat(contextIso);
  }
}

async function sendAiMessage(promptText) {
  const text = (promptText || ($("aiChatInput") ? $("aiChatInput").value : "") || "").trim();
  if (!text || aiState.isGenerating) return;

  aiState.history.push({ role: "user", content: text });
  aiState.isGenerating = true;

  const input = $("aiChatInput");
  const sendBtn = $("aiSendBtn");
  const indicator = $("aiTypingIndicator");

  if (input) input.value = "";
  if (sendBtn) sendBtn.disabled = true;
  if (indicator) indicator.hidden = false;

  renderAiMessages();

  try {
    let reply = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: aiState.history.slice(0, -1),
          contextCountry: aiState.contextCountry
        })
      });
      if (res.ok) {
        const json = await res.json();
        reply = json.reply;
      }
    } catch (serverErr) {
      console.warn("Local /api/chat unreachable, falling back to direct client Gemini API call", serverErr);
    }

    if (!reply) {
      reply = await callGeminiDirect(text, aiState.history.slice(0, -1), aiState.contextCountry);
    }

    aiState.history.push({ role: "assistant", content: reply });
  } catch (err) {
    aiState.history.push({
      role: "assistant",
      content: `⚠️ **Unable to complete request:** ${err.message || "Failed to reach Gemini API"}. Please check your connection or try again.`
    });
  } finally {
    aiState.isGenerating = false;
    if (sendBtn) sendBtn.disabled = false;
    if (indicator) indicator.hidden = true;
    renderAiMessages();
    if (input) input.focus();
  }
}

async function callGeminiDirect(message, history, contextCountry) {
  const summary = (markets || []).map(m => {
    const tier = m.derived.launch_fit >= 7.5 ? 'Tier 1 Priority' : m.derived.launch_fit >= 6.0 ? 'Tier 2 Selective' : 'Tier 3 Watchlist';
    return `${m.country} (${m.iso3}): Launch Fit=${m.derived.launch_fit}/10 [${tier}], Cluster=${m.cluster}, Status=${m.status}, EF EPI 2025=${m.ef_2025}, Ratings: [Demand:${m.ratings.demand}/10, Paid:${m.ratings.paid_conversion}/10, B2B:${m.ratings.distribution}/10, Whitespace:${m.ratings.whitespace}/10, Delivery:${m.ratings.delivery}/10, Feasibility:${m.ratings.feasibility}/10, Evidence:${m.ratings.evidence_confidence}/10]. Payer: "${m.buyer}". Target: "${m.target}". Incumbents: "${m.supply}". Risk: "${m.risk}".`;
  }).join('\n');

  let activeFocus = '';
  if (contextCountry && markets) {
    const active = markets.find(m => m.iso3 === contextCountry);
    if (active) {
      activeFocus = `\nCURRENTLY VIEWED MARKET BY USER:\nCountry: ${active.country} (${active.iso3}), Status: ${active.status}, Fit: ${active.derived.launch_fit}/10, EF EPI: ${active.ef_2025}, Target: ${active.target}, Buyer: ${active.buyer}, Risk: ${active.risk}\nDossier Summary: ${(active.dossier_markdown || '').slice(0, 1200)}`;
    }
  }

  const systemInstruction = `You are the expert Global ESL Market Atlas AI Analyst & Copilot. Answer questions strictly based on the following verified 30-market dataset:\n\n${summary}\n${activeFocus}\n\nRULES: Ratings are 1-10 assessments across Demand (30%), Paid Conversion (20%), Distribution (20%), Whitespace (15%), Delivery (10%), Feasibility (5%), plus Evidence Confidence (Diagnostic). Downloads != Willingness to Pay. EF EPI is a self-selected online test signal, not national fluency. Never hallucinate private competitor CAC. Be concise, structured, and factual.`;

  const contents = [];
  for (const h of history.slice(-6)) {
    contents.push({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: String(h.content) }]
    });
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  if (!GEMINI_CLIENT_KEY) {
    throw new Error("AI server endpoint (/api/chat) is unreachable. If running in static preview, set window.GEMINI_API_KEY.");
  }

  let response;
  let errText = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_CLIENT_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { temperature: 0.35, maxOutputTokens: 1000 }
        })
      });
      if (response.ok) break;
      if ((response.status === 503 || response.status === 429) && attempt < 2) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      errText = await response.text();
      break;
    } catch (e) {
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      throw e;
    }
  }

  if (!response || !response.ok) {
    throw new Error(`Gemini API returned ${response ? response.status : "network error"}: ${errText.slice(0, 100)}`);
  }

  const json = await response.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
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

async function fetchWithFallback(urls) {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
    } catch (_) {}
  }
  throw new Error("Could not fetch resource from: " + urls.join(", "));
}

async function createMap() {
  mapSvg = d3.select("#worldMap");
  try {
    const res = await fetchWithFallback([
      "./world-countries-geo.json",
      "/world-countries-geo.json",
      "world-countries-geo.json"
    ]);
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
  const response = await fetchWithFallback([
    "/api/market-data",
    "./market-data.json",
    "/market-data.json",
    "market-data.json"
  ]);

  data = await response.json();
  markets = data.market_records;
  sourceIndex = new Map(data.global_sources.map(s => [s.id, s]));

  setupEvents();
  renderWatchlist();
  renderInsights();
  renderFloatingDetail();
  renderTable();
  renderCompare();
  updateAiContextDisplay();
  renderAiMessages();
  await createMap();
}

init().catch(err => {
  console.error("Fatal startup error:", err);
  document.body.innerHTML = `<main class="app-shell"><h1>Global ESL Market Atlas</h1><p>Fatal error loading evidence pack.</p></main>`;
});
