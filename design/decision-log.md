# Decision Log

Endorsed decisions with rationale. The index is for targeted lookup; full rationales follow. Rejected alternatives live in [`rejection-log.md`](rejection-log.md). Open questions are at the bottom — they are *not* decisions yet.

## Index

| # | Decision | Status |
|---|---|---|
| [D1](#d1-three-chapter-arc-framing) | Three-chapter arc framing (not "two trips") | Final |
| [D2](#d2-retroactive-guides-for-trip-1-portland-excluded) | Retroactive guides for trip 1; Portland excluded | Final (resolved Jul 2026) |
| [D3](#d3-distinct-trip-1-status-enum) | Trip-1 statuses `attended-anyway` / `retroactive-recommendation` | Final |
| [D4](#d4-every-recommendation-carries-sourcecitedfrom) | Every recommendation carries `source.citedFrom` | Final, type-enforced |
| [D5](#d5-constellation-landing-map-no-basemap) | Constellation (no basemap) for landing | Final |
| [D6](#d6-fingerprint-leads-the-city-page) | Fingerprint leads city page, photos don't | Final |
| [D7](#d7-static-only-database-is-git) | Static-only, no serverless; "the database is Git" | Final |
| [D8](#d8-fragmentation-bar-on-every-city-page) | Fragmentation bar on every city page | Final |
| [D9](#d9-every-field-nullable) | Every field nullable; graceful degradation | Final, schema principle |
| [D10](#d10-crawler-safety-data-pending-pattern) | Crawler-safety "data pending" pattern | Final, load-bearing |
| [D11](#d11-status-color-law) | Status color law | Final, applies to all future charts |
| [D12](#d12-one-sitting-fingerprint-scoring) | Fingerprint scoring in one sitting per trip | Final, scheduling open (O4) |
| [D13](#d13-skill-re-patch-before-retro-guides) | Guide skill re-patched before any retro guide generation | Done (Jul 6 2026) |
| [D14](#d14-visual-system-ported-from-trip-guides) | Visual system ported from the trip guides | Final |
| [D15](#d15-motion-behind-prefers-reduced-motion) | All motion behind `prefers-reduced-motion` | Final |
| [D16](#d16-public-data-posture) | Fully public data posture (resolves O2) | Final |
| [D17](#d17-leg-ledger-chapter-pages-first) | Leg-ledger chapter pages first (resolves O1) | Final |
| [D18](#d18-binary-recommendation-rating) | Binary recommendation rating (resolves O3) | Final |
| [D19](#d19-per-citation-source-urls) | Per-citation source URLs, not one shared URL | Final (M2, Aug 2026) |
| [D20](#d20-spend-and-lodging-field-on-city) | `spend`/`lodging` field on `City` | Final (M2, Aug 2026) |

## Decisions

### D1 — Three-chapter arc framing

The site frames the story as one arc with three chapters — Portland → Austin (relocation), New Orleans (interlude), Austin → Philadelphia (relocation) — not as "two trips." The move is the story; NOLA is an interlude `type` in `trips.json`, and `type` drives layout (interludes get a lighter chapter treatment).

### D2 — Retroactive guides for trip 1; Portland excluded

Trip 1 was instinct travel (no guides existed); trip 2 was curated travel. Generating retroactive 10-category guides for the trip-1 cities creates a control group, making the site's signature question — *does curation change where you end up, or confirm your instincts?* — answerable with real data. The anachronism (retro guides built with 2026 sources) is disclosed on the colophon. Portland is excluded from the hit-rate analysis: scoring a guide against one's own hometown is a category error. Resolved Jul 2026; Greg generates the guides separately.

### D3 — Distinct trip-1 status enum

Trip-1 recommendations use `attended-anyway` (organic overlap with a guide that didn't exist yet) and `retroactive-recommendation` (the guide would have suggested it, but there was no opportunity to act). These are epistemically different from trip-2 statuses (`attended`, `planned-skipped`, `off-guide-discovery`, `closed-on-arrival`, `unverified`) and must never share colors — guided and unguided data are never visually conflated. The per-city `attended-anyway` rate is the instinct-vs-curation metric.

### D4 — Every recommendation carries `source.citedFrom`

Citation is a rendering requirement, enforced at the type level. Enum: `atlasobscura` · `tasteatlas` · `eater` · `timeout` · `web-search` · `local-tip` · `self`. Off-guide discoveries use `local-tip` or `self`.

### D5 — Constellation landing map, no basemap

The landing hero is a data-driven SVG constellation projected from `cityIndex.json` (dot radius = 4 + 2√nights, capped at 20). Distinctive and dependency-free; real geography is deferred to the chapter pages.

### D6 — Fingerprint leads the city page

The 6-axis spider chart, not photos, opens each city page. This is the deliberate anti-travel-blog stance: data-forward by identity, editorial by voice.

### D7 — Static-only; "the database is Git"

SvelteKit `adapter-static` with full prerender, no serverless, no CMS. All content is JSON in `src/lib/data/`: `cityIndex.json` (thin registry) drives the map and nav; `cities/*.json` drive city pages. A city page and all links to it materialize automatically when its JSON lands. Rationale: free tier forever, portable, nothing to maintain. Corollary: config lives in `vite.config.ts`, not `svelte.config.js` (obsolete in the current template).

### D8 — Fragmentation bar on every city page

The city-proper vs. metro population gap is a chartable proxy for racial-political history — a recurring analytical through-line across all cities, not one-off trivia. `population.cityProper` / `population.metro` exist in the schema specifically for this.

### D9 — Every field nullable

The site renders gracefully around gaps — a missing spider axis or absent photo set degrades to nothing, not to an error or placeholder junk. This is what makes the site publishable at every stage of data entry. `npm run check` rejects malformed city data before it can break a build.

### D10 — Crawler-safety "data pending" pattern

The prerenderer hard-fails on broken links, so unbuilt cities render as non-linked "data pending" everywhere (landing, prev/next nav). Load-bearing: keep the pattern when adding any new link surface.

### D11 — Status color law

attended = green · off-guide = blue · closed = burnt · skipped = muted · trip-1 instinct-hit = **gold fill** · trip-1 retro-pick = **gold dashed outline**. Applies to waffles, chips, and any future chart touching status.

### D12 — One-sitting fingerprint scoring

All 18 cities' fingerprints (six 1–5 axes, subjective by design) are scored in one sitting per trip. Calibration drift across weeks of scoring would quietly corrupt the overlay comparisons. Scheduling is open question O4.

### D13 — Skill re-patch before retro guides

The project copy of the city-guide skill was missing Category 10 (DIY Electronics/Maker Spaces). Re-patched Jul 6 2026 (Category 10 + mandatory radical/infoshop search + must-see balance rule restored) so trip-1 retro guides don't inherit the old blindspot.

### D14 — Visual system ported from trip guides

For continuity with the guides used on the road: bg `#111009` (+ `#1C1A12`, `#252318` surfaces), burnt orange `#C85A00`/`#E8722A`, gold `#D4A843`, cream `#F5EDD8`, muted `#8A8270`, hairline gold borders; Playfair Display / IBM Plex Mono / IBM Plex Sans 300. Tokens in `src/lib/tokens.css`.

### D15 — Motion behind `prefers-reduced-motion`

Route draw-on and any scroll effects always respect `prefers-reduced-motion`. Decorative motion stays subtle; the constellation draw is the one theatrical moment.

### D16 — Public data posture

The site is **fully public**: spend, lodging costs, and all recovered data enter Git history and render on the site. No git-ignored overlay file, no split between public and private fields (the rejected alternative, R14). Rationale: the site is a permanent personal artifact (R2), and a single public data layer is the simplest thing to build and reason about. Resolves O2. Corollary: real data transcription (M2) is now unblocked.

### D17 — Leg-ledger chapter pages first

The three chapter pages render the driving legs as a **leg-ledger** (a structured ledger/table of legs, ~1 session), not the full MapLibre scroll-driven panning showpiece up front. The showpiece is deliberately deferred to a roadmap upgrade path (not rejected — see R15): leg data isn't reconstructed yet, and seeing the ledger with real data before committing 2–3 sessions to scrollytelling keeps momentum and defers the big spend until it's earned. The NOLA interlude keeps its lighter `type`-driven treatment (D1). Resolves O1.

### D18 — Binary recommendation rating

Recommendations carry a **binary** rating (a single would-return / not signal), not a 1–5 scale (the rejected alternative, R16). Enough to derive "keepers"-style superlatives without assigning a number to every recommendation across 18 cities, and without the 1–5 calibration drift that parallels the D12 concern. Upgradeable to 1–5 later if the superlatives page wants finer ranking. Resolves O3; the `rating` field types as `boolean | null`.

### D19 — Per-citation source URLs

`Recommendation.source.citedFrom` changes from `CitedSource[]` sharing one `source.url` to `Citation[]` — `{ source: CitedSource; label: string | null; url: string | null }[]`. Surfaced during M2 (Washington DC transcription): real recommendations frequently carry two sources (e.g. Atlas Obscura + a local paper) linking to two different URLs, which the shared-URL shape couldn't express, and `RecommendationList.svelte` was pointing every citation chip at the same link regardless of which source it labeled. `label` carries the real publication/site name when known (e.g. "nps.gov"), falling back to `SOURCE_LABELS[source]` when absent. The `CitedSource` enum itself (D4) is unchanged. Corollary: where a guide's per-item source wasn't recoverable, the citation is `{ source: 'web-search', label: null, url: null }` — never an invented attribution, even to make citation chips look more varied. This is a colophon (M6) error-bar item.

### D20 — `spend` and lodging field on `City`

Added `spend: { total, byCategory, lodging } | null` to the `City` schema. M2's own scope said spend and lodging "go straight into the city JSON" once O2 resolved public (D16), but no such field existed. Populated `null` for now — the card-statement CSV export (M0) hasn't landed. A guide's pre-trip cost estimate (e.g. "~$200 Est. Total") is not reconstructed spend and does not populate this field.

## Open questions (undecided)

| # | Question | Decide by |
|---|---|---|
| O4 | When to hold the fingerprint scoring session (per D12, one sitting) | After a few cities' qualitative data lands |
| O5 | Whether legs need a `detours` field (OKC→Dallas logged at 7:49 — ~3.5 hrs of driving stretched to nearly 8 means stops) | During leg reconstruction |
