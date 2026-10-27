# Global ESL Market Atlas

Interactive, source-linked market intelligence tool for an AI-first English learning product with optional human escalation.

## Run locally

```powershell
cd C:\Users\Admin\Documents\Codex\2026-10-26\realtime-voice-chat-2\work\global-esl-market-atlas
node .\server.mjs
```

Open `http://127.0.0.1:4173`.

## Data API

- `GET /api/health`
- `GET /api/market-data`
- `GET /api/markets`
- `GET /api/markets?cluster=Latin%20America&minimum_evidence=7`
- `GET /api/markets/IND`

The frontend first uses `/api/market-data`, then falls back to its bundled `dist/market-data.json` for static hosting.

## What is in the app

- World heatmap with switchable outcome demand, supply gap/whitespace, paid conversion, B2B distribution, delivery, operating feasibility, evidence confidence, EPI learner signal and derived launch fit.
- Filters by region, route, evidence threshold and country search.
- Zoomable map, country flags, market drill-down, direct sources, export and three-market comparison.
- Briefing/light, Field/dark, Satellite-style and Ops visual modes.
- A deliberately unscored honorable-mentions watchlist. It is kept outside the heatmap until equivalent evidence exists.

## Evidence rules

The pack separates direct observations, company claims, analyst assessments and unknowns. The map must not be used to infer country-level paid learner counts, app CAC, competitor profits, conversion or retention where a source does not provide them.