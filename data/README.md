# ESL market research pack — index

## Start here

1. **`01-market-screen.md`** — one table for all 30 markets and the initial strategic routes.
2. **`02-data-quality-and-next-steps.md`** — what is evidence, what is assessment and which important numbers are not publicly knowable.
3. **`esl-market-evidence-v1.json`** — canonical structured data for the planned map/application.
4. **`country-dossiers/`** — 30 drill-down notes, one per ISO-3 market.
5. **`india-competitor-intelligence.md`** — sourced financial/CAC reality check for Supernova, MySivi, SpeakX and Stimuler.
6. **`competitor-audit-scorecard.md`** — fieldwork guide for the two app reviewers.

## Data model

The canonical JSON has three kinds of information:

- `market_records`: 30 country profiles; each includes a route hypothesis, seven clearly labelled screening ratings, evidence notes and direct source URLs.
- `global_sources`: source registry with purpose and source quality.
- `india_competitor_intelligence`: company snapshots with date, claim/provenance, confidence and explicit missing values.

The JSON avoids a fake country-level “paid English learner count” or “app CAC” because those do not exist as defensible public statistics. Unknowns remain explicit.

## Safe use in a future map / AI interface

- Use ISO-3 as the country key.
- Render score labels as **assessments**, never as raw facts.
- Every numeric observation must show its year, definition, source and confidence on click.
- Let users filter assessed vs observed vs unknown fields.
- When an AI assistant answers questions, require source IDs and force it to say when the data does not answer the question.
- Add a revision log rather than replacing old values; countries and private-app pricing change quickly.

## Source standards

- Source links are direct publisher/page URLs.
- EF EPI is retained only as a self-selected learner/proficiency signal.
- Company revenue/profit figures are private-company claims or reported sources unless explicitly identified as audited.
- “Evidence confidence” concerns the basis for the assessment; it is not a measure of market attractiveness.