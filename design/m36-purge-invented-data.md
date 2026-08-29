# M3.6 — Purge the last invented data

Per-milestone doc, matching the [`m2-`](m2-first-city.md)/[`m3-`](m3-guide-ingest.md)/[`m3.5-`](m35-headline-metric.md) pattern. Closes the residual M3.5 flagged: every surface on the site now shows either a sourced number or nothing.

## What was still invented

**Washington DC** was the last dummy-data island. Its file was the M2 hand-transcription, whose statuses and ratings were assigned mechanically for display and never reflected any record ([`m2-first-city.md`](m2-first-city.md): *"Every recommendation's `status` and `rating` are dummy values"*). That rendered as:

- `≥39 of 57` confirmed visits — a floor computed entirely from invented statuses.
- **39 invented `rating` values — the only populated ratings in the whole dataset.**
- **`DUMMY-VIBE` and `DUMMY — one-sentence characterization pending your review.` printing literally on the page**, against CLAUDE.md's non-negotiable rule that missing data renders as *nothing*.

**The landing StatStrip** carried `// SAMPLE values — replace as reconstruction lands` and rendered six figures as headline facts, three with no source.

## DC regenerated

DC now flows through `tools/ingest-guides.mjs` like the other 13 cities. The `washington-dc` skip and the whole `normalizeDcCityFile()` / `DC_TAG_TO_SLUG` path are deleted.

| | M2 file | Now |
|---|---|---|
| recs | 57, categories 1–9 | 55, **all 10 categories** (4 electronics) |
| status | 39 `attended` (invented) | 53 `unverified` + **2 join-confirmed** `attended` |
| rating | 39 invented | `null`, as every other city |
| `vibeWord` / `tagline` | `DUMMY-…` | `''` — renders as nothing (D9) |
| popCulture | 1 film, 1 person | 3 films, 5 people (gated to confirmed birthplaces) |
| headline | `≥39 of 57` | `≥2 of 55` |

**Merging the two sources was rejected.** Run through the tuned matcher from `tools/join-takeout.mjs`, they overlap only 20 of 57 — a union would be ~92 recs against every other city's 46–55, making DC a structural outlier rather than a comparable data point.

### `data/city-overrides.json` — reviewed corrections that survive regeneration

The guide asserts `elevationFt: 25`. That is exactly the value M2 rejected on review:

> *"an initial 25 ft (the National Mall's elevation) would have misrepresented the city, which spans roughly 1–410 ft; per D9 this renders as nothing rather than a misleading single number."*

Regenerating blind would have reinstated a number a human already removed for being wrong — and would do so again on every future re-run. So reviewed corrections now have a durable home: a committed `cityId → field patches` map, each entry carrying its `reason`, applied in `transformCity` after mapping.

It is a transform *input* like `data/attendance-matches.json`, **not** a schema extension — patching a field that isn't in `types.ts` is a hard error, so overrides can't become a back door around the schema.

### What DC lost — the full list, not a count

37 M2 venues have no counterpart in the generated guide. A count isn't recoverable later; this list is. **15 carry citation labels recovered by M2's hand cross-referencing**, which is the part that stings — several are major DC institutions the generated guide simply doesn't cover.

> **Update ([M3.7](m37-colophon.md)): the cited ones are back.** All 15 marked ✅ below were restored via `additionalRecommendations` (D24), minus one collapsed as a duplicate — 14 entries, DC now at 69 recs. Library of Congress and Bridge Street Books turned out to be in DC's `topPlaces` and are now confirmed visits. **The 22 unmarked entries remain dropped.**

**Bookstores**
- ✅ Bridge Street Books — Georgetown *(cited: DC independent bookshop community)*
- Capitol Hill Books — 657 C St SE
- Mahogany Books — Anacostia

**Record Stores**
- Smash! Records — Adams Morgan
- Spin Time Records — Capitol Hill

**Coffee**
- Lost Sock Roasters — Takoma / Brightwood Park
- Dua DC — Dupont Circle
- Unido Coffee — Shaw
- The Potter's House — Columbia Heights
- Slipstream — Logan Circle

**Pastry & Bakeries**
- Ellē — Mt. Pleasant
- Tango Pastry — Adams Morgan
- Petite Cerise — Georgetown
- Saku Saku Flakerie — Capitol Hill

**Unique Dishes**
- ✅ Ethiopian Doro Wat + Injera @ Etete — 9th St NW *(cited: washington.org)*
- Mid-Atlantic Seasonal @ The Dabney — Blagden Alley
- Peruvian Pollo a la Brasa @ El Pollo Rico — Arlington
- ✅ Mitsitam Native Foods Café *(cited: Atlas Obscura; si.edu)*
- ✅ Farewell dinner: Tail Up Goat *(cited: eater.com/dc)*

**Mailable Gifts**
- Capital City Mambo Sauce
- Harper Macaw Chocolate — Union Market
- Dischord Records Back Catalog — direct or at Smash!

