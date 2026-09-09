# M2 — First real city: Washington DC

> **Superseded as a description of live data (M3.6, Aug 2026).** `washington-dc.json` is no longer this hand-transcription — DC was regenerated from `guides/washington-dc-guide.json` so it stops being a second provenance, and because its statuses and ratings here were dummy values that had begun rendering as measurements. **This doc remains the record of what the transcription taught** — the schema changes it forced (D19, D20), the citation-fidelity finding, the cross-category duplicate rule — all of which still hold. What no longer applies: the per-item dummy-status checklist below, and the "needed before publishing" list. The 37 venues unique to this transcription are listed in [`m36-purge-invented-data.md`](m36-purge-invented-data.md) so they can be re-added by hand if wanted.

Per-milestone doc, as `implementation-plan.md` calls for. Holds the findings that came out of transcribing one real city end to end, and the checklist of fields only Greg can fill in before this goes live.

## Why DC, not Birmingham

`Itineraries/` (since renamed `guides/`) turned out to hold two different guide formats. `dc-city-guide.html` is the category-first checklist the schema was designed around (9 categories × 45 items, matching `registry.ts` near-verbatim). `birmingham.html` and five other per-city files are day calendars badged Food/Music/Culture/Nature/Drinks/Film — Birmingham's guide has zero bookstores, record stores, or makerspaces, and would have populated 2 of 10 categories. DC uniquely has both formats (`washington-dc.html` is its 7-day calendar companion), so transcribing it exercises the checklist path and proves the day-calendar path maps, in one city. Birmingham stays the sample page, untouched, for M3.

## Source join

45 checklist items (`dc-city-guide.html`) merged with 26 day-guide activities (`washington-dc.html`) by venue name, plus 13 day-guide-only venues added as additional recommendations (things Greg's day-by-day itinerary covers that the checklist didn't, e.g. Library of Congress, NMAAHC, the National Mall walk). **57 total recommendations**, category 10 (DIY Electronics/Maker) empty — expected, since this guide predates the D13 re-patch that added it.

