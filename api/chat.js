import { readFile } from 'node:fs/promises';
import path from 'node:path';

let cachedApiKey = null;

async function getApiKey(req) {
  // 1. Check custom header sent by client (if user entered key in UI)
  const headerKey = req?.headers?.['x-gemini-key'] || req?.headers?.['x-api-key'];
  if (headerKey && typeof headerKey === 'string' && headerKey.trim()) {
    return headerKey.trim();
  }
  // 2. Check process.env.GEMINI_API_KEY (configured in Vercel or environment)
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY.trim();
  }
  if (cachedApiKey) return cachedApiKey;
  // 3. Check local .env files
  const envPaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '..', '.env'),
    new URL('../.env', import.meta.url),
    new URL('../../.env', import.meta.url),
    new URL('../app/.env', import.meta.url)
  ];
  for (const p of envPaths) {
    try {
      const content = await readFile(p, 'utf8');
      const match = content.match(/GEMINI_API_KEY\s*=\s*(["']?)([^"'\r\n]+)\1/);
      if (match && match[2]) {
        cachedApiKey = match[2].trim();
        return cachedApiKey;
      }
    } catch (_) {}
  }
  return '';
}

let cachedData = null;

async function getData() {
  if (cachedData) return cachedData;
  const candidates = [
    new URL('./market-data.json', import.meta.url),
    new URL('../app/dist/market-data.json', import.meta.url),
    path.join(process.cwd(), 'api', 'market-data.json'),
    path.join(process.cwd(), 'app', 'dist', 'market-data.json'),
    path.join(process.cwd(), 'dist', 'market-data.json'),
    path.join(process.cwd(), 'market-data.json')
  ];
  for (const candidate of candidates) {
    try {
      cachedData = JSON.parse(await readFile(candidate, 'utf8'));
      return cachedData;
    } catch (e) {}
  }
  throw new Error('Unable to find market-data.json in any expected location');
}

function buildSystemInstruction(pack, contextCountry) {
  const summary = pack.market_records.map(m => {
    const tier = m.derived.launch_fit >= 7.5 ? 'Tier 1 Priority' : m.derived.launch_fit >= 6.0 ? 'Tier 2 Selective' : 'Tier 3 Watchlist';
    return `${m.country} (${m.iso3}): Launch Fit=${m.derived.launch_fit}/10 [${tier}], Cluster=${m.cluster}, Status=${m.status}, EF EPI 2025=${m.ef_2025}, Ratings: [Demand:${m.ratings.demand}/10 (30% wt), PaidConversion:${m.ratings.paid_conversion}/10 (20% wt), B2BDistribution:${m.ratings.distribution}/10 (20% wt), Whitespace:${m.ratings.whitespace}/10 (15% wt), Delivery:${m.ratings.delivery}/10 (10% wt), Feasibility:${m.ratings.feasibility}/10 (5% wt), EvidenceConfidence:${m.ratings.evidence_confidence}/10 (Diagnostic)]. Payer: "${m.buyer}". Target: "${m.target}". Incumbents: "${m.supply}". Risk: "${m.risk}". Sources: [${m.sources.join(', ')}]`;
  }).join('\n');

  let activeFocus = '';
  if (contextCountry) {
    const active = pack.market_records.find(m => m.iso3.toLowerCase() === contextCountry.toLowerCase() || m.country.toLowerCase() === contextCountry.toLowerCase());
    if (active) {
      activeFocus = `\n\nCURRENTLY VIEWED MARKET BY USER:\nCountry: ${active.country} (${active.iso3})\nStatus: ${active.status}\nCluster: ${active.cluster}\nLaunch Fit: ${active.derived.launch_fit}/10\nEF EPI 2025: ${active.ef_2025}\nScores: Demand=${active.ratings.demand}, Paid Conversion=${active.ratings.paid_conversion}, B2B Distribution=${active.ratings.distribution}, Whitespace=${active.ratings.whitespace}, Delivery=${active.ratings.delivery}, Feasibility=${active.ratings.feasibility}, Evidence Confidence=${active.ratings.evidence_confidence}\nTarget Role & Outcome: ${active.target}\nLikely Payer Reality: ${active.buyer}\nIncumbent Supply: ${active.supply}\nMain Risk: ${active.risk}\nDemand Evidence: ${active.demand_evidence}\nCited Sources: ${active.sources.join(', ')}\nDetailed Dossier Summary: ${active.dossier_markdown.slice(0, 1500)}...`;
    }
  }

  return `You are the expert Global ESL Market Atlas AI Analyst & Copilot.
You assist executive teams, investors, and product managers evaluating 30 international expansion markets for an AI-first spoken English product with optional human mentor escalation.

CORE METHODOLOGY & RULES:
1. Ratings are analyst assessments on a 1-10 scale across:
   - Outcome Demand (30% weight): Job-linked, wage-driving necessity of professional spoken English (IT/BPO/MNCs).
   - Paid Conversion (20% weight): Willingness & capacity to buy recurring digital subscriptions ($15-$100+/mo) vs defaulting to free ad-supported apps.
   - Distribution / B2B Fit (20% weight): Access to scalable institutional channels (employers, universities, placement agencies) to bypass high consumer ad CAC.
   - Whitespace Gap (15% weight): Room for role-specific voice AI vs legacy paper-test cram schools or saturated voice AI apps.
   - Digital Delivery (10% weight): 4G/5G mobile reliability, low WebRTC voice latency (<800ms), and friction-free payment rails.
   - Operating Feasibility (5% weight): Speech recognition accent localization, data privacy compliance, foreign remittances, and corporate taxation.
   - Evidence Confidence (Diagnostic Index, NOT weighted in Launch Fit): Empirical verification rigor (10 = audited filings, primary buyer interviews; 1 = proxy estimates).
2. Composite Launch Fit Formula:
   Launch Fit = (0.30 × Demand) + (0.20 × Paid) + (0.20 × Distribution) + (0.15 × Whitespace) + (0.10 × Delivery) + (0.05 × Feasibility)
3. Strategic Launch Tiers:
   - Tier 1 Priority Launch: Launch Fit >= 7.5 (e.g. Japan 8.15, Saudi Arabia 7.8, Mexico 7.4/close)
   - Tier 2 Selective Expansion: Launch Fit 6.0 to 7.4 (e.g. India 6.7, Brazil 6.6, South Korea 7.2)
   - Tier 3 Watchlist: Launch Fit < 6.0
4. Critical Guardrails:
   - "Downloads ≠ Willingness to Pay": High app installs in emerging markets (e.g. India, Brazil) often mask high churn and an unwillingness to pay auto-renewing subscriptions without employer backing or job placement guarantees.
   - EF EPI (English Proficiency Index) is an unrepresentative, self-selected internet test score, NOT a measure of national workforce fluency or commercial market size.
   - Strict Zero-Hallucination Policy: Never invent or hallucinate competitor CAC, conversion percentages, or private margins. Cite only verified observations from this data pack.

VERIFIED 30-MARKET UNIVERSE:
${summary}
${activeFocus}

RESPONSE GUIDELINES:
- Provide direct, concise, and structured answers formatted in markdown (bullet points, bold highlights, small comparison tables when comparing).
- Always quote the verified numbers (Launch Fit, Demand, Paid Conversion, EF EPI, etc.) accurately from this dataset.
- Be objective, analytical, and commercially grounded.`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { message, history = [], contextCountry = null } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "message" in request body.' });
    }

    const pack = await getData();
    const systemInstruction = buildSystemInstruction(pack, contextCountry);

    // Format Gemini contents payload
    const contents = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-8)) { // Keep last 8 turns for context window efficiency
        if (item.role && item.content) {
          contents.push({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: String(item.content) }]
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const apiKey = await getApiKey(req);
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured. Please set the GEMINI_API_KEY environment variable.' });
    }

    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-3.5-flash',
      'gemini-3.8-flash'
    ];

    let response = null;
    let successfulModel = '';
    let lastErrText = '';

    for (const model of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents,
              generationConfig: {
                temperature: 0.35,
                maxOutputTokens: 1200
              }
            })
          });

          if (response.ok) {
            successfulModel = model;
            break;
          }

          if ((response.status === 503 || response.status === 429) && attempt === 0) {
            await new Promise(r => setTimeout(r, 800));
            continue;
          }

          lastErrText = await response.text();
          break; // Try next candidate model
        } catch (e) {
          lastErrText = e.message;
          if (attempt === 0) {
            await new Promise(r => setTimeout(r, 500));
            continue;
          }
          break;
        }
      }
      if (response && response.ok) break;
    }

    if (!response || !response.ok) {
      return res.status(response ? response.status : 500).json({
        error: `Gemini API error: ${response ? response.status : 'network'}`,
        details: lastErrText
      });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated from the model.';

    return res.status(200).json({
      ok: true,
      reply,
      model: successfulModel || 'gemini-2.5-flash',
      contextCountry: contextCountry || 'GLOBAL'
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to process AI request',
      details: error.message
    });
  }
}
