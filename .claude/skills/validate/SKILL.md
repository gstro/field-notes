---
name: validate
description: Run this repo's validation gates (svelte-check, lint, schema drift, static build) after touching components, routes, types.ts, or any data JSON, and interpret failures. Use before committing or opening a PR.
---

# Validate

All commands run in `setup/roadtrip/`. Run in this order and stop at the first failure:

1. `npm run check`: svelte-check. It validates the pages **and** every `src/lib/data/cities/*.json` against `src/lib/types.ts`, so a schema violation in city data shows up here as a TS error pointing into the importing route.
2. `npm run lint`: `prettier --check .` then `eslint .`. Fix formatting with `npm run format`. Data JSON under `src/lib/data/` is Prettier-ignored on purpose (hand-aligned rows); don't reformat it.
3. `npm run schemas && git diff --exit-code schemas/`: only needed if `types.ts` changed; commit the regenerated `schemas/city.schema.json`.
4. `npm run build`: the full prerender. A failure like `404 /city/<slug> (linked from ...)` means a new link surface points at a city that has no `cities/<slug>.json`. Cities in `cityIndex.json` without a deep file must render as non-linked "data pending"; fix the component, don't add a stub JSON.

CI (`.github/workflows/ci.yml`) runs the same four steps on every PR, so a green local run should mean a green PR.
