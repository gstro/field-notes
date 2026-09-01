# M4a — Chapter pages, and NOLA's slot pre-wired

Per-milestone doc. D1's three-chapter arc is the site's organising spine and had no pages until now — the landing showed three cards that linked nowhere. `/chapter/west`, `/chapter/nola` and `/chapter/south` are live, prerendered from `trips.json`.

**A partial M4.** D17's leg-ledger needs `legs.json`, and leg data is genuinely blocked: tracking was off during the trips, so per-leg distances need the M0 routing pull. The ledger is a module *within* a chapter page, not the page itself, so everything else shipped and the ledger's absence is stated on each page. Third time this shape has applied (colophon, M5a) — D9/D10 working as intended.

## Two number traps

**Nights.** Chapter I has three defensible "lengths" and they disagree: its date span is 25 days, its road nights total 23, and summing every city's `nights` gives **200** — because Austin's 177-night anchor stay is in that list. A bare 200 reads as the drive.

Resolved by labelling the figure **"nights on the road"** and excluding `role` `origin`/`anchor`/`home`, with the date span shown separately as a span. Austin's 177 nights still appear beside Austin in the route list, where they are true and in context. Verified: no chapter page contains the string 200.

**Interest mix.** Per-city `interestTagCounts` aggregate cleanly and tell the D22 story at chapter granularity — but summing them gives west `food 44 / coffee 44` where the authoritative `comparison.trip1.interestMix` says **51 / 50**. Summing re-derives an authoritative number: the trap caught on the colophon and again on `/data`.

Resolved by reading `comparison.trip1` / `comparison.trip2` **verbatim** for west and south. `interlude_NOLA` carries no mix, so the interlude chapter shows New Orleans's *own* tag counts — one city, so it is that city's record rather than an aggregate, and labelled as such on the page.

## Three cities carry no visit data, and the page says so

Portland, Austin and Philadelphia have `topPlaces` in the export and are **deliberately not carried**. Portland is 1,570 entries across years of living there; Austin is the 177-night anchor; Philadelphia is where the arc ends. Rendering those under "where the days actually went" would mix a life with a journey — the same category error D2 cites when excluding Portland from the hit rate.

They appear as named, dated waypoints with a `role` marker, and the page states the omission rather than leaving it to look like a gap.

## NOLA's slot, pre-wired

The user is generating a New Orleans guide. The pipeline could not have received it: `new-orleans` was absent from all four mapping tables — `SLUG_TO_MAPS_NAME`, `SLUG_TO_CITY_ID` and `SLUG_TO_SAVED_LIST` in `join-takeout.mjs`, and `SLUG_TO_CITY_ID` in `ingest-guides.mjs`. Everything else already knew NOLA: `cityIndex.json`, `trips.json`, the 96-place `2026 New Orleans` saved list, and 13 `topPlaces`.

Adding the entries is safe before the guide exists — the tool iterates the guides directory, so an unmatched entry is unused. **One deliberate side effect:** the adherence loop keys on `SLUG_TO_MAPS_NAME`, so New Orleans entered `adherence.json` immediately (99 saved / 33 navigated / 33.3% conversion / 43.7% on-list), giving the interlude chapter real figures now.

**Two bugs that would have surfaced the moment the guide landed:**

- **`isRetro` was `tripId === 'west'`** — flagged in M3.5 as "moot today, revisit if a NOLA file lands." NOLA is an interlude that had no guide at the time, so its retro guide produces `retroactive-recommendation` statuses, but `isRetro` would have been false: the panel would have read "Guide Hit Rate" and the waffle would have shown the trip-2 legend against trip-1 data. **Now derived from the data** — `source.type === 'retro-guide'` — which answers the actual question rather than a proxy that happened to hold for 14 cities.
- **`Adherence.svelte` fell through to "sourced-curated"** for any non-`trip1` value, so NOLA's `trip: 'interlude'` would have been labelled sourced-curated, which is false. Now a third case: *self-curated, between the trips*.
- **`AdherenceCompare.svelte` on `/data`** grouped only `trip1`/`trip2`, so New Orleans would have been **silently filtered out** of that chart once it entered `adherence.json`. Now an interlude group — a city vanishing from a comparison without saying so is the failure this site keeps correcting.

**Dry-run, then discarded.** A minimal stub guide was dropped in, both tools run, and the result verified: the NOLA city page built, the chapter populated and linked to it, the **retro panel rendered correctly**, and adherence read "self-curated, between the trips". The stub was then deleted and the tree confirmed byte-identical to before. No fabricated guide is committed — when the real one lands, it is `node tools/join-takeout.mjs && node tools/ingest-guides.mjs`.

## Greensboro, finally

`sideTrips` records the International Civil Rights Center & Museum at the Woolworth sit-in counter — 8 direction requests, en route Charlotte → Richmond, "a civil rights corridor stop not in any guide." Flagged for M4 since M3.5 because it belongs to a leg rather than a city. It renders on the `south` chapter under "Off the route", in the off-guide blue.

## Other notes

- `chapterMeta.json` now holds the chapter blurbs, shared by the landing page and the chapter route so they cannot drift. It also carries `mixSource`, which encodes the verbatim-vs-city rule above in data rather than in a component condition.
- Landing chapter cards link via their heading and a "Read this chapter" link — **not** by wrapping the card in an anchor, which would have nested the city links inside it and produced invalid HTML.

## Verified during implementation

- `npm run check` — 0 errors, 201 files. `npm run build` — all three chapters prerender; landing links resolve.
- **`/chapter/nola` has zero city links** while New Orleans is unbuilt — the D10 case that would fail the crawler first.
- No chapter page contains `200`; road nights read 23 / 10 / 28 against spans of 25 / 11 / 29 days.
- West and south interest mixes match `comparison` exactly (51/50 for west, not 44/44); NOLA shows its own tags.
- **719 recs / 50 confirmed byte-identical to `main`**; the 14 guide cities' `visited.json` entries unchanged by NOLA's addition.
- New Orleans renders on `/data` in its own interlude group.
- `isRetro` verified against built pages: retro panel on the 7 trip-1 cities, absent on the 7 trip-2 cities.
- Greensboro on `south` only. Idempotent; zero runtime dependencies; no motion.

## Deferred

- **The leg ledger** — distances and drive times need the M0 routing pull. This is what M4 still owes.
- **NOLA's guide** — the user's to generate; arrival is now a two-command no-op.
- Prices/spend (M0), the other 22 dropped DC venues, the saved-list overlap render, the colophon wishlist, and M6 superlatives (ratings empty dataset-wide).
