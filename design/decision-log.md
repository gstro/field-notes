# Decision Log

Endorsed decisions with rationale. The index is for targeted lookup; full rationales follow. Rejected alternatives live in [`rejection-log.md`](rejection-log.md). Open questions are at the bottom — they are *not* decisions yet.

## Index

| # | Decision | Status |
|---|---|---|
| [D1](#d1-three-chapter-arc-framing) | Three-chapter arc framing (not "two trips") | Final |
| [D2](#d2-retroactive-guides-for-trip-1-portland-excluded) | Retroactive guides for trip 1; Portland excluded | Final; framing superseded by [D22](#d22-self-curation-vs-sourced-curation-supersedes-the-instinct-framing) |
| [D3](#d3-distinct-trip-1-status-enum) | Trip-1 statuses `attended-anyway` / `retroactive-recommendation` | Final; redefined as provenance (M3.5, Aug 2026) |
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
| [D21](#d21-trip-2-guide-statuses-map-to-unverified) | Trip-2 guide statuses map to `unverified` | Provisional (M3, Aug 2026) |
| [D22](#d22-self-curation-vs-sourced-curation-supersedes-the-instinct-framing) | Self-curation vs sourced curation supersedes the instinct framing | Final (M3.5, Aug 2026; resolves O6) |
| [D23](#d23-populationnote-stored-not-rendered) | `population.note` stored, not rendered | Final (M3.7, Aug 2026) |
| [D24](#d24-additive-overrides-reviewed-restorations-survive-regeneration) | Additive overrides — reviewed restorations survive regeneration | Final (M3.7, Aug 2026) |

## Decisions

### D1 — Three-chapter arc framing

The site frames the story as one arc with three chapters — Portland → Austin (relocation), New Orleans (interlude), Austin → Philadelphia (relocation) — not as "two trips." The move is the story; NOLA is an interlude `type` in `trips.json`, and `type` drives layout (interludes get a lighter chapter treatment).

### D2 — Retroactive guides for trip 1; Portland excluded

> **Framing superseded by [D22](#d22-self-curation-vs-sourced-curation-supersedes-the-instinct-framing) (Aug 2026).** The premise below — "trip 1 was instinct travel (no guides existed)" — is false; every trip-1 city had a 32–42 place self-made Google Maps list. The *decision* (generate retro guides, exclude Portland) stands unchanged and is if anything better motivated under D22. Only the characterization of trip 1 changes.

~~Trip 1 was instinct travel (no guides existed); trip 2 was curated travel.~~ Generating retroactive 10-category guides for the trip-1 cities creates a control group, making the site's signature question answerable with real data. The anachronism (retro guides built with 2026 sources) is disclosed on the colophon. Portland is excluded from the hit-rate analysis: scoring a guide against one's own hometown is a category error. Resolved Jul 2026; Greg generates the guides separately.

### D3 — Distinct trip-1 status enum

**Both values are provenance markers, not outcome claims** (redefined M3.5, Aug 2026 — see [D22](#d22-self-curation-vs-sourced-curation-supersedes-the-instinct-framing)):

- `attended-anyway` — the retro guide picked this **and** it was visited. (Previously "organic overlap with a guide that didn't exist yet"; under D22 trip 1 *was* self-guided, so "organic" was wrong.)
- `retroactive-recommendation` — the retro guide picked this; **visit status unknown**. (Previously "the guide would have suggested it, but there was no opportunity to act" — an outcome claim asserting not-visited, which the Takeout data contradicts for a large share of recs. It also *rendered*, as the waffle legend "Retro pick (no chance to act)".)

Trip-1 has no equivalent of trip-2's `unverified`, so `retroactive-recommendation` carries the unknown case. These remain epistemically different from trip-2 statuses (`attended`, `planned-skipped`, `off-guide-discovery`, `closed-on-arrival`, `unverified`) and must never share colors — the two curation methods are never visually conflated. D11's color law is unchanged.

The per-city `attended-anyway` count is a **floor**, not a rate: the public Takeout export truncates `topPlaces` to the top ~8–14 places per city, so most visits are simply not in the data. The comparison metric itself comes from `perCityAdherence`, not from counting statuses — see D22.

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

### D21 — Trip-2 guide statuses map to `unverified`

The 14 generated guides ([M3](m3-guide-ingest.md)) use `sourced-recommendation` for every trip-2 recommendation — meaning "the guide listed this," not an outcome. `RecStatus` has no "listed, outcome not yet reconciled" value; the closest existing member is `unverified`, which DC's M2 file already uses with exactly this meaning. Mapped `sourced-recommendation` → `unverified` rather than adding a schema member. **Provisional**: every trip-2 rec across the 7 trip-2 cities is `unverified` (minus join-confirmed visits) until real attendance data (memory + photos + calendar/ticket emails, per M0) lands and reassigns real statuses.

*Corollary updated (M3.6):* D21 originally noted DC as keeping its M2 hand-transcription. That no longer holds — DC was regenerated from its guide, since its dummy statuses and ratings had begun rendering as measurements. Reviewed corrections that must survive regeneration now live in `data/city-overrides.json`, applied by the transform after mapping; see [`m36-purge-invented-data.md`](m36-purge-invented-data.md). Status assignment is isolated in one function (`assignStatus` in `tools/ingest-guides.mjs`) specifically so this re-run is cheap. Trip-1's `retroactive-recommendation` has the mirror problem — see O6.

### D22 — Self-curation vs sourced curation supersedes the instinct framing

The site's signature question was *"does curation change where you end up, or confirm your instincts?"*, resting on D2's premise that trip 1 was unguided. **That premise is false.** `data/maps-trip-analysis-public.json` (Google Takeout, 26,779 entries, 73 saved lists / 2,338 places) shows every trip-1 city had a **32–42 place self-made Google Maps list**. Trip 1 ran on lists too — they were just self-authored.

The experiment is therefore **self-curation** (own judgment, no external sources) vs **sourced curation** (10-category guides built from Atlas Obscura / Eater / Time Out / TasteAtlas). Under that frame the finding sharpens rather than dissolves:

> The **degree** of list-following barely moved between methods — 47.4% vs 52.5% of navigation went to listed places. What inverted was the **content**. Sourced guides inflated list size ~55% (252→389) while conversion *dropped* (47%→40%): external sources grow the list, not the itinerary. Self-curation defaulted to sustenance (food 51, coffee 50 dominate trip 1); sourced curation surfaced the interest profile — books ×6.9 (11→76), museums/history ×2.9 (15→44), record stores 0→24. Outdoors was flat (14→17). **The curation source changed what got curated, not how faithfully it was followed.**

Consequences:

- The comparison metric is `perCityAdherence` / `comparison` in the analysis file — computed from the full corpus *before* sanitization. It is authoritative and must not be recomputed from the public file or inferred from rec statuses.
- D3's two trip-1 statuses become provenance markers (above).
- The guide-hit-rate question is separate from the thesis question, needs a different source, and is only recoverable as a floor. The two get separate rendered panels; conflating them is what produced the `0 / N` defect M3 shipped.
- D2's retro-guide decision and Portland exclusion are unaffected.

Resolves O6. Method caveats that bound every claim above are recorded in [`m35-headline-metric.md`](m35-headline-metric.md).

### D23 — `population.note` stored, not rendered

`City.population` gains `note: string | null`, carried verbatim from the guides. All 14 guides have one; **ten carry the D8 mechanism behind that city's fragmentation gap** — OKC annexed aggressively (the metric inverts), Atlanta fragmented via the cityhood movement, the Las Vegas Strip sits in unincorporated Clark County, Richmond is a Virginia independent city, DC cannot annex at all.

**Rendered nowhere**, because every note mixes that content with authoring self-reference (*"consistent with the caveat practice established in the Oklahoma City and Dallas JSON files"*, *"fragmentationRatio left null: …"*). Publishing it verbatim would put shop talk on a public page. Storing it preserves the content; turning it into reader-facing prose is an editorial pass, and that pass is outstanding. Same shape as M3.5's compute-but-don't-render call on the saved-list overlap.

`fragmentationRatio` is `null` in all 14 guides and has no schema home; it is not carried.

### D24 — Additive overrides: reviewed restorations survive regeneration

`data/city-overrides.json` (D-less mechanism introduced in M3.6 for field patches) gains `additionalRecommendations` — whole recommendations a reviewer restored, appended by `transformCity` after mapping. Introduced to bring back 14 Washington DC venues that the generated guide doesn't cover and that M3.6 dropped, each carrying a citation recovered by hand in M2.

Rules that keep it from becoming a back door:

- Entries **cannot** set `status`, `rating` or `verifiedOpen` — the transform owns those, so a restored venue can never assert an outcome. Attempting to set one is a hard error.
- Every entry is validated for required and unknown fields, failing with the venue name.
- **`join-takeout.mjs` matches additive entries exactly as it matches guide recs.** Without this a restored venue could only ever read as "visit unknown"; DC's `topPlaces` contains two of them (Library of Congress, Bridge Street Books), and both are confirmed visits.
- Each entry carries a `reason` recording where it came from.

Corollary: DC again has two provenances (55 guide-derived + 14 restored), a milder form of the split M3.6 ended. Deliberate, and recorded per entry.

## Open questions (undecided)

| # | Question | Decide by |
|---|---|---|
| O4 | When to hold the fingerprint scoring session (per D12, one sitting) | After a few cities' qualitative data lands |
| O5 | Whether legs need a `detours` field (OKC→Dallas logged at 7:49 — ~3.5 hrs of driving stretched to nearly 8 means stops) | During leg reconstruction |
| ~~O6~~ | ~~Whether D2/D3's "Trip 1 was instinct travel" framing survives the Takeout data~~ | **Resolved Aug 2026 — [D22](#d22-self-curation-vs-sourced-curation-supersedes-the-instinct-framing)** |
