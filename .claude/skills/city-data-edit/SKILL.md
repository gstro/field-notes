---
name: city-data-edit
description: Edit or add per-city content in setup/roadtrip/src/lib/data/cities/*.json or cityIndex.json (recommendations, statuses, vibeWord, fingerprint, favorites, fieldNotes, spend, photos). Covers the schema, the design rules the type system can't enforce, and the validation loop.
---

# Editing city data

The database is Git: each built city is one JSON file, typed by `City` in `setup/roadtrip/src/lib/types.ts`. A generated JSON Schema (`setup/roadtrip/schemas/city.schema.json`) gives VS Code autocomplete and inline errors. Do **not** add a `$schema` key to data files.

Rules the types don't fully enforce (see `design/decision-log.md`):

- **Nullable, not placeholder.** Unknown values are `null` (or empty arrays/objects). Never invent a value, write "TBD", or fill in from memory. Components render nothing for missing data.
- **Citations.** Every recommendation's `source.citedFrom` must name where it came from.
- **Trip-1 vs trip-2 statuses are distinct.** `attended-anyway` and `retroactive-recommendation` are trip-1 *provenance markers*, not outcome claims (D22). Don't convert between trip-1 and trip-2 statuses.
- **Adherence numbers** come verbatim from `data/maps-trip-analysis-public.json` `perCityAdherence`, never re-derived by counting statuses.
- **Bulk changes** go through `tools/ingest-guides.mjs` (run with `--dry-run` first) rather than hand-editing 15 files. Per-city corrections that must survive re-ingest belong in `data/city-overrides.json` (field patches, plus `additionalRecommendations` per D24). A direct edit to a generated city file is lost on the next ingest. Read the script before running it for real.
- Adding a city = adding one `cities/<id>.json` whose `id` matches its `cityIndex.json` entry. No route work.
- If the edit comes from a manual data pass, check `design/manual-steps.md` and update its status there.

Finish with the `validate` skill (check → lint → build).
