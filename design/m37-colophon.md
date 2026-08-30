# M3.7 — Deferred threads closed, DC's cited venues restored, colophon shipped

Per-milestone doc, matching the [`m2-`](m2-first-city.md)/[`m3-`](m3-guide-ingest.md)/[`m3.5-`](m35-headline-metric.md)/[`m3.6-`](m36-purge-invented-data.md) pattern. Closes the bookkeeping left open across M3.5 and M3.6 and ships the colophon — spec'd in `design.md` as "a real page" and the other half of M6.

## The colophon (`/colophon`)

Live, linked from the landing page beside The Data and Superlatives. Covers: the one rule (nothing renders as measured unless it is measured) · what the site is built from · the D22 comparison and how its premise changed · error bars · not yet reconstructed · revisions · built with.

**Every figure is derived from committed data at build time.** A colophon that hardcoded its own numbers would be the failure it exists to disclose, so the page imports the city files, `trips.json`, `cityIndex.json` and `adherence.json` and counts them at build. Verified: the rendered "719 recommendations", "50 confirmed", "669 unknown", "242 days" and "14 of 18 cities" all match the JSON exactly.

**One near-miss worth recording.** The draft computed the headline curation figures as an unweighted mean over `perCityAdherence`, rendering 46.9% / 51.7%. The authoritative corpus figures are **47.4% / 52.5%** — a per-city mean is a different statistic, and D22 explicitly says the corpus numbers are authoritative and must not be recomputed. Fixed by exporting `comparison.trip1/trip2` verbatim into `adherence.json` and reading those. The site's central finding is now quoted from source rather than re-derived.

**Not written:** `design.md` also specs a wishlist — *"things I wish I'd captured."* That is memory, not data, and belongs in the user's voice. Left out entirely rather than scaffolded with placeholder prose (D9). **Ready for the user to write.**

## `population.note` — stored, not rendered (D23)

All 14 guides carry a `population.note`. Ten are substantive and carry the **D8 mechanism** behind each city's fragmentation gap:

| city | mechanism |
|---|---|
| Oklahoma City | annexed aggressively — ~620 sq mi footprint; the metric *inverts* versus the Southern corridor |
| Atlanta | fragmented via the cityhood movement (Sandy Springs, Brookhaven, Dunwoody, Milton since 2005) |
| Las Vegas | the Strip itself sits in unincorporated Clark County, outside city limits |
| Richmond | Virginia's independent-city structure makes the boundary unusually stable |
| Washington DC | cannot annex or be annexed; no county government; Congress holds budget authority |
| Dallas | genuinely polycentric — Fort Worth, Arlington, Plano are independent, not annexed |
| Jackson | population declined sharply post-2020 amid the water-system crisis |
| Charlotte, Birmingham, Albuquerque | census-vintage caveats with city-specific detail |
| Boise, Phoenix, Salt Lake City, Shreveport | boilerplate only |

That is exactly the recurring analytical through-line D8 describes — and it is **not renderable as-is**. Every note mixes it with authoring self-reference: *"consistent with the caveat practice established in the Oklahoma City and Dallas JSON files"*, *"fragmentationRatio left null: …"*, *"flagged as a possible Field Notes follow-up rather than a number invented for this file"*. Publishing that verbatim is the class of failure this repo keeps fixing.

So `population.note` is added to the schema, carried verbatim, and **rendered nowhere** — same precedent as M3.5's saved-list decision. Turning it into reader-facing prose is an editorial pass, not a mechanical one.

Also recorded: `fragmentationRatio` is `null` in all 14 guides and has no schema home, so it is not carried.

## Saved-list review — done; rendering still deferred

M3.5 deferred rendering pending review. **The review is done. Rendering is still deferred, and reviewing did not change that.** Match *quality* is checkable; the *circularity* is not — `methodNotes` records that per-item save timestamps don't exist and the lists were edited mid-trip, so a pre-trip save cannot be distinguished from one made while standing in the venue. That was the reason for deferring.

The review found a real false positive: **`Boise Co-op` ← `Boise Whitewater Park`**. "Co-op" reduces to nothing (both fragments are ≤2 characters and drop out), leaving a bare city name that prefix-matched anything beginning with "Boise" — the same failure shape as the original `Coffee Garden` → `garden` bug, one layer down.