**Cross-category duplicates — a real defect, not a checklist item.** The 45-item checklist lists three venues under two categories each: Mahogany Books (Bookstores + Souvenirs), Busboys and Poets (Bookstores + the "Gift Area" in Souvenirs), Smash! Records (Record Stores + "Zines + Dischord Merch" in Souvenirs). Mahogany Books was the identical name and description in both places — an outright duplicate, not two offerings — and it briefly shipped with contradictory dummy statuses (`attended` in one category, `planned-skipped` in the other), which would have double-counted it in the hit-rate denominator and asserted two different outcomes for one real visit. **Fixed:** the duplicate collapsed to a single entry in Bookstores (its primary offering); the Souvenirs copy is removed. Busboys and Poets and Smash! Records genuinely describe two distinct sub-offerings at one venue (a bookstore-café visit vs. its gift area; a record store visit vs. its merch table) and are kept as two entries — but since a single physical visit covers both, their dummy statuses were aligned to agree (Smash! Records: both now `attended`; Busboys already agreed). **Rule going forward:** one entry per distinct offering is fine, but entries describing the same physical venue must never carry contradictory status/rating — check for this explicitly on future transcriptions, since nothing in `npm run check` catches it (it's a cross-entry consistency rule, not a per-field type).

**The venue-name join was narrower than expected: only 12 of 45 checklist items (27%) had a recoverable citation from the day guide.** The other 33 fall back to `{ source: 'web-search', label: null, url: null }` — never an invented attribution. This is itself the M2 finding on citation fidelity: the checklist format records zero per-item citations natively; only cross-referencing against the day-guide's `[Atlas Obscura]` / `[nps.gov]` / `[eater.com/dc]` style tags recovers real provenance, and it only recovers it for items the day-guide also happened to visit. This is a colophon error-bar item (M6) — for two-thirds of DC's recommendations, "cited from a web search" is honest but doesn't say which search result.

One address inconsistency surfaced in the join and was left unresolved rather than silently picked: the checklist lists "Dischord Records House + Inner Ear Studios — **Arlington, VA**"; the day guide's "Dischord House pilgrimage" gives "**3819 Beecher St NW, Tenleytown**" (a DC address). Both may be describing genuinely different addresses (label vs. rehearsal-space vs. recording-studio conflation) — worth checking against `dischord.com` before publishing.

## Schema changes (D19, D20)

- **D19 — per-citation source URLs.** `RecommendationList.svelte` previously pointed every citation chip at one shared `source.url`, which couldn't express DC's frequent two-sources-two-URLs case. `Recommendation.source.citedFrom` is now `Citation[]` (`{ source, label, url }`) instead of `CitedSource[]` sharing one URL. `label` carries the real publication name; chips fall back to `SOURCE_LABELS[source]` when absent. The `CitedSource` enum (D4) is unchanged.
- **D20 — `spend` field on `City`.** M2's own text said spend/lodging "go straight into the city JSON" (D16), but `types.ts` had no such field. Added, fully nullable, populated `null` — the card-statement CSVs are still an outstanding M0 pull. DC's guide "~$200 Est. Total"-style figures are pre-trip estimates, not reconstructed spend, and do not go here.
- **Dropped `Recommendation.category: string`** — dead field, `""` in every sample row, grouping runs entirely off `categoryNum`.
- **Not changed:** the 10-category taxonomy, the `CitedSource` enum. `interestTags` is transcribed (DC's `tagLabels` map onto it directly) but left unrendered — `RecommendationList` doesn't have a tag row, and adding one is unbuilt scope this milestone didn't need to touch.

## What's dummy — review before publishing

Two whole-city fields are placeholder markers, following the same `SAMPLE`-prefix convention Birmingham already used: `vibeWord: "DUMMY-VIBE"`, `tagline: "DUMMY — one-sentence characterization pending your review."`. Also dummy: `wouldILiveHere`, `favorites`, `fieldNotes` free text (all empty/null), `fingerprint` (all-null — D12 requires all 18 cities scored in one sitting, and O4/when is still open; per D6 the fingerprint leads the city page, so DC currently opens with nothing there).

**Every recommendation's `status` and `rating` are dummy values**, assigned mechanically for display/reality-check purposes, not from any record of what actually happened. No `off-guide-discovery` status was used anywhere — inventing a venue not in either source file would be fabricating a place, which is a different kind of thing than varying a status field on a real venue, so that status is simply unused pending real off-guide finds. `estCost` / `durationMin` / `bestTimeOfDay` were parsed mechanically off each item's `meta` string (`'$15 · 2–3 hrs · 10am'`-style) — reasonable but not hand-verified; expect some to be off (e.g. an 11am opening time reading as "lunch").

The full per-item checklist:

### 1. Bookstores
- [ ] **Bridge Street Books — Georgetown** — dummy status `attended` · rating: would-not-return
- [ ] **Busboys and Poets — 14th St NW** — dummy status `attended` · rating: would-return
- [ ] **Capitol Hill Books — 657 C St SE** — dummy status `planned-skipped`
- [ ] **Politics & Prose — Connecticut Ave NW** — dummy status `attended` · rating: would-not-return
- [ ] **Mahogany Books — Anacostia** — dummy status `attended` · rating: would-return

### 2. Record Stores
- [ ] **Smash! Records — Adams Morgan** — dummy status `attended` · rating: would-return (aligned with its Souvenirs entry — same venue, one visit)
- [ ] **Joint Custody — 1530 U Street NW** — dummy status `attended` · rating: would-not-return
- [ ] **Som Records — 14th St NW** — dummy status `planned-skipped`
- [ ] **Spin Time Records — Capitol Hill** — dummy status `attended` · rating: would-return
- [ ] **Byrdland Records — Union Market** — dummy status `closed-on-arrival`

### 3. Coffee
- [ ] **Lost Sock Roasters — Takoma / Brightwood Park** — dummy status `attended` · rating: would-return
- [ ] **Dua DC — Dupont Circle** — dummy status `attended` · rating: would-return
- [ ] **Unido Coffee — Shaw** — dummy status `planned-skipped`
- [ ] **The Potter's House — Columbia Heights** — dummy status `attended` · rating: would-return
- [ ] **Slipstream — Logan Circle** — dummy status `unverified`

### 4. Pastry & Bakeries
- [ ] **Seylou — Blagden Alley, Mt. Vernon Triangle** — dummy status `attended` · rating: would-not-return
- [ ] **Ellē — Mt. Pleasant** — dummy status `attended` · rating: would-return
- [ ] **Tango Pastry — Adams Morgan** — dummy status `attended` · rating: would-return
- [ ] **Petite Cerise — Georgetown** — dummy status `attended` · rating: would-not-return
- [ ] **Saku Saku Flakerie — Capitol Hill** — dummy status `planned-skipped`

### 5. Unique Dishes
- [ ] **Half-Smoke @ Ben's Chili Bowl — U Street NW** — dummy status `attended` · rating: would-return
- [ ] **Mumbo Sauce Wings — any U Street carry-out** — dummy status `attended` · rating: would-not-return
- [ ] **Ethiopian Doro Wat + Injera @ Etete — 9th St NW** — dummy status `unverified`
- [ ] **Mid-Atlantic Seasonal @ The Dabney — Blagden Alley** — dummy status `attended` · rating: would-return
- [ ] **Peruvian Pollo a la Brasa @ El Pollo Rico — Arlington** — dummy status `planned-skipped`
- [ ] **Mitsitam Native Foods Café** — dummy status `attended` · rating: would-return
- [ ] **Farewell dinner: Tail Up Goat** — dummy status `attended` · rating: would-not-return

### 6. Mailable Gifts
- [ ] **Capital City Mambo Sauce** — dummy status `attended` · rating: would-return
- [ ] **DC Rooftop Honey — Eastern Market** — dummy status `closed-on-arrival`
- [ ] **Harper Macaw Chocolate — Union Market** — dummy status `attended` · rating: would-not-return
- [ ] **Go-Go Vinyl — Som Records / HR Records** — dummy status `attended` · rating: would-return
- [ ] **Dischord Records Back Catalog — direct or at Smash!** — dummy status `planned-skipped`

### 7. Sights & Oddities
- [ ] **The Exorcist Steps — Georgetown** — dummy status `attended` · rating: would-not-return
- [ ] **Dischord Records House + Inner Ear Studios — Arlington, VA** — dummy status `unverified` (address conflict, see above — check before setting a real status)
- [ ] **National Museum of African American History & Culture** — dummy status `attended` · rating: would-return
- [ ] **Riggs Library — Georgetown University** — dummy status `attended` · rating: would-not-return
- [ ] **U Street "Black Broadway" Corridor + Ben's + Lincoln Theatre** — dummy status `attended` · rating: would-return
- [ ] **Library of Congress** — dummy status `attended` · rating: would-not-return
- [ ] **Smithsonian American Art Museum + National Portrait Gallery** — dummy status `planned-skipped`
- [ ] **Folger Shakespeare Library** — dummy status `attended` · rating: would-return
- [ ] **The Phillips Collection** — dummy status `unverified`
- [ ] **International Spy Museum** — dummy status `attended` · rating: would-return
- [ ] **Frederick Douglass National Historic Site — Cedar Hill** — dummy status `attended` · rating: would-not-return
- [ ] **Meridian Hill Park** — dummy status `attended` · rating: would-return
- [ ] **Mitsitam or Union Market** — dummy status `attended` · rating: would-not-return
- [ ] **National Mall morning walk** — dummy status `attended` · rating: would-return
- [ ] **Smithsonian National Air and Space Museum** — dummy status `unverified`

### 8. Punk/Indie Venues
- [ ] **9:30 Club — U Street Corridor** — dummy status `attended` · rating: would-return
- [ ] **Black Cat — 14th St NW** — dummy status `planned-skipped`
- [ ] **DC9 Nightclub — U Street NW** — dummy status `attended` · rating: would-return
- [ ] **Songbyrd Music House — Union Market** — dummy status `attended` · rating: would-return
- [ ] **The Howard Theatre — Shaw** — dummy status `unverified`
- [ ] **Madam's Organ** — dummy status `planned-skipped`

### 9. Souvenirs
- [ ] **Eastern Market — Capitol Hill Weekend Craft Hall** — dummy status `attended` · rating: would-return
- [ ] **Busboys and Poets Gift Area — 14th St NW** — dummy status `attended` · rating: would-not-return
- [ ] **National Building Museum Shop — Penn Quarter** — dummy status `closed-on-arrival`
- [ ] **Smash! Records Zines + Dischord Merch** — dummy status `attended` · rating: would-return (aligned with its Record Stores entry — same venue, one visit)

(Mahogany Books' duplicate Souvenirs entry was removed — see the cross-category duplicates note above. It's listed once, under Bookstores.)

## Also needed before publishing

- `wouldILiveHere.verdict` / `.note`
- `favorites.meal` / `.coffee` / `.site` / `.newFood` / `.bestStranger` / `.weirdestThing`
- `fieldNotes` — coffee/egg prices, parking, tap water, stranger-friendliness, etc.
- `vibeWord`, `tagline`
- `population.cityProper` / `.metro` — filled with reference figures (702,250 / 6.3M, general census-adjacent knowledge) pending a real check against a source.
- `elevationFt` — left `null` rather than asserted. An initial 25 ft (the National Mall's elevation) would have misrepresented the city, which spans roughly 1–410 ft; per D9 this renders as nothing rather than a misleading single number.
- Any off-guide discoveries — places visited that neither guide file lists. None are in this transcription; DC is guide-only data.
- Fingerprint scoring session (O4, still open).

## Verified during implementation

- `npm run check` — 0 errors.
- `npm run build` — prerenderer passes; `/city/washington-dc` and `/city/birmingham-al` both build; landing page still renders the other 16 cities as non-linked "data pending" spans.
- Citation chips confirmed rendering real labels where recovered ("DC independent bookshop community", "busboysandpoets.com") and falling back to "Web" for the `web-search` enum where not; no chip is a broken link since no URLs were available to transcribe (all `url: null`).
- Fingerprint panel renders its label but no radar content — confirms D9 graceful degradation against real (not sample) nulls.
- Waffle renders `st-attended` / `st-skipped` / `st-closed` classes correctly per the dummy status mix (39 attended / 9 planned-skipped / 6 unverified / 3 closed-on-arrival), respecting D11's color law. No `off-guide-discovery` or trip-1 statuses appear, as expected for a trip-2 guided city.
