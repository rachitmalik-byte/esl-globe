# ESL market research protocol

## Objective

Assess 30 markets for an AI-first English learning product with optional teacher escalation. This is a decision system, not a market-size presentation. It will test whether a country can support profitable paid acquisition or lower-cost institutional distribution.

## Two summary pages to build after the evidence pass

1. **Portfolio page** — country universe, status, core decision score, confidence, top entry route, and the one reason not to enter.
2. **Decision map** — geography, comparative filters, segment view, source coverage and country drill-down.

Country click-through reports will contain the evidence table, detailed analysis, competitor evidence, data caveats, local content/payment requirements, target cohort, route to market, risk register and source links.

## What will be stored per country

- Basic market: ISO code, population, working-age population, GDP per capita PPP, currency/inflation context, internet/mobile access and digital-payment readiness.
- English need: 2022/2024/2025 comparable proficiency signal where available, spoken-versus-receptive gap, labour-demand evidence, migration/study/tourism/export demand and public English programmes.
- Buyer and price: B2C versus B2B/B2B2C route, payment rails, affordability proxy, observed price points, free alternatives and willingness-to-pay evidence.
- Supply and competition: local and international apps, centres, tutor marketplaces, free/public provision, company claims, app-store evidence and funding only when sourceable.
- Operating reality: local-language requirements, AI/data regulation, consumer-protection rules, tax/payment friction, sales cycle, partner types and city-level variance.
- Commercial test: specific target cohort, job outcome, proposed offer, likely channel, unit-economics assumptions, experiments and a no-go condition.

## Evidence labels

- **Observed — primary:** government, regulator, multilateral, official company filing or direct app/store page.
- **Observed — credible secondary:** established industry research or reputable reporting, named as such.
- **Derived:** a calculation reproduced from cited inputs.
- **Analyst assessment:** a transparent 0–10 score. It is a decision aid, not an observed fact.
- **Unavailable:** no defensible public evidence. This is an explicit result, not a blank assumed to be zero.

## Rating method

No country gets a final 0–10 market rating until the underlying fields are populated and checked. The eventual scorecard will separate six ratings:

1. Outcome-linked English demand
2. Paid conversion and purchasing power
3. Digital delivery and payment readiness
4. Distribution advantage and B2B fit
5. Competitive whitespace
6. Operating and regulatory feasibility

A seventh figure, **evidence confidence**, will show source quality and coverage. It will never be blended into commercial attractiveness. This prevents a data-rich but weak market from looking better than it is, or a promising but poorly measured market from looking more certain than it is.

## Explicit data limitations

National paid-learner counts, country-level app CAC, competitor profits, conversion, retention, and a universal share of job postings requiring English are generally not public data series. The reports will use observable proxies only when they genuinely answer part of the question, show the proxy definition, and label the result accordingly. They will not turn download counts, EF scores, or marketing claims into revenue estimates.

## Current baseline

`esl-market-baseline-30.json` contains the selected 30-country universe and a 2025/2024 EF EPI learner-signal baseline. The EF field is useful for comparison but must not be read as national fluency or paid demand. It is deliberately a baseline, not a completed country report.

## Core source library

- EF EPI 2025 — English learner/proficiency signal, with a self-selection limitation.
- World Bank Global Findex 2025 — national payment, account, phone and internet indicators.
- World Bank WDI — income, population, labour, internet and services indicators.
- ITU ICT Development Index 2025 — delivery readiness and digital affordability context.
- World Bank Digital Progress and Trends 2025 and WTO services data — digital-services/outsourcing demand proxy.
- Country regulators, ministries, central banks, app stores, company filings and company pages — country-specific detail and competitor verification.

## Export plan

The finished research will have one structured JSON dataset for the web application, a CSV/Excel-friendly flat country table, a source register, and individual Markdown reports. The future app can ingest the JSON directly; the AI layer should answer from retrieved source-linked fields only and show the evidence label and last-checked date in every response.
