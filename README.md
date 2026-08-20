# The Long Way Home

*(working title — the repo is `field-notes`)*

A retrospective website for a coast-to-coast relocation arc: **Portland → Austin** (Oct 2025) → **New Orleans interlude** (Feb 2026) → **Austin → Philadelphia** (May 2026). One arc, two migrations, three chapters — 18 cities, 242 days, ~4,800 miles.

This repo holds everything for the project: the design docs, the trip guides used on the road, page mockups, reconstruction data, and the SvelteKit site itself.

## The concept

The site is an **analysis, not a travel blog** — data-forward by identity, editorial by voice. It's built around two theses:

1. **The comparison thesis.** Trip 1 (west) was instinct travel — no guides existed. Trip 2 (south) was curated travel, with 10-category sourced guides per city. Generating retroactive guides for the trip-1 cities creates a control group, making the site's signature question answerable with real data: *does curation change where you end up, or confirm your instincts?* Trip-1 and trip-2 data are semantically different and are never visually conflated.
2. **The corridor thesis.** The route is accidentally a transect of American history and economics: the interstate West, the civil rights corridor, municipal fragmentation (the city-proper vs. metro gap as a chartable proxy for racial-political history), and 2025–26 prices as a time capsule. The analytical layer is substantive content, not garnish.

Full details in [`design/design.md`](design/design.md).

## Repo layout

| Path | What it is |
|---|---|
| [`design/design.md`](design/design.md) | The design doc: concept, architecture, visual system, page/component inventory, and the field-level data schema |
| [`design/decision-log.md`](design/decision-log.md) | Endorsed decisions with rationale, plus open questions |
| [`design/rejection-log.md`](design/rejection-log.md) | Rejected alternatives and non-goals with rationale |
| [`design/implementation-plan.md`](design/implementation-plan.md) | Build milestones and the data-reconstruction audit |
| [`design/roadmap.md`](design/roadmap.md) | Floated-but-unendorsed feature ideas |
| [`setup/roadtrip/`](setup/roadtrip/) | **The site** — a build-verified SvelteKit scaffold with the design tokens, typed schema, components, and sample Birmingham data |
| [`setup/roadtrip-setup-guide.md`](setup/roadtrip-setup-guide.md) | Verified local setup, GitHub, Vercel, and ImageKit deployment steps, plus the data-entry workflow |
| [`Itineraries/`](Itineraries/) | The original trip-2 HTML city guides (Shreveport → Philadelphia corridor, May 2026) and the civil-rights-corridor companions — the source material for trip-2 recommendation data |
| [`mockups/`](mockups/) | Static HTML mockups for the landing page and city page template, since ported into Svelte components |
| [`data/`](data/) | Raw reconstruction data (currently a speed-test export with per-city timestamps/coordinates) |

## The site

**Stack:** SvelteKit 2.63 · Svelte 5 (runes mode) · Vite 8 · TypeScript · `adapter-static` with full prerendering. Deployed GitHub → Vercel (Hobby), photos via ImageKit. No backend, no CMS — **the database is Git**: all content is JSON in `src/lib/data/`.

```bash
cd setup/roadtrip
npm install
npm run dev -- --open   # dev server
npm run check           # type-check pages AND city JSON against the schema
npm run build           # static build (prerenderer hard-fails on broken links)
```

### Adding a city

Copy `src/lib/data/cities/birmingham-al.json`, rename it to the city ID, and fill it in — the glob import in `src/routes/city/[slug]/+page.ts` discovers it, prerenders the page, and the landing link goes live on the next build. No route work per city. Cities without a JSON file render as non-linked "data pending" everywhere (this is load-bearing: the prerender crawler fails the build on broken links — keep the pattern when adding new link surfaces).

The schema doc is the field reference; every field is nullable and the site renders gracefully around gaps. `npm run check` rejects malformed city data before it can break a build.

### Key rules baked into the types

- **Status color law:** attended = green · off-guide = blue · closed = burnt · skipped = muted · trip-1 instinct-hit = gold fill · trip-1 retro-pick = gold dashed outline. Trip-1 statuses (`attended-anyway`, `retroactive-recommendation`) never share colors with trip-2 statuses.
- **Every recommendation is citable:** `source.citedFrom` (atlasobscura / tasteatlas / eater / timeout / web-search / local-tip / self) is enforced at the type level — citation is a rendering requirement.
- **Motion** stays behind `prefers-reduced-motion`.

## Status (as of design doc v1)

Schema frozen; scaffold build-verified; landing page and city template built (all runes-mode components: `ConstellationMap`, `StatStrip`, `Fingerprint`, `Waffle`, `RecommendationList`, `FragmentationBar`, `FieldNotes`, `PopCulture`). Trip chapter pages, the data deep-dive, superlatives, and the colophon are unbuilt or stubs. **All displayed numbers are sample data pending reconstruction.**

Time-sensitive reconstruction actions (Google Maps Timeline export, Spotify extended history, harvesting guide localStorage before it evaporates) are tracked in [`design/implementation-plan.md`](design/implementation-plan.md) milestone M0.

## Goals / non-goals

**Goals:** a permanent personal artifact · a SvelteKit learning vehicle · every recommendation citable to source · graceful incremental buildout (publishable at every stage of data entry) · $0 hosting.

**Non-goals:** CMS or backend · comments/social · SEO · supporting other people's trips · real-time anything.
