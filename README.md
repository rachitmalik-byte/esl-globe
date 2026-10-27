# Global ESL Market Atlas

A source-linked research and visualization package for screening expansion markets for an **AI-first English-speaking product**, with an optional teacher/mentor escalation. This is designed for strategy discussions, country selection, competitor study and a future evidence-aware AI assistant.

## Package layout

```text
ESL-Market-Atlas/
├── README.md                    ← this handoff guide
├── data/                        ← research, sources and country dossiers
│   ├── esl-market-evidence-v1.json
│   ├── 01-market-screen.md
│   ├── 02-data-quality-and-next-steps.md
│   ├── country-dossiers/        ← 30 country detail notes
│   ├── india-competitor-intelligence.md
│   └── competitor-audit-scorecard.md
└── app/                         ← interactive web application
    ├── dist/                    ← deployable static frontend
    │   ├── index.html
    │   ├── app.js
    │   ├── styles.css
    │   └── market-data.json
    ├── server.mjs               ← local JSON API + static server
    └── README.md
```

## Start here

1. Read `data/01-market-screen.md` for the 30-market screen and commercial routes.
2. Use `data/esl-market-evidence-v1.json` as the canonical structured data source.
3. Open an individual file in `data/country-dossiers/` when a country is shortlisted.
4. Use `data/india-competitor-intelligence.md` for the sourced Supernova / MySivi / SpeakX / Stimuler financial and CAC reality check.
5. Have two reviewers run `data/competitor-audit-scorecard.md` before drawing product conclusions from competitor apps.

## Run the app locally

Open PowerShell in the `app` folder and run:

```powershell
node .\server.mjs
```

Then open:

```text
http://127.0.0.1:4173
```

The local server exposes both the application and the data API. The frontend also has a static fallback: any static host can serve `app/dist/` because it includes `market-data.json`.

### Data API

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Checks the local service. |
| `GET /api/market-data` | Returns the full app evidence pack. |
| `GET /api/markets` | Returns all markets. |
| `GET /api/markets?cluster=Latin%20America&minimum_evidence=7` | Filters markets by cluster and evidence threshold. |
| `GET /api/markets/IND` | Returns one ISO-3 market record. |

## What the map does

- Colours countries by a switchable measure: outcome demand, whitespace/supply gap, paid conversion, distribution/B2B fit, delivery, feasibility, evidence confidence, EF EPI learner signal or derived launch fit.
- Filters by cluster, market route, minimum evidence confidence and text search.
- Supports map zoom/reset, country flags, detailed country panels, direct source links, filtered JSON export and three-market comparison.
- Provides Briefing/light, Field/dark, Satellite-style and Ops interface styles.
- Keeps honorable mentions separate from heatmaps. They are unscored watchlist markets, not secretly ranked opportunities.

## Data model and evidence discipline

The app deliberately distinguishes four types of information:

1. **Observed data**: an identified publisher/source provides a value. Preserve its year, definition and direct link.
2. **Company claim**: useful signal, but not audited evidence. Private-company ARR, profitability and user numbers often belong here.
3. **Derived metric**: calculated from named inputs and a visible formula. `launch_fit` is derived from the ratings; it is not a market-size figure.
4. **Analyst assessment**: a 1–10 screening score with rationale. It must never be displayed as if it were a government statistic.

### Important limits

Do not create a “precise” value for any of these unless a source actually supports it:

- number of people paying for English learning in a country;
- country-level app CAC;
- competitor CAC, conversion, retention, LTV, gross margin or profit;
- universal share of job posts that require English;
- AI variable cost or teacher-escalation cost without a real usage cohort.

A low EF EPI score or a high number of downloads does **not** prove paid demand. The 2025 EF EPI is a self-selected online-test signal, not a nationally representative willingness-to-pay study.

## Key JSON objects

### `application`

Contains scope, visible warnings, metric definitions and the unscored honorable-mentions watchlist.

### `market_records`

There are 30 records, keyed by ISO-3. Each record includes:

```text
iso3, country, cluster, status
EF EPI 2025 score and change versus 2024
ratings: demand, paid_conversion, delivery, distribution,
         whitespace, feasibility, evidence_confidence
buyer, target, supply, risk, demand_evidence
sources: direct URLs or source registry IDs
derived.launch_fit
```

### `global_sources`

A source registry with URL, intended use and evidence-quality notes.

### `india_competitor_intelligence`

Dated public evidence for Supernova, MySivi, SpeakX and Stimuler. It explicitly marks reported/private values and unavailable CAC or profit fields.

## How to update the data safely

1. Copy the current JSON before editing it.
2. Add a new source to `global_sources` with the direct URL, publisher/use, publication/observation date and quality note.
3. Update a market only when its evidence is specific to that market and metric.
4. Keep the old observation year when a newer value is not available. Do not replace a missing value with an estimate without labelling it.
5. Explain any rating change in the country dossier or a change log.
6. Regenerate `app/dist/market-data.json` from the canonical evidence pack after updating it.
7. Keep unknowns as `unknown`, `not disclosed` or `not publicly verified`; do not use zero.

## Recommended next research wave

- Capture dated Android/iOS price, trial, free-limit and localisation snapshots for direct competitors in each priority market.
- Conduct paid-behaviour interviews by payer type: learner, employer, college/training partner and parent.
- Run a role-specific pilot and measure activation, day 7/30/90 retention, trial-to-paid, payment failures, AI cost, teacher escalation, gross margin and CAC payback.
- Add actual World Bank/Global Findex/ITU field observations with exact country, year, definition and source locator.
- Maintain separate views for consumer self-pay, B2B and B2B2C; they have different CAC and margin structures.

## Future AI assistant architecture

The current backend already exposes clean market JSON. A production AI layer should:

- retrieve only from the source-linked market records and source register;
- cite the exact source links in every answer;
- explain whether it is using observed data, a company claim, a derivation or an analyst assessment;
- say “unknown” instead of filling missing CAC, paid-learner or profit data;
- keep credentials, rate limits and user data server-side; never embed an LLM API key in `app.js`.

## Delivery note

This package is ready for local use and static deployment. The attempted private hosted deployment from the build environment could not finish because that environment could not resolve the hosting Git domain. That does not affect the files or the local application.