# M3 — Guide ingest: 14 generated guides → site city data

Per-milestone doc, matching the [`m2-first-city.md`](m2-first-city.md) pattern the implementation plan calls for. Records the findings from converting `guides/*-guide.json` into `src/lib/data/cities/*.json` via [`tools/ingest-guides.mjs`](../tools/ingest-guides.mjs), the committed, auditable transform. Result: **14 of 18 cities built** (13 emitted by the transform + `washington-dc.json`, preserved from M2 at the time — DC was later regenerated too, see [M3.6](m36-purge-invented-data.md)). `portland-or`, `austin-tx`, `new-orleans-la`, `philadelphia-pa` remain "data pending" (see [Deferred](#deferred-not-part-of-this-milestone)).

## Status vocabulary — not final

The guides use a two-value status vocabulary (`retroactive-recommendation` for trip 1, `sourced-recommendation` for trip 2) that only half-overlaps `RecStatus`. `sourced-recommendation` means "the guide listed this," not an outcome — there is no "listed, outcome not yet reconciled" value in the schema.

**D21 (decision-log.md): `sourced-recommendation` → `unverified`.** Existing enum value, no schema change; DC's M2 file already uses it with this meaning. **Explicitly provisional** — every trip-2 rec across all 6 newly-ingested trip-2 cities (shreveport, jackson, birmingham, atlanta, charlotte, richmond) is `unverified` until real attendance reconstructs from memory + photos + calendar/ticket emails (M0).

Trip-1's `retroactive-recommendation` has the mirror problem: D3 defines it as "the guide would have suggested it, but there was no opportunity to act" — asserting not-visited. `data/maps-trip-analysis-public.json` shows ~47% of trip-1 navigation went to self-listed places, so that assertion is wrong for a large share of them. Not resolved this chunk — see [O6](decision-log.md#open-questions-undecided) and [Deferred](#deferred-not-part-of-this-milestone).

Status assignment is isolated in `assignStatus(rec, guide)` in the transform — one function to edit when real attendance data lands, not a re-transcription.

## Expected: the single-color waffle

Every trip-1 city renders **uniformly** `retroactive-recommendation` (gold dashed, `st-retro`); every newly-ingested trip-2 city renders **uniformly** `unverified` (muted, `st-skipped`). Verified against the build:

```
boise-id, salt-lake-city-ut, las-vegas-nv, phoenix-az,
albuquerque-nm, oklahoma-city-ok, dallas-tx        → st-retro only
shreveport-la, jackson-ms, birmingham-al,
atlanta-ga, charlotte-nc, richmond-va               → st-skipped only
washington-dc                                       → st-attended, st-closed, st-skipped (unchanged M2 mix)
```

D11 and D3 hold — trip-1 and trip-2 are never conflated (different classes, different colors). But a trip-2 city page currently reads as a solid muted block, which *looks* like "everything was skipped." DC never showed this because its M2 dummy mix spanned four statuses. **This is correct and temporary** — it resolves the moment attendance reconciliation lands, not a bug to fix in this chunk.

**This is not just a color — it's also the site's headline number, and it's currently wrong-reading.** `StatStrip` renders D3's instinct-vs-curation metric as a fraction (`hit-big`, "Instinct vs. the Retro Guide"). With zero trip-1 recs marked `attended-anyway`, every one of the 7 trip-1 city pages currently states:

```
albuquerque-nm  0 / 52       boise-id        0 / 52       las-vegas-nv    0 / 50
oklahoma-city   0 / 52       dallas-tx       0 / 52       phoenix-az      0 / 47
salt-lake-city  0 / 50
```

`data/maps-trip-analysis-public.json` — already in this same repo — says the real trip-1 on-list rate is ~47%. This is the on-screen form of O6: not a docs disagreement, a rendered claim readers would see if these pages published. **Blocks calling this milestone publish-ready, independent of everything else here.** Not fixable in this chunk — the number is mechanically honest given the current data model (D21's `assignStatus` asserts every trip-1 rec `retroactive-recommendation`, never `attended-anyway`); the fix is attendance reconciliation, which is what resolves this metric along with the waffle color above.

`StatStrip` correctly labels the trip-2 version of this panel differently ("Guide Hit Rate," not "Instinct vs. the Retro Guide" — confirmed on `shreveport-la.html`), so it isn't mislabeled. But the same underlying gap applies: with every trip-2 rec `unverified` (D21), all 6 newly-ingested trip-2 pages also currently read `0 / N` (`atlanta 0/51`, `birmingham 0/47`, `charlotte 0/50`, `jackson 0/53`, `richmond 0/46`, `shreveport 0/48`) — 13 of 14 built pages assert a zero hit rate. Only DC (`39/57`, its M2 dummy mix) shows a non-zero value.

## Nights off-by-one

All 14 guides compute `visitWindow.nights` one night short of `cityIndex.json` — they count departure as the last full day, not the checkout night. **`cityIndex.json` is the ground truth**: `stay.nights` comes from there; `stay.depart` is derived as `arrive + nights`.

Verified against real data before any file was written: guide `arrival: 2026-05-24` + cityIndex `nights: 7` → derived `depart: 2026-05-31`, matching M2's hand-transcribed DC record (`arrive 2026-05-24, depart 2026-05-31, nights 7`) exactly. The transform hard-fails if this check doesn't hold.

This matters beyond the displayed field — D5's landing-map dot radius is `4 + 2√nights`.

## Cross-listed venue groups (137 recs, ~103 distinct venues)

`crossListedIn` is M2's cross-entry consistency rule ("entries describing the same physical venue must never carry contradictory status/rating… nothing in `npm run check` catches it") in machine-readable form — but it holds *category ids* the venue also belongs to, not venue ids, so pairing requires fuzzy name matching the transform doesn't attempt. A no-op today (every city's statuses are uniform per the section above), but it will matter the moment real per-rec attendance data lands and two entries for one physical venue could disagree.

Emitted by the transform as `tools/.cross-listed-report.md` (gitignored scratch output — regenerate with `node tools/ingest-guides.mjs --dry-run`). Full list, for the review that happens alongside attendance reconciliation:

<details>
<summary>137 cross-listed entries across 13 guide cities</summary>

- **Bizcochito** (albuquerque, dishes) also listed in: pastry
- **Bottled Spirits — Left Turn Distilling** (albuquerque, gifts) also listed in: sights
- **Left Turn Distilling — Tasting & Tour** (albuquerque, sights) also listed in: gifts
- **For Keeps Books** (atlanta, bookstores) also listed in: sights
- **Trap Music Museum gift shop** (atlanta, souvenirs) also listed in: sights
- **ASW Distillery tour & tasting** (atlanta, electronics) also listed in: gifts
- **Jim Reed Books** (birmingham, bookstores) also listed in: souvenirs
- **Punch Love Coffee** (birmingham, coffee) also listed in: pastry
- **Alicia's Coffee Shop** (birmingham, coffee) also listed in: sights
- **Birmingham Civil Rights Institute** (birmingham, sights) also listed in: coffee
- **Furnace Fest @ Sloss Furnaces** (birmingham, venues) also listed in: sights
- **Vulcan Park & Museum Gift Shop** (birmingham, souvenirs) also listed in: sights
- **Jim Reed Books — Museum of Fond Memories** (birmingham, souvenirs) also listed in: bookstores
- **Alabama Peanut Company** (birmingham, souvenirs) also listed in: gifts
- **Red Mountain Makers** (birmingham, electronics) also listed in: sights
- **Beef Tongue & Croquetas -- Bar Gernika** (boise, dishes) also listed in: sights
- **Boise Co-op Local Pantry Goods** (boise, gifts) also listed in: souvenirs
- **Idaho Anne Frank Human Rights Memorial** (boise, sights) also listed in: souvenirs
- **The Basque Block** (boise, sights) also listed in: dishes
- **Idaho Anne Frank Memorial Gift Shop** (boise, souvenirs) also listed in: sights
- **Boise Co-op** (boise, souvenirs) also listed in: gifts
- **Idaho Vinyl Records -- "Strange & Cool Covers"** (boise, souvenirs) also listed in: records
- **That's Novel Books** (charlotte, bookstores) also listed in: souvenirs
- **Paper Skyscraper** (charlotte, bookstores) also listed in: souvenirs, gifts
- **Local Pantry Goods — Paper Skyscraper** (charlotte, gifts) also listed in: bookstores, souvenirs
- **Moravian Cookie Gift Boxes — Dewey's Bakery** (charlotte, gifts) also listed in: dishes
- **Retail Coffee Beans — Night Swim / Smelly Cat** (charlotte, gifts) also listed in: coffee
- **Paper Skyscraper** (charlotte, souvenirs) also listed in: bookstores, gifts
- **That's Novel Books (zines & local prints)** (charlotte, souvenirs) also listed in: bookstores
- **The Market at 7th Street (vendor goods)** (charlotte, souvenirs) also listed in: gifts
- **Harvey B. Gantt Center Gift Shop** (charlotte, souvenirs) also listed in: sights
- **Half Price Books Flagship Store** (dallas, bookstores) also listed in: souvenirs
- **GROWL** (dallas, records) also listed in: venues
- **Texas Theatre** (dallas, sights) also listed in: venues
- **GROWL** (dallas, venues) also listed in: records
- **Half Price Books Flagship (books & vinyl as souvenirs)** (dallas, souvenirs) also listed in: bookstores
- **Coffee Prose** (jackson, bookstores) also listed in: coffee
- **OffBeat** (jackson, bookstores) also listed in: records
- **OffBeat** (jackson, records) also listed in: bookstores
- **Urban Foxes** (jackson, coffee) also listed in: pastry, venues
- **Coffee Prose** (jackson, coffee) also listed in: bookstores
- **Northshore Specialty Coffee** (jackson, coffee) also listed in: gifts
- **Sugaree's Bakery** (jackson, pastry) also listed in: dishes
- **Just Vanilla Bake Shop** (jackson, pastry) also listed in: venues
- **Broad Street Baking Company & Cafe** (jackson, pastry) also listed in: bookstores
- **Urban Foxes** (jackson, pastry) also listed in: coffee, venues
- **Comeback Sauce** (jackson, dishes) also listed in: gifts
- **Pig Ear Sliders & "Smokes" -- Big Apple Inn** (jackson, dishes) also listed in: sights
- **Caramel Cake -- Sugaree's Bakery** (jackson, dishes) also listed in: pastry
- **Bottled Comeback Sauce** (jackson, gifts) also listed in: dishes
- **Whole-Bean Coffee -- Native Coffee Co. / Northshore** (jackson, gifts) also listed in: coffee
- **Farish Street Historic District** (jackson, sights) also listed in: dishes, venues
- **Eudora Welty House & Garden** (jackson, sights) also listed in: souvenirs
- **Cooperation Jackson / Chokwe Lumumba Center** (jackson, sights) also listed in: electronics
- **Cathead Distillery** (jackson, sights) also listed in: souvenirs
- **Hal & Mal's** (jackson, venues) also listed in: dishes
- **F. Jones Corner** (jackson, venues) also listed in: sights
- **Eudora Welty House Gift Shop** (jackson, souvenirs) also listed in: sights
- **Mississippi Civil Rights Museum Gift Shop** (jackson, souvenirs) also listed in: sights
- **OffBeat** (jackson, souvenirs) also listed in: records, bookstores
- **Cathead Distillery Gift & Bottle Shop** (jackson, souvenirs) also listed in: sights
- **Cooperation Jackson -- Center for Community Production** (jackson, electronics) also listed in: sights
- **The Writer's Block** (las-vegas, bookstores) also listed in: souvenirs
- **Vinyl Threat @ The Punk Rock Museum** (las-vegas, records) also listed in: sights, venues, souvenirs
- **The Mob Museum's House Moonshine** (las-vegas, gifts) also listed in: sights
- **Atomic Liquors** (las-vegas, sights) also listed in: dishes
- **Springs Preserve** (las-vegas, sights) also listed in: souvenirs
- **The Mob Museum** (las-vegas, sights) also listed in: gifts
- **The Punk Rock Museum / Triple Down** (las-vegas, venues) also listed in: records, souvenirs, sights
- **The Punk Rock Museum Gift Shop** (las-vegas, souvenirs) also listed in: records, venues
- **The Writer's Block** (las-vegas, souvenirs) also listed in: bookstores
- **Springs Preserve Gift Shop** (las-vegas, souvenirs) also listed in: sights
- **Bad Granny's Bazaar** (oklahoma-city, records) also listed in: souvenirs
- **Zero Tolerance Coffee & Siyo Chocolate** (oklahoma-city, coffee) also listed in: gifts
- **Coffee Slingers Roasters** (oklahoma-city, coffee) also listed in: gifts
- **Bad Granny's Bazaar** (oklahoma-city, souvenirs) also listed in: records
- **Xanadu Coffee** (phoenix, coffee) also listed in: venues
- **The Trunk Space** (phoenix, venues) also listed in: coffee
- **Black Swan Books & Music** (richmond, bookstores) also listed in: records
- **Black Swan Books & Music** (richmond, records) also listed in: bookstores
- **Blanchard's Coffee Roasting Co.** (richmond, coffee) also listed in: gifts
- **Whole-Bean Coffee — Blanchard's / Lamplighter** (richmond, gifts) also listed in: coffee
- **Black Swan Books & Music (postcards/ephemera)** (richmond, souvenirs) also listed in: bookstores, records
- **Weller Book Works** (salt-lake-city, bookstores) also listed in: souvenirs
- **Ken Sanders Rare Books** (salt-lake-city, bookstores) also listed in: souvenirs
- **Boing! Anarchist Collective** (salt-lake-city, bookstores) also listed in: venues
- **Diabolical Records** (salt-lake-city, records) also listed in: venues
- **Memento Mori** (salt-lake-city, records) also listed in: souvenirs
- **Les Madeleines** (salt-lake-city, pastry) also listed in: gifts
- **Barely Buzzed Cheese** (salt-lake-city, dishes) also listed in: gifts
- **Local Honey — BEEZ Hives N Honey** (salt-lake-city, gifts) also listed in: souvenirs
- **Barely Buzzed Cheese (to mail)** (salt-lake-city, gifts) also listed in: dishes
- **Boing! Anarchist Collective (as a show space)** (salt-lake-city, venues) also listed in: bookstores
- **Diabolical Records In-Stores / Bandemonium** (salt-lake-city, venues) also listed in: records
- **Memento Mori (prints & oddities)** (salt-lake-city, souvenirs) also listed in: records
- **Weller Book Works — "Banned!" Merch & Postcards** (salt-lake-city, souvenirs) also listed in: bookstores
- **BEEZ Hives N Honey (gift jars & beeswax candles)** (salt-lake-city, souvenirs) also listed in: gifts
- **The Thrifty Peanut** (shreveport, bookstores) also listed in: records
- **Beth the Book Lady** (shreveport, bookstores) also listed in: souvenirs
- **Vine Books & Vinyl** (shreveport, bookstores) also listed in: records
- **Vine Books & Vinyl** (shreveport, records) also listed in: bookstores
- **The Thrifty Peanut (vinyl section)** (shreveport, records) also listed in: bookstores
- **Rhino Coffee** (shreveport, coffee) also listed in: gifts
- **Jelks Coffee Roasters** (shreveport, coffee) also listed in: gifts
- **Lowder Baking Company** (shreveport, pastry) also listed in: gifts
- **Strawn's Eat Shop** (shreveport, pastry) also listed in: dishes
- **Strawberry Icebox Pie** (shreveport, dishes) also listed in: pastry
- **Natchitoches Meat Pie** (shreveport, dishes) also listed in: gifts
- **Jelks Coffee Roasters bagged beans** (shreveport, gifts) also listed in: coffee
- **Great Raft Brewing cans & merch** (shreveport, gifts) also listed in: venues
- **Cane Syrup, Rice & Satsumas** (shreveport, gifts) also listed in: souvenirs
- **Frozen Natchitoches Meat Pies** (shreveport, gifts) also listed in: dishes
- **Lowder Baking Co. King Cake** (shreveport, gifts) also listed in: pastry
- **Shreveport Water Works Museum** (shreveport, sights) also listed in: souvenirs
- **Spring Street Museum** (shreveport, sights) also listed in: souvenirs
- **R.W. Norton Art Gallery & Gardens** (shreveport, sights) also listed in: souvenirs
- **Shreveport Municipal Auditorium (Louisiana Hayride)** (shreveport, sights) also listed in: venues
- **Shreveport Municipal Auditorium** (shreveport, venues) also listed in: sights
- **Great Raft Brewing** (shreveport, venues) also listed in: gifts
- **Beth the Book Lady (antique-mall ephemera)** (shreveport, souvenirs) also listed in: bookstores
- **Great Raft Brewing merch** (shreveport, souvenirs) also listed in: gifts, venues
- **R.W. Norton Art Gallery gift shop** (shreveport, souvenirs) also listed in: sights
- **Spring Street & Water Works Museum shops** (shreveport, souvenirs) also listed in: sights
- **Shreveport Farmers Market vendor crafts** (shreveport, souvenirs) also listed in: gifts
- **Sankofa Video Books & Cafe** (washington-dc, bookstores) also listed in: souvenirs
- **Joint Custody** (washington-dc, records) also listed in: souvenirs
- **Songbyrd Music House** (washington-dc, records) also listed in: venues
- **Mumbo Sauce** (washington-dc, dishes) also listed in: gifts
- **Bottled Mumbo Sauce** (washington-dc, gifts) also listed in: dishes
- **One Eight Distilling Spirits** (washington-dc, gifts) also listed in: sights
- **Republic Restoratives Bourbon** (washington-dc, gifts) also listed in: sights
- **Songbyrd Music House** (washington-dc, venues) also listed in: records
- **Rhizome DC** (washington-dc, venues) also listed in: electronics
- **Eastern Market Weekend Artisans** (washington-dc, souvenirs) also listed in: sights
- **Sankofa Video Books & Cafe (gift shelf)** (washington-dc, souvenirs) also listed in: bookstores
- **Joint Custody Vintage/Local Tees** (washington-dc, souvenirs) also listed in: records
- **Rhizome DC (maker/craft programming)** (washington-dc, electronics) also listed in: venues

</details>

Note: DC's guide (`washington-dc-guide.json`) has its own cross-listed group above — it does **not** describe `washington-dc.json`'s actual 57 recs, since DC kept its M2 content. See below.

## Two DC sources need reconciling — ✅ resolved in M3.6

`washington-dc.json` (57 recs, M2 hand-transcription, recovered citation labels, category 10 empty) and `guides/washington-dc-guide.json` (55 recs, all 10 categories, machine-generated) described the same city from different provenance. This chunk left the site file as-is — only `interestTags` were normalized in place.

**Resolved in [M3.6](m36-purge-invented-data.md):** DC was regenerated from the guide and is now transform-built like the other 13. The `interestTags` migration described here, and the `DC_TAG_TO_SLUG` map it used, are deleted — DC's tags now come from the guide in `i-*` form like every other city.

## `interestTags` normalization

Guides use an 8-value cross-cutting interest axis (`i-food`, `i-diy`, `i-punk`, `i-books`, `i-political`, `i-horror`, `i-bees`, `i-drinks`). DC's M2 file used a richer, 21-value per-category vocabulary that had silently diverged — `types.ts` types both as bare `string[]`, so `npm run check` caught neither.

Normalized DC to the guide vocabulary. Several DC tags are category echoes (Coffee, Pastry, Venue, Sights, Souvenirs, Gifts) with no interest-axis equivalent and were **dropped** rather than force-fit: `Gifts`, `Sights`, `Souvenirs`, `DC Original`, `Film`, `Film Location`, `Atlas Obscura` (a source label, not an interest). The rest mapped on editorial judgment (`DC_TAG_TO_SLUG` in the transform) — e.g. `Vinyl`/`Venue`/`Go-Go` → `i-punk` (no dedicated music-scene tag exists in the guide vocabulary), `Black Broadway`/`Civil Rights` → `i-political`. Flagged here as a judgment call, same spirit as the duration-parsing caveat below — `RecommendationList` doesn't render a tag row yet (per M2), so nothing currently depends on this being exact.

## Mechanical-parsing caveats (expect some off, per M2 precedent)

- **Duration → `durationMin`.** Both dash forms appear (`'30–45 min'`, `'30-45 min'`); took the upper bound. `N/A`/`Varies` → `null`.
- **Citation splitting.** `source.detail` frequently carries 2+ sources separated by commas (123 of 705 recs) — split into separate `Citation` entries per D19. For the `general/local knowledge` / `general-knowledge` / `direct fetch, …` provenance bucket (52 recs, no `CitedSource` enum equivalent), mapped to `{source: 'web-search', label: <the provenance string>, url: null}` — `detail` in this bucket is editorial commentary ("long-running RVA indie institution"), not a source name, and was not folded into the label. No URL was ever synthesized.
- **`bornHere` gate.** Only `notablePeople` entries with a confirmed `birthplace` (54 of 76) were mapped. Some guides explicitly disclaim nativity in `statusNotes` (e.g. Boise: Doug Martsch and Brian "Pushead" Schroeder are "described here by association, not nativity") — including them in `bornHere` would assert what the source disclaims.
- **Placeholder strings in `cost`/`bestTime`.** The guides use `'N/A'`/`'Varies'`/`'TBD'`/`'Unknown'` as literal placeholder text for these two plain-string (non-nullable) fields. `RecommendationList`'s `{#if r.bestTimeOfDay}` guard only suppresses a *falsy* value, so left as-is these would render literally ("· best at N/A" — caught in the initial build check, 46 guide recs affected). Per CLAUDE.md's non-negotiable rule (missing data renders as nothing, never a placeholder), the transform normalizes these to `''` for both fields, same as the `null` normalization already done for `durationMin`.

## Unmapped guide content — inventory, not a schema change

The richest editorial and methodological material in the corpus has no schema home yet. Not lost — stays in `guides/*.json` in Git — but should become a schema proposal as its own decision.

**Per-city:**
- `framing` (~850 chars/city, narrative introduction)
- `analyticalThread` (`id`, `anchor`, `summary`, `crossTripLinks[]`) — the recurring cross-city political-geography through-line (e.g. Boise's Frank Church/Anne Frank memorial thread linked to Salt Lake City's)
- `honestGaps[]` — explicit "we looked and didn't find X" entries (e.g. no radical/infoshop bookstore in Boise)
- `statusNotes[]` — corrections and caveats (e.g. the *Napoleon Dynamite* Boise misattribution)
- `scopeDecision` — geographic scope reasoning (city-proper vs. metro picks)
- `sources[]` — guide-level source list (`["Atlas Obscura", "TasteAtlas", "Eater"]`-style)
- `popCulture.correctionNote`

**Per-recommendation:**
- `district`, `address` (552 / 499 of 705 recs)
- `balanceRule`, `bonus`, `filmConnection`, `threadAnchor`, `crossListedIn` (see above), `glutenFreeAvailable`, `restaurants`, `statusFlag`, `verificationFlag`

## Verified during implementation

- `npm run check` — 0 errors, 186 files, across all 14 built cities.
- `npm run build` — all 14 `/city/<id>` pages prerender; landing constellation still renders `portland-or`, `austin-tx`, `new-orleans-la`, `philadelphia-pa` as non-linked "data pending" (checked directly against `build/index.html` — no `href` to any of the four).
- Ground-truth check (transform hard-fails otherwise): derived DC stay from guide `arrival` + cityIndex `nights` reproduces M2's hand-transcribed record exactly.
- `git diff` on `washington-dc.json`: touches only `interestTags` arrays (44 of 57 changed) — no status, citation, or note changes.
- Waffle status classes confirmed uniform per city per the table above — no trip-1/trip-2 conflation (D11, D3).
- Citation chips: sampled labels render as real strings (e.g. "literatipressok.com", "TravelOK", "Yelp OKC") in plain `<span>`s, not broken `<a href="null">` links — confirmed no citation anchor with a `null`/empty `href` exists in any built page.
- Fingerprint panel renders its "City Fingerprint" label with no radar content; FieldNotes renders nothing — D9 graceful degradation against real nulls, consistent with M2's DC finding.
- `<h1>` on each city page shows the guide's full city name (e.g. "Oklahoma City"), not `cityIndex.json`'s map-label abbreviation ("Okla. City").
- interestTags normalization confirmed idempotent — a second `node tools/ingest-guides.mjs` run reports `0 interestTags arrays changed` against the first run's output.
- Caught and fixed mid-review (see [mechanical-parsing caveats](#mechanical-parsing-caveats-expect-some-off-per-m2-precedent)): guide placeholder strings (`'N/A'` ×46, `'Varies'` ×3) in `cost`/`bestTime` initially rendered literally ("· best at N/A") instead of being suppressed, since those fields are non-nullable strings and the component's `{#if}` guard only catches falsy values. Fixed by normalizing to `''` in the transform; re-verified zero occurrences post-fix.

## Deferred (not part of this milestone)

- **D2/D3 thesis conflict** (O6, decision-log.md) — `data/maps-trip-analysis-public.json` supersedes "Trip 1 was instinct travel (no guides existed)" with evidence that every trip-1 city had a 32–42 place self-made Google Maps list (47.4% vs. 52.5% on-list navigation). This changes the site's framing question from *instinct vs. curation* to *self-curation vs. sourced curation* — a decision across D2, D3, CLAUDE.md, and landing copy, not a data-entry task. This chunk's ingest is correct either way; trip-1 statuses are explicitly not final pending it.
- **Attendance reconciliation** — joining `perCityAdherence` / saved lists / `topPlaces` (from the Takeout data) against guide recs to assign real statuses. Its own chunk; this one builds the seam (`assignStatus`, the cross-listed report) for it.
- **NOLA** — no `new-orleans-guide.json` exists; per M0, joins the retro-guide backlog. Portland stays excluded per D2; Austin and Philadelphia are anchor/home.
- **Schema additions** for the unmapped guide fields inventoried above.
