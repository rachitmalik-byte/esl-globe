# Evidence quality, missing data and next collection wave

## What the current pack proves

- There are 30 selected markets with a dated English-proficiency signal, a commercial route hypothesis, 1–10 screening dimensions, key demand/supply/operating risks, and direct links to the evidence used.
- It separates direct observations from analyst judgement. This matters because English aspiration, low proficiency, and a large population do not automatically create a paid subscription market.
- It identifies route differences: India/Indonesia need low-cost partner distribution; Mexico/Colombia need nearshore/BPO employer use cases; Gulf markets require enterprise sales and Arabic delivery; Philippines/Malaysia are benchmarks rather than basic-English volume plays.
- The India competitor section contains only public/reported figures and explicitly labels source strength and dates.

## What it does **not** prove yet

The following metrics are either private, country-dependent or unavailable in public data. A complete-looking number here would be false precision.

| Metric | Why no reliable public country figure exists | Correct way to obtain it |
| --- | --- | --- |
| Number of people paying for English learning | Payment may flow to tutors, centres, apps, schools, employers or family members; categories are not consistently reported. | Market survey + app-store panels + partner data; report an interval and method. |
| Country-level app CAC | CAC changes by channel, creative, city, language, plan, season and attribution window. | Your own channel-level spend / first-time paid cohort ledger. |
| Competitor CAC, conversion, retention, LTV or profit | Private companies rarely disclose audited cohorts. Downloads/hiring/funding do not reveal these. | Public filings only; otherwise competitor audits and observed pricing, marked as non-financial. |
| Universal job-post English requirement | Job boards, geography, job category and wording change the denominator dramatically. | Dated, reproducible job-post scrape/sample with explicit query and denominator. |
| AI variable cost | Depends on model, token/speech minutes, TTS, storage, safety and support. | Instrument production usage by feature and country. |
| Teacher-margin impact | Depends on escalation eligibility, teacher rate, scheduling and repeat sessions. | Pilot with true utilisation and cost allocation. |

## Data confidence labels

- **Observed / high:** official statistical agency, central bank, regulator, World Bank/ITU microdata or reproducible dataset. Keep observation year.
- **Observed / medium:** reputable reporting, trade association, investor or company material. Keep who made the claim and date.
- **Company claim:** useful signal, never treat as audited financial fact.
- **Derived:** calculation from a stated formula and source inputs; save formula.
- **Analyst assessment:** score or recommendation; always show rationale and evidence confidence.
- **Unknown:** no defensible source. This is a valid value and should remain visible in the app.

## Recommended data model for the map/application

Every field should have:

```json
{
  "value": 7,
  "unit": "score_1_to_10",
  "observed_or_assessed": "assessed",
  "as_of": "2026-10-27",
  "confidence": "medium",
  "source_ids": ["ef2025", "country_source_01"],
  "method_note": "Analyst screening assessment; not a market-size estimate"
}
```

Required entities:

- **Market:** ISO-3, name, region, languages, payer types, target cohorts, regulations/payment notes.
- **Metric observation:** value, unit, source, source date, observation year, definition, confidence and revision history.
- **Company snapshot:** product, platform/country, free limit, plan/price/currency, human layer, evidence screenshot, date, source and reviewer.
- **Experiment/pilot:** cohort, acquisition channel, price, variable cost, activation, retention, conversion, CAC, gross margin, outcome delta and decision.
- **Source register:** canonical URL, publisher, publication date, accessed date, source type, limitations and quote/locator.

## Next collection wave — do this before ranking markets by dollar opportunity

1. Extract World Bank WDI, Global Findex and ITU values into field-level records, retaining year and definition. Never overwrite a missing recent value with an old figure silently.
2. Take dated Android/iOS store snapshots by country for the direct AI-first set and substitution set: Supernova, MySivi, SpeakX, Stimuler, ELSA, Praktika, Speak, Loora, Duolingo, Cambly/Preply and local centres. Store price, trial, free gate, ranking, ratings, languages and evidence image.
3. Conduct 12–20 structured learner interviews per priority geography, separated by payer type: self-pay, employer-paid, college-paid and parent-paid. Ask for past spend/recency, not abstract willingness to pay.
4. Run a landing-page/payment test for a single role outcome. Track country/state/language/channel, user intent, price, trial, payment completion, D7 and D30 retention.
5. Pilot one employer or college in India and one overseas priority market. Measure job-relevant oral assessment before/after, manager assessment, activation, usage and renewal intent.
6. Build competitor “mystery shop” data with the included two-reviewer scorecard. It will explain product retention better than a generic feature grid.

## Commercial guardrails

- Start with role-specific value: interview, customer support, logistics, BPO QA, sales, hospitality or workplace meetings. “Improve English” is a weak buying trigger.
- Let AI own practice, feedback and repetition. Use teachers/mentors as a priced escalation for accountability, high-stakes feedback and confidence.
- Make partner distribution a core hypothesis—not a future add-on—where consumer price tolerance is low.
- Use country-level evidence to choose tests, but use cohort-level economics to decide expansion.
- A high-income country can still be a poor entry market if language need is low or incumbents are entrenched; a lower-income country can work if a partner pays for a measurable work outcome.