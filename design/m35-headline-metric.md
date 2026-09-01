# M3.5 — Fix the headline metric: settle O6, land the takeout join

Per-milestone doc, matching the [`m2-`](m2-first-city.md)/[`m3-`](m3-guide-ingest.md) pattern. Covers the defect M3 shipped and flagged, the framing question that had to be settled to fix it, and the Google Takeout join that supplies the replacement numbers.

## The defect this fixes

M3 shipped with 13 of 14 city pages rendering **`0 / N`** as their headline metric. `Waffle.svelte` computed `hit` from `attended` + `attended-anyway`; the M3 ingest assigned neither, so every page asserted a zero hit rate — contradicted by `data/maps-trip-analysis-public.json`, committed in the same repo, which puts the real trip-1 on-list rate near 47%.

**Root cause was not the missing data. It was one panel serving two questions with two different evidentiary bases:**

| Question | Source | Recoverable as |
|---|---|---|
| **Thesis** — self- vs sourced curation | `perCityAdherence` / `comparison`, computed from the full 26,779-entry corpus *before* sanitization | An authoritative rate |
| **Guide hit rate** — of 705 recs, how many were visited | Name join against `topPlaces` | A **floor only** |

They are now two panels with two sources. Conflating them is what produced a number that looked measured and was wrong.

## O6 resolved → D22

`data/maps-trip-analysis-public.json` carries `thesis.supersedes`: *"v1 framing ('instinct, no guides') — revised 2026-07-19 after the saved-lists corpus surfaced."* Every trip-1 city had a 32–42 place self-made Google Maps list. Trip 1 was never unguided.

