# Rejection Log

Things considered and rejected, with why — so they don't get re-litigated. The index is for targeted lookup; fuller rationales follow. Accepted counterparts live in [`decision-log.md`](decision-log.md).

## Index

| # | Rejected | In favor of |
|---|---|---|
| [R1](#r1-cms-or-backend-of-any-kind) | CMS or backend of any kind | JSON in Git ([D7](decision-log.md#d7-static-only-database-is-git)) |
| [R2](#r2-comments--social-features) | Comments / social features | Permanent personal artifact |
| [R3](#r3-seo-ambitions) | SEO ambitions | — |
| [R4](#r4-supporting-other-peoples-trips) | Supporting other people's trips | Single-arc site (Trip-3 slot exists structurally, see roadmap) |
| [R5](#r5-real-time-anything) | Real-time anything | Full prerender |
| [R6](#r6-two-trips-framing) | "Two trips" framing | Three-chapter arc ([D1](decision-log.md#d1-three-chapter-arc-framing)) |
| [R7](#r7-photo-led-city-pages) | Photo-led city pages / travel-blog identity | Fingerprint-led ([D6](decision-log.md#d6-fingerprint-leads-the-city-page)) |
| [R8](#r8-real-basemap-on-the-landing-page) | Real basemap on the landing page | Constellation ([D5](decision-log.md#d5-constellation-landing-map-no-basemap)) |
| [R9](#r9-portland-in-the-hit-rate-analysis) | Portland in the hit-rate analysis | Excluded ([D2](decision-log.md#d2-retroactive-guides-for-trip-1-portland-excluded)) |
| [R10](#r10-omitting-the-hit-rate-module-on-trip-1-pages) | Omitting the hit-rate module on trip-1 pages | Retroactive guides ([D2](decision-log.md#d2-retroactive-guides-for-trip-1-portland-excluded)) |
| [R11](#r11-shared-status-colors-across-trips) | Shared status colors across trips | Distinct palettes ([D3](decision-log.md#d3-distinct-trip-1-status-enum), [D11](decision-log.md#d11-status-color-law)) |
| [R12](#r12-sveltekit-config-in-svelteconfigjs) | SvelteKit config in `svelte.config.js` | `vite.config.ts` |
| [R13](#r13-serverless-functions) | Serverless functions | Static-only ([D7](decision-log.md#d7-static-only-database-is-git)) |
| [R14](#r14-git-ignored-overlay-for-sensitive-fields) | Git-ignored overlay for sensitive fields | Fully public ([D16](decision-log.md#d16-public-data-posture)) |
| [R15](#r15-full-scrollytelling-as-the-initial-chapter-build) | Full MapLibre scrollytelling as the initial chapter build | Leg-ledger first ([D17](decision-log.md#d17-leg-ledger-chapter-pages-first)) |
| [R16](#r16-15-rating-scale) | 1–5 rating scale | Binary rating ([D18](decision-log.md#d18-binary-recommendation-rating)) |
| [R17](#r17-the-instinct-vs-curation-framing) | "Instinct vs. curation" framing | Self- vs sourced curation ([D22](decision-log.md#d22-self-curation-vs-sourced-curation-supersedes-the-instinct-framing)) |

## Rejections

### R1 — CMS or backend of any kind

Nothing to maintain, nothing to pay for, nothing to migrate. All content is typed JSON in the repo; Git is the CMS, PR diffs are the edit history.

### R2 — Comments / social features

The site is a permanent personal artifact, not a platform. No audience mechanics.

### R3 — SEO ambitions

Not a goal. No structured-data chasing, no content shaped for search.

### R4 — Supporting other people's trips

Generalizing the schema and templates for arbitrary trips would tax every design decision. A Trip-3 slot exists structurally (the `trips.json` array), but building for other users is out of scope.

### R5 — Real-time anything

Everything is known at build time; full prerender. No live data, no client fetching.

### R6 — "Two trips" framing

Rejected because the move is the story, not the driving. The relocation arc with a NOLA interlude is the narrative spine (see D1).

### R7 — Photo-led city pages

A photo-hero layout reads as a travel blog. The site's identity is analysis — the data fingerprint opens each city page; photos are texture, not lead (see D6).

### R8 — Real basemap on the landing page

A MapLibre/tile basemap adds a dependency and visual noise for a page whose job is atmosphere. The dependency-free SVG constellation is distinctive; real geography is deferred to chapter pages (see D5).

### R9 — Portland in the hit-rate analysis

Scoring a curated guide against one's own hometown is a category error — instinct vs. curation is meaningless where instinct had years of head start. Portland keeps a city page but is excluded from the comparison metric (see D2).

### R10 — Omitting the hit-rate module on trip-1 pages

The considered alternative to retroactive guides: trip-1 pages simply drop the waffle/hit-rate module via the nullable-field principle, and citations appear only on trip-2 pages. Rejected because it forfeits the site's signature question — the instinct-vs-curation comparison needs a control group spanning the full arc (see D2).

### R11 — Shared status colors across trips

Trip-1 and trip-2 statuses are semantically different (retro-guide epistemics vs. lived-guide epistemics). Rendering them in one palette would visually conflate guided and unguided data and quietly misrepresent the comparison thesis (see D3, D11).

### R12 — SvelteKit config in `svelte.config.js`

Obsolete in the current template; config lives in `vite.config.ts`. Recorded so nobody "fixes" it backward.

### R13 — Serverless functions

Even free-tier serverless breaks the portability and zero-maintenance guarantees. `adapter-static` output runs anywhere forever (see D7).

### R14 — Git-ignored overlay for sensitive fields

The considered alternative to a fully public repo: keep spend/lodging in a git-ignored file loaded at build time, so money stays out of Git history while the public repo carries only non-sensitive data. Rejected in favor of a single fully public data layer (D16) — the site is a permanent personal artifact (R2), and the overlay split adds build complexity and a two-tier schema for no benefit the owner wants.

### R15 — Full scrollytelling as the initial chapter build

Building the full MapLibre scroll-driven panning map as the first version of the chapter pages (~2–3 sessions). Not rejected as a feature — it remains the endorsed upgrade path on the roadmap — but rejected as the *initial* build in favor of the leg-ledger (D17). Leg data isn't reconstructed yet, and committing 2–3 sessions to a showpiece before seeing the legs rendered is premature; the ledger ships in ~1 session and is upgradeable.

### R16 — 1–5 rating scale

A five-point rating on every recommendation, for finer-grained superlatives (ranked bests, "top 5"). Rejected in favor of a binary would-return signal (D18): a 1–5 scale means scoring a number for every recommendation across 18 cities and invites calibration drift (the same failure mode D12 guards against for fingerprints). Binary is enough for "keepers"-style superlatives and is upgradeable to 1–5 later.

### R17 — The "instinct vs. curation" framing

The site's original signature question: trip 1 as unguided instinct travel, trip 2 as curated travel, with the retro guides as a control group measuring whether curation changes where you end up. **Rejected on evidence, not preference** — `data/maps-trip-analysis-public.json` shows every trip-1 city had a 32–42 place self-made Google Maps list (252 saved places across trip 1). There was no unguided condition to compare against; the framing described an experiment that never ran.

Replaced by self-curation vs sourced curation (D22), which the same data answers directly: list-following barely moved (47.4% → 52.5%), but content inverted (books ×6.9, museums ×2.9, records 0→24). Recorded here because the instinct framing is intuitive, is still written into older drafts, and would otherwise get reintroduced — every trip-1 page rendering a "hit by instinct" count is a symptom of it.

### R18 — `InterestDiptych.svelte` as the trip1→trip2 interest-mix view

`mockups/InterestDiptych.svelte` (plus its `.props.json`) was the original design for comparing interest-category mix across trips — never ported to the live site. Superseded rather than resurrected: M5a shipped `CurationSlope.svelte` on `/data` for the same comparison, reading `comparison.interestMix` verbatim per D22/D27.

The diptych's one feature `CurationSlope` doesn't have — a hover reveal of the top direction-targets per category per trip — stays unbuilt. Its own doc comment says it needs a `category_places.json` that doesn't exist anywhere in the repo; building it is a new data-reconstruction pass, not a component port. Recorded so the file doesn't keep reading as an open porting task.

### R19 — A per-city navigated-interest module

The obvious follow-on to [M5e](m5e-interest-composition.md): pair each city's *guide* interest composition with what was actually navigated to, from `visited.json`'s `interestTagCounts`. Rejected on the data, not on appetite.

Three separate problems, any one of which would be enough. The two vocabularies **overlap on 2 of 8 tags** — only `books` and `food`; the guide axis has `diy`, `punk`, `political`, `drinks`, `bees`, the Maps axis has `coffee`, `film`, `museums_history`, `outdoors`, `records_music`. `interestTagCounts` sums **direction requests, not places** (Atlanta: 14 places, 52 tag-counts), so it has a different denominator than the guide composition's per-pick counts. And it is computed over `topPlaces`, truncated to the **8–14 most-navigated places per city** — Las Vegas totals 9 tag-counts in all.

Rendered side by side these would read as one comparison while being three different measurements — the `0 / N` and unweighted-mean failure mode (D27) with better graphics. The underlying finding it was reaching for is already carried honestly by [M5b](m5b-visited-places.md)'s provenance split and [M5d](m5d-improvisation-finding.md).

Revisit only with an untruncated per-city navigation set tagged against the *guide's* vocabulary — which is a re-derivation of the corpus, not a component.
