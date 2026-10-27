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
    const meta = DIMENSION_META[k];
    const tip = meta ? `${meta.title} (${meta.weight}): ${meta.definition}` : "";
    return `
      <div class="dimension-row" title="${esc(tip)}" style="cursor:help;">
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
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <h4 style="margin:0;">Evaluation Dimensions</h4>
        <button class="btn btn-mini open-methodology-btn" type="button" style="font-size:11px;padding:2px 8px;">📊 Scoring Rubric</button>
      </div>
      <div class="detail-dimensions">
        ${dimensionRows}
        <div class="dimension-row" style="margin-top:4px;cursor:help;" title="${esc(DIMENSION_META.evidence_confidence.definition)}">
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

  // Methodology & Terms Modal Navigation
  $("methodologyHeaderBtn").addEventListener("click", openMethodologyModal);
  if ($("articleMethodologyBtn")) {
    $("articleMethodologyBtn").addEventListener("click", openMethodologyModal);
  }
  $("closeMethodologyBtn").addEventListener("click", closeMethodologyModal);
  $("methodologyModal").addEventListener("click", e => {
    if (e.target === $("methodologyModal")) closeMethodologyModal();
  });

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
      if ($("methodologyModal") && $("methodologyModal").classList.contains("open")) {
        closeMethodologyModal();
      } else if ($("articleModal") && $("articleModal").classList.contains("open")) {
        closeArticle();
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
  renderTable();
  renderDetail();
  renderCompare();
  await createMap();
}

init().catch(err => {
  console.error("Fatal startup error:", err);
  document.body.innerHTML = `<main class="app-shell"><h1>Global ESL Market Atlas</h1><p>Fatal error loading evidence pack.</p></main>`;
});