**Sights & Oddities**
- ✅ Dischord Records House + Inner Ear Studios — Arlington, VA *(cited: dischord.com; Wikipedia DC Hardcore)* — note the unresolved address conflict flagged in M2
- ✅ National Museum of African American History & Culture *(cited: nmaahc.si.edu)*
- Riggs Library — Georgetown University
- ✅ Library of Congress *(cited: loc.gov)*
- ✅ Smithsonian American Art Museum + National Portrait Gallery *(cited: americanart.si.edu)*
- ✅ Folger Shakespeare Library *(cited: folger.edu; washington.org)*
- ✅ The Phillips Collection *(cited: phillipscollection.org)*
- ✅ International Spy Museum *(cited: spymuseum.org)*
- ↩︎ Mitsitam or Union Market *(cited: washington.org)* *(collapsed into the Mitsitam dish entry — an either/or note, not a venue)*
- ✅ National Mall morning walk *(cited: nps.gov)*
- ✅ Smithsonian National Air and Space Museum *(cited: si.edu)*

**Punk / Indie Venues**
- The Howard Theatre — Shaw
- ✅ Madam's Organ *(cited: washington.org; Tripadvisor)*

**Souvenirs**
- National Building Museum Shop — Penn Quarter
- Smash! Records Zines + Dischord Merch

Re-adding any of these by hand is a future chunk's call. The generated guide covers different ground (Catacombs of the Franciscan Monastery, National Museum of Health and Medicine, Mary McLeod Bethune Council House, Congressional Cemetery, Rock Creek Park, the Watergate) — the two are complementary surveys of the same city, not competing ones.

### `population.note` is discarded — a D8 caveat, not just lost text — ✅ carried as of M3.7

> **Resolved ([M3.7](m37-colophon.md), D23):** `population.note` is now in the schema and carried verbatim for all 14 cities — and ten of them, not just DC, turned out to hold the D8 mechanism behind their fragmentation gap. It is still **not rendered**: every note mixes that content with authoring self-reference. Getting it onto the page is an editorial pass, still outstanding.

DC's guide carries a ~400-character `population.note` explaining that its fragmentation metric is **structurally different** from the Southern corridor's: the city cannot annex or be annexed and has no county government at all, since Congress retains ultimate budget authority regardless of city-proper boundaries. `types.ts` types `population` as `{cityProper, metro}`, so the transform drops it.

This directly qualifies what `FragmentationBar` renders on DC under **D8** ("a chartable proxy for racial-political history"). DC's 28%-inside-city-limits figure is not the same *kind* of number as Birmingham's. Recorded here alongside M3's unmapped-content inventory as a candidate for a schema addition.

## Landing StatStrip — sourced or marked

`StatStrip` gained a `pending` flag. A pending figure keeps its slot and its number but **loses the gold treatment** (colour is what makes a number read as a finding) and carries the marker **`not yet reconstructed`** — chosen over "pending", which a stranger could read as *pending publication*.

| stat | status |
|---|---|
| **242** Days · **18** Cities | **real**, and now *derived* — from `trips.json` (2025-10-02 → 2026-05-31, inclusive) and `cityIndex.length`, so they cannot drift |
| 4,812 Miles Driven | **marked** — needs retroactive Maps routing (M0) |
| 61 Records Bought · 38 lbs Of Books | **marked** — no source; memory only |
| 243 CPAP Setups | keeps `wry` — a joke, not a measurement claim |

Sourced figures available as replacements once M0 lands, all from `comparison` in `maps-trip-analysis-public.json`: **101 city-days**, **550 places navigated to**, **641 places saved**.

## M6 is now blocked — a real change to the plan's shape

Nulling DC's 39 ratings leaves **zero populated `rating` values dataset-wide**. D18's binary would-return signal is empty everywhere, so **M6's superlatives page has nothing to render** — "keepers"-style awards derive entirely from that field.

M6 moves from *"writing-heavy, save for post-data"* to **blocked until real ratings are captured**. Capturing them is a memory pass over 705 recommendations, and no export contains them; it is the same class of manual reconstruction as trip-2 attendance.

Nulling them changed no rendered output today — `rating` currently has **no readers** in `src/` outside the type definition.

## Verified during implementation

- `npm run check` — 0 errors, 188 files. `npm run build` — all 14 cities prerender.
- **`grep -ri DUMMY build/` — zero occurrences.** The headline check.
- 705 recs, **0** with a populated rating.
- DC `elevationFt` is `null`, the override fired (`overrides applied: washington-dc.elevationFt`), and the city page renders no elevation line.
- DC reads `≥2 of 55 · 53 unknown`; status mix is `unverified` + 2 `attended`, matching the other 13 cities' shape.
- DC's category 10 is populated (4 recs); **no city's category coverage shrank** relative to `main` (checked against `git show main:`).
- Override guard rejects a patch to a field absent from `types.ts` — verified by injecting one and confirming a hard error.
- Idempotent: `join-takeout.mjs` then `ingest-guides.mjs` twice → byte-identical output.
- D10 intact: the four unbuilt cities still render as non-linked "data pending".

## Deferred

- **Re-adding M2-only DC venues** by hand, from the list above.
- **Capturing real ratings** — now M6's blocker.
- **Landing miles/records/books** — awaiting M0.
- **Saved-list overlap rendering** (M3.5) and **schema additions for unmapped guide fields** including `population.note` (M3).
- **Greensboro** into M4's leg data.
