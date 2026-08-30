# M5b — Where the days actually went

Per-milestone doc. Renders `topPlaces` — the most-navigated places per city — which had been in the repo since the first Takeout commit, used only as join input and never displayed. It is the one independent record of where the trips actually went, and it finally exercises `off-guide-discovery`, a status in the schema since D3 that no recommendation has ever carried.

## The finding

Of the **150** places navigated to most across the 14 cities:

| provenance | n | share |
|---|---|---|
| on the **sourced guide** | 42 | 28% |
| on the **self-made list** only | 85 | 57% |
| on **neither** — found on the ground | 23 | 15% |

**Published guides account for the smallest share of where the days actually went.** That sharpens D22 rather than restating it: the dominant input was the traveller's own list, and the guides — which M5a showed inflated list *size* by ~55% while conversion dropped — account for barely more than a quarter of actual navigation.

Rendered per-city as "Where the Days Actually Went", and as a three-number rollup in `/data`'s curation section.

## A privacy finding — fixed at HEAD, not in history

`data/maps-trip-analysis-public.json` carries its own guarantee: *"residences, lodging addresses, and bare street addresses removed from topPlaces and prose."* **One entry survived that pass** — a named apartment building in Salt Lake City, a city with a 3-night stay. A residence, against a line the export itself drew.

**It was in both public data files.** The first sweep covered `maps-trip-analysis-public.json` only. Re-sweeping after the fix found the same residence in `saved-lists-corridor-public.json` too — in a saved list, **with its Maps URL**, which resolves to the exact place. That file's own note likewise claims the lodging ledger and bare street addresses were removed, so it had the same hole.

**Removed from both**, with each file's note recording the correction. The entry is deliberately **not named** in either note or in this doc: restating it at HEAD would undo the point of removing it. A widened sweep of all 1,058 saved places found nothing else — the only other pattern hits were a restaurant (Duran Central Pharmacy), a museum, a rest area, and one chain-drugstore errand of the kind kept by decision.

That the second copy was found only on a re-sweep is the point of the caveat below, demonstrated: a name-based sweep is a detector, and a single pass over a single file is not coverage.

Two limits, stated rather than implied away:

1. **The repository is public, and the entry has been in git history since the commits that first added those files** — including, in the saved-lists copy, a Maps URL. Removing it from `HEAD` stops it rendering and stops it being served, but **does not scrub it from history**. Full removal needs a history rewrite (`git filter-repo`/BFG) plus a force-push across merged PRs — **outstanding, and the user's call.**
2. **The name-based sweep that found it is a detector, not a guarantee.** It cannot distinguish a hotel restaurant from a standalone one, and lodging is exactly what the note claims to have stripped. A wider privacy re-audit of the export is outstanding.

Everything else was kept by explicit decision, including personal-errand entries (a laser clinic, a laundromat, a Planet Fitness) and 12 utility stops (USPS across four cities, Maverik ×7, AAA auto repair ×5) — real road-trip texture, consistent with the site's wry register.

## Why these are not `recommendations` (D26)

They are a separate data surface (`visited.json`) and a separate module, **not** entries in `City.recommendations`. The reason is not that they sit awkwardly in the 10-category taxonomy, though they do — a Maverik gas station is not one of the ten.

The reason is that **the hit-rate floor means "of the guide's N picks, how many are confirmed."** Folding in places no guide ever named would corrupt that denominator. This is the same class of error as the `0 / N` defect (M3.5) and the unweighted-mean near-miss (M3.7): a number that looks measured but answers a different question than its label claims.

Verified: rec counts, the 50-confirmed floor, and every city page's `≥N of M` are **byte-identical to `main`** after this chunk.

## Provenance is matched, not recorded

Classification runs through the existing tuned matcher in `tools/join-takeout.mjs` — one matcher, one code path — checking the guide first, then the saved list.

**A direction bug, caught by hand-checking Boise.** `matchOne` splits dish/product prefixes on its *first* argument only, and this call runs opposite to the attendance join: a visited place is matched against the rec list, not the reverse. So `Bar Gernika` failed to match the guide's `Beef Tongue & Croquetas -- Bar Gernika` and landed in the wrong bucket. Fixed by expanding rec names into their venue segments before matching; the totals moved 40/87/23 → **42/85/23**.

Cross-checked all 150 against a naive substring classifier: 2 disagreements, both the tool being right — `Last Call Baking Co.` ↔ `Company` and `Lemuria Books` ↔ `Book Store` are guide matches the naive check misses.

**Both bounds are disclosed inline, not just on the colophon.** Per `methodNotes` the export has no per-item save timestamps and the lists were edited during the trips, so a place saved while standing in it cannot be separated from one saved before leaving. **"On my own list" is an upper bound; "found there" is a floor.** `topPlaces` is also truncated to roughly the top ten per city, so this is where the days went *most*, not everywhere.

This is the same circularity that keeps the saved-list *overlap* unrendered (M3.5, M3.7). It is disclosed here rather than used to defer, because this module's claim is about the **provenance of visits**, not agreement between two lists — and the bound runs in a direction that makes the interesting number (discovery) conservative.

## Colour

D11's status law, unchanged: gold for guide, muted for own-list, and `--blue` — the `off-guide` hue — for found-on-the-ground. Validated as a third categorical mark against gold and burnt: CVD ΔE 15.3, normal-vision 18.4, contrast ≥3:1 on the page surface. Every entry also carries a text provenance label, so nothing is distinguished by colour alone.

## Verified during implementation

- `npm run check` — 0 errors, 196 files. `npm run build` — all pages prerender; D10 intact.
- The removed residence is absent from **both** public data files, from `visited.json`, and from every built page. Removing it from the saved-lists file left `visited.json` byte-identical, since that list is not one the join reads.
- **719 recs / 50 confirmed, byte-identical to `main`** — nothing entered `recommendations`.
- Buckets reconcile: 150 source `topPlaces` = 150 emitted = 42 + 85 + 23, and per-city counts match exactly.
- Boise spot-checked by hand against its guide and saved list: 0 disagreements after the direction fix.
- Caveat renders adjacent to the module on city pages, in upper-bound/floor language.
- Zero runtime dependencies; no motion.

## Deferred

- **Scrubbing git history** of the removed entry from both files — force-push across merged PRs; the user's call.
- **A wider privacy re-audit** of the export beyond the name sweep.
- Prices/spend and driving distances (M0), M4's leg ledger, the other 22 dropped DC venues, the colophon wishlist, NOLA's guide, and M6 superlatives (ratings empty dataset-wide).