**Fix:** a city's own name tokens are capped in `buildIdf` alongside `GENERIC`. Within one city's pool, the city's name identifies nothing. Verified: the false positive is gone, all 9 labeled true positives still match, all 3 labeled false positives still reject.

Corrected counts: **saved-list overlap 189 recs / 163 venues** (was 190/164, pre-fix).

## DC's cited venues restored (D24)

Fourteen of the 37 venues M3.6 dropped are back — those carrying a citation recovered by M2's hand cross-referencing, which is both the highest-value loss and the hardest to reproduce. DC goes 55 → **69 recommendations**: above the 46–55 range but well short of the ~92 outlier that made a full merge the wrong call.

Restored: Bridge Street Books · Etete · Dischord House + Inner Ear · NMAAHC · Library of Congress · Smithsonian American Art + National Portrait Gallery · Folger Shakespeare Library · The Phillips Collection · Mitsitam Native Foods Café · International Spy Museum · Madam's Organ · National Mall morning walk · Air and Space · Tail Up Goat.

**Mechanism — `additionalRecommendations` (D24).** M3.6's `city-overrides.json` patched existing *fields*; it now also appends whole *recommendations*, so a re-run cannot clobber a reviewed restoration. Entries are authored without `status`, `rating` or `verifiedOpen` — the transform owns those — and the append path validates every entry, failing with the venue name on a missing field, an unknown key, or an attempt to set a transform-owned one. Both guards were verified by injection.

**The join sees them.** DC's `topPlaces` contains **Library of Congress (×4)** and **Bridge Street Books (×3)**, both restored. Appending without re-joining would have marked as "visit unknown" two venues the location data confirms, so `join-takeout.mjs` now matches additive entries exactly as it matches guide recs — one matcher, one code path. Both matched `exact 1`, and **DC's floor rose from 2 to 4**.

Two corrections made while re-entering the data:

- **A mis-split citation, repaired.** M2 had recorded Eater's DC vertical as two citations — `{eater, "eater.com"}` and `{web-search, "dc"}` — by splitting the URL path. "dc" is not a publication, and D19 requires a citation to name a real source or carry no label. Rejoined as `{eater, "eater.com/dc"}`.
- **A duplicate, collapsed.** M2 listed both "Mitsitam Native Foods Café" (a dish) and "Mitsitam or Union Market" (a sight). The latter is an either/or lunch note rather than a venue, and Union Market survives in the guide's own notes for two other entries. Restored 14, not 15.

**DC again has two provenances** — 55 guide-derived recommendations plus 14 restored — which is a milder version of the split M3.6 existed to end. This is deliberate and chosen, and every restored entry carries a `reason` recording where it came from, but it should not have to be rediscovered: DC is once more the one city whose recommendations do not all come from a single source.

## Verified during implementation

- `npm run check` — 0 errors, 190 files. `npm run build` — all 14 cities plus `/colophon` prerender; the landing teaser resolves (D10 would fail the build otherwise).
- Every colophon figure cross-checked against the JSON: 719 recs / 50 confirmed / 669 unknown / 242 days / 14 of 18. No hardcoded counts in the component.
- **Every `attended` status site-wide traces to an entry in `attendance-matches.json`** — the check that discriminates a leaked dummy from a correct join result, since DC legitimately has 4.
- 0 populated ratings across all 719 recs; no `DUMMY` anywhere; no city's category coverage shrank; the four unbuilt cities still render as non-linked "data pending".
- Matcher labeled set: 9/9 true positives, 4/4 false positives rejected (including the new `Boise Co-op` case).
- Idempotent: `join-takeout.mjs` then `ingest-guides.mjs` twice → byte-identical city files, matches, and overrides.

## Deferred

- **The other 22 dropped DC venues** — listed in [`m36-purge-invented-data.md`](m36-purge-invented-data.md).
- **Rendering the saved-list overlap** — blocked on the circularity caveat, not on review.
- **The `population.note` editorial pass** — the D8 mechanisms above deserve to reach the page in reader-facing prose.
- **The colophon wishlist** — the user's to write.
- **M4 leg ledger** — needs the M0 routing pull; with location tracking off there are no GPS traces, and great-circle distance is not driving miles.
- **NOLA retro guide** — needs the `city-road-trip-guide v2.8` skill; D2 assigns guide generation to the user.
- **M6 superlatives** — still blocked on ratings, which are empty dataset-wide.