The framing is now **self-curation vs sourced curation** ([D22](decision-log.md#d22-self-curation-vs-sourced-curation-supersedes-the-instinct-framing); the retired framing is [R17](rejection-log.md#r17-the-instinct-vs-curation-framing)). The finding sharpens rather than dissolves: list-following barely moved (47.4% → 52.5%), but content inverted — books ×6.9, museums/history ×2.9, record stores 0→24, outdoors flat. **The curation source changed what got curated, not how faithfully it was followed.**

D3's two trip-1 statuses were **outcome claims and are now provenance markers**. `retroactive-recommendation` previously meant "there was no opportunity to act" — asserting not-visited — and rendered as the legend *"Retro pick (no chance to act)"*. It now means *"the retro guide picked this; visit status unknown."* No schema change; enum names unchanged.

Also updated: `CLAUDE.md`, `design/design.md` (thesis statement + the `status` schema notes).

## Why the hit rate is a floor — the M6 colophon's error bar

`topPlaces` is truncated to the **top ~8–14 places per city**: 151 entries across the 14 guide cities, against **1,102 unique direction targets** corpus-wide. A match proves a visit; **a non-match proves nothing.**

Confirmed-visit floor: **48 recs / 42 distinct venues, of 705**.

| city | recs | topPlaces | matched recs | distinct venues |
|---|---|---|---|---|
| albuquerque | 52 | 9 | 0 | 0 |
| atlanta | 51 | 14 | 6 | 6 |
| birmingham | 47 | 11 | 4 | 4 |
| boise | 52 | 10 | 4 | 4 |
| charlotte | 50 | 11 | 5 | 3 |
| dallas | 52 | 8 | 3 | 2 |
| jackson | 53 | 11 | 7 | 6 |
| las-vegas | 50 | 10 | 1 | 1 |
| oklahoma-city | 52 | 9 | 5 | 4 |
| phoenix | 47 | 11 | 1 | 1 |
| richmond | 46 | 10 | 4 | 4 |
| salt-lake-city | 50 | 12 | 1 | 1 |
| shreveport | 48 | 12 | 5 | 4 |
| washington-dc | 55 | 13 | 2 | 2 |

Rendering follows from this: `≥4 of 52`, never `4 / 52`; Albuquerque (no matches) shows `—`, not `0`. Unmatched recs render in a distinct **dotted "visit unknown"** cell — deliberately not the `skipped` style, which asserts a decision not to go. Absence of evidence must not read as a finding.

### Residual: Washington DC's floor is not measured — ✅ closed in M3.6

> **Resolved.** DC was regenerated from its guide in [M3.6](m36-purge-invented-data.md); its dummy statuses and ratings are gone and it now reads `≥2 of 55`, join-derived like every other city. The section below is kept as the record of the defect and why it was left standing for one chunk.


**`washington-dc` reads `≥39 of 57`, and that number is dummy data.** DC's city file is the M2 hand-transcription, whose statuses were assigned mechanically for display purposes and never reflected a record of what happened (`m2-first-city.md`: *"Every recommendation's `status` and `rating` are dummy values"*). The Takeout join found 2 confirmed visits for DC's guide, but that guide is not the source of DC's city file, so the join does not touch it.

This is the same defect class this milestone fixes — a page asserting a measured-looking number from unmeasured data — and it is the **only** one left. It survives here because correcting it requires the two-DC-sources reconciliation deferred in `m3-guide-ingest.md`, not because it is acceptable. **DC's floor should not be cited anywhere until that lands.** Every other city's floor is join-derived and real.

## Method caveats that bound every claim

From `comparison.methodNotes` — all three constrain what the site may say:

1. **Adherence is directions-only.** `place_view` matches were excluded as circular — browsing a saved list generates a `place_view` for each item.
2. **Interest categories are keyword-tagged on direction-request names** — a rough instrument; uninformatively-named places tag as nothing.
3. **Per-item save timestamps do not exist in the export, and list files were edited during trips** (mtimes fall inside visit windows), so pre-trip saves cannot be cleanly separated from in-situ saves.

Caveat 3 is why the saved-list overlap is computed and documented here but **does not render**: some overlap may be places saved while already standing in them, which makes "the guide picked what I'd already chosen" partly circular.

## The matcher — and why the naive version was wrong

`tools/join-takeout.mjs`. Four iterations, each driven by a labeled failure; recording them because the counts are load-bearing and the wrong matcher is genuinely convincing.

**The original probe stripped venue-type words as noise** (`coffee`, `books`, `records`, `bar`, `shop`). That turned `Coffee Garden` into `garden`, which substring-matched `Gilgal Sculpture Garden` — two unrelated Salt Lake City places. Deleting those words destroys the name; the fixed matcher **keeps** them, folds morphological variants to a stem (`Books`/`Bookshop`/`Book Store` → `book`), and caps their IDF so they can neither carry a match alone nor break one by being absent.

**Thresholds on token count, string length, or IDF mass all failed**, because the true and false cases are indistinguishable on every one of those axes:

```
MATCH   summum pyramid       ~ summum
MATCH   deep vellum book     ~ deep vellum book publishing
MATCH   meow wolf grapevine  ~ meow wolf grapevine real unreal
REJECT  coffee garden        ~ gilgal sculpture garden
REJECT  noble record         ~ noble smoke
REJECT  publik cafe roast    ~ kings peak cafe roast
```

What separates them is that **venue names are head-initial** — the identifying word comes first, qualifiers accrete rightward. So a match requires one name's token sequence to be a **prefix** of the other's, with the shared prefix carrying enough IDF weight that a generic head can't match everything. Every case above falls out correctly.

Supporting rules: guide recs carrying a dish/product prefix are split on `--`/`—`/`/` so the venue half can match (`Beef Tongue & Croquetas -- Bar Gernika` → `Bar Gernika`); IDF is computed **per city**, since the distinctiveness of "virginia" is a property of the Richmond corpus, not of English.

**Regression guard:** `node tools/join-takeout.mjs --naive` re-runs the broken normalizer alongside the fixed one and prints matches only the naive version makes. It must continue to report `Coffee Garden` ← `Gilgal Sculpture Garden`, `Noble Records` ← `Noble Smoke`, and `Virginia Peanuts` ← `The Virginia Shop` as rejected.

**All 48 confirmed-visit rows were reviewed by hand** (`tools/.takeout-join-report.md`, regenerable). Every row is a genuine venue match; no false positives survived.

## Saved-list overlap — computed, documented, not rendered

**190 recs / 164 distinct venues** overlap between the 2026 guides and the self-made Maps lists: places a sourced guide independently picked that were already self-curated. This is the sharpest form of the D22 question, and the full table lives in `tools/.takeout-join-report.md`.

> **Corrected in [M3.7](m37-colophon.md): 189 recs / 163 venues.** The deferred review was carried out and found one false positive — `Boise Co-op` ← `Boise Whitewater Park`. "Co-op" reduces to nothing (both fragments are ≤2 characters and drop out), leaving a bare city name that prefix-matched anything beginning with "Boise": the same failure shape as the `Coffee Garden` → `garden` bug, one layer down. Fixed by capping a city's own name tokens in `buildIdf` alongside `GENERIC`. **Rendering is still deferred** — review settles match quality, not the in-situ-save circularity below, which was the actual reason for holding it back.

It does not render yet, for two reasons (the circularity below now has a *rendered* surface that discloses it inline — see [M5b](m5b-visited-places.md), where visit provenance is shown with both bounds stated; the list-agreement number this section describes remains unrendered): caveat 3 above (in-situ saves), and the rule that a number gets reviewed before it becomes site content — M3 shipped an unvalidated one and this chunk exists to fix it. Rendering is the next chunk's call.

Per-city spread, for the review: albuquerque 8 · atlanta 22 · birmingham 22 · boise 15 · charlotte 20 · dallas 13 · jackson 24 · las-vegas 7 · oklahoma-city 11 · phoenix 5 · richmond 14 · salt-lake-city 3 · shreveport 11 · washington-dc 15. Salt Lake City's 3 against Jackson's 24 is the discriminating pair to eyeball — SLC's low count is now believed real (its saved list skews to chain/utility stops the guides would never pick), but that is a judgment, not a verified fact.

## Greensboro — one genuine off-guide discovery — ✅ rendered in M4a

`sideTrips` records the **International Civil Rights Center & Museum** (×8 direction requests, Greensboro NC, en route Charlotte→Richmond, May 2026) as *"Woolworth sit-in site — civil rights corridor stop not in any guide."*

This is the only true `off-guide-discovery` in the corpus — a status the site has never rendered. It is deliberately **not** forced into a city file: it belongs to a leg, not a city, and inventing a Greensboro city page or attaching it to Charlotte would misrepresent where it happened. **Noted for M4's leg work — and rendered there:** it now appears on the `south` chapter page under "Off the route" ([M4a](m4a-chapter-pages.md)), attached to the leg rather than to a city.

## Verified during implementation

- `npm run check` — 0 errors, 188 files.
- `npm run build` — all 14 city pages prerender; landing still renders `portland-or`, `austin-tx`, `new-orleans-la`, `philadelphia-pa` as non-linked "data pending" (D10).
- **No page asserts a bare rate.** All 14 read `≥N of M`, or `—` where nothing is confirmed. Zero occurrences of `0 / N`.
- The legend string "no chance to act" is absent from every built page. `src/routes/data/` and `src/routes/superlatives/` (5-line stubs) confirmed to carry no thesis copy.
- Matcher passes its full labeled set: 9/9 known true positives matched, 3/3 known false positives rejected.
- Join is idempotent — re-running `ingest-guides.mjs` after `join-takeout.mjs` reports `0 interestTags arrays changed` and produces no diff.
- Rendered-text check on trip-1, trip-2, and zero-match cities caught three whitespace defects (`≥4of 52`, `visited· 48`, `self-curated .`), all fixed.

## Deferred

- **Rendering the saved-list overlap** — after review.
- **Landing `StatStrip` sample numbers** (`+page.svelte:11`) — mileage and spend need M0 pulls that haven't landed.
- ~~**Two-DC-sources reconciliation**~~ — **done in [M3.6](m36-purge-invented-data.md)**: DC regenerated from its guide, dummy floor gone.
- **Schema additions for unmapped guide fields** — also in `m3-guide-ingest.md`.
- **Greensboro** into M4's leg data.
- `isRetro` is still `tripId === 'west'`, so a future NOLA city file would fall to the trip-2 branch. Noted at the call site.
