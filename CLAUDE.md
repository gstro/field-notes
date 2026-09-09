# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

"The Long Way Home" (working title) — a retrospective website for a Portland → Austin → New Orleans → Philadelphia relocation arc, plus everything around it. The site itself lives in `setup/roadtrip/`; the rest of the repo is design docs (`design/`), the original HTML city guides that are source material for data entry (`guides/` — trip-2 guides plus bulk-generated trip-1 retro guides, both paired with a machine-generated `*-guide.json`), static HTML mockups already ported to Svelte (`mockups/`, with one exception — see `design/rejection-log.md` R18), and raw reconstruction data (`data/`).

## Commands

All site work happens in `setup/roadtrip/`:

```bash
cd setup/roadtrip
npm install
npm run dev -- --open   # dev server
npm run check           # svelte-check: validates pages AND city JSON against types.ts
npm run build           # static build — prerenderer hard-fails on broken links
```

There are no tests or linters; `npm run check` and `npm run build` are the validation gates. Run both after touching data JSON or components — `check` catches schema violations, `build` catches broken link surfaces.

## Site architecture

SvelteKit 2 / Svelte 5 (runes mode is **forced** via `vite.config.ts` — all config lives there, there is deliberately no `svelte.config.js`) / TypeScript / `adapter-static` with full prerender. No backend, no CMS: **the database is Git** — all content is JSON in `src/lib/data/`.

The data flow that takes multiple files to see:

- `src/lib/data/cityIndex.json` — thin registry of all 18 cities (id/coords/nights/label). Drives the landing constellation map and nav for *every* city, built or not.
- `src/lib/data/cities/*.json` — deep per-city files. `src/routes/city/[slug]/+page.ts` discovers them via `import.meta.glob` and generates prerender entries from whatever files exist. Adding a city = adding one JSON file; no route work.
- `src/lib/types.ts` — the enforced schema. `npm run check` rejects malformed city JSON.
- `src/lib/registry.ts` — display enums: the 10 guide categories, source labels, and status→chip-class mapping.
- Cities in `cityIndex.json` with no `cities/*.json` file must render as non-linked "data pending" everywhere. This is load-bearing: the prerender crawler fails the build on links to unbuilt pages. Preserve this pattern on any new link surface.

Design tokens are in `src/lib/tokens.css`; components in `src/lib/components/` are all runes-mode.

## Non-negotiable design rules

These are decided (see `design/decision-log.md` for rationale; don't re-litigate without the user):

- **Trip-1 vs trip-2 data are never visually conflated.** Trip-1 statuses (`attended-anyway`, `retroactive-recommendation`) never share colors with trip-2 statuses. Status color law: attended = green, off-guide = blue, closed = burnt, skipped = muted, trip-1 visited = gold fill, trip-1 retro-pick = gold dashed outline. Applies to any chart touching status.
- **The thesis is self-curation vs sourced curation, not instinct vs curation** (D22 — supersedes the older framing; see `design/rejection-log.md` R17). Trip 1 was *not* unguided: every trip-1 city had a 32–42 place self-made Maps list. Trip-1 statuses are **provenance markers, not outcome claims** — `retroactive-recommendation` means "the retro guide picked this; visit status unknown." The comparison metric comes from `perCityAdherence` in `data/maps-trip-analysis-public.json`, never from counting statuses; per-rec visit data is a floor only.
- **Every field is nullable** and components render nothing (not placeholders, not errors) for missing data — this keeps the site publishable at every stage of data entry.
- **Every recommendation carries `source.citedFrom`** (type-enforced); citation is a rendering requirement.
- **All motion behind `prefers-reduced-motion`.**

## Design docs

`design/` holds five docs with distinct roles: `design.md` (concept, architecture, visual system, full data-schema reference), `decision-log.md` (endorsed decisions, currently through D27, + open questions O4/O5), `rejection-log.md` (rejected alternatives, currently through R18), `implementation-plan.md` (milestones M0–M7, each with its own per-milestone doc once started), `roadmap.md` (unendorsed ideas). When work settles a decision or rejects an approach, record it in the matching log; new speculative features go to `roadmap.md`, not the plan.

## Current status

Schema frozen; landing page, city template, three chapter pages, the data deep-dive, and the colophon are built. 15 of 18 cities have real transcribed content (Birmingham's sample-data placeholder was replaced in M3); `portland-or`, `austin-tx`, `philadelphia-pa` remain "data pending" — they're origin/anchor/home waypoints with no guide, not a backlog. Superlatives is still a stub, blocked on a manual would-return-rating pass (`rating` is empty dataset-wide). See `design/implementation-plan.md`'s "Current state" line for the up-to-date milestone picture — this file is a slower-moving overview, not the source of truth for it.
