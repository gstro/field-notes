# The Long Way Home — Design

*(working title — the repo is `field-notes`)*

**Project:** Retrospective website for a coast-to-coast relocation arc: Portland → Austin (Oct 2025) → New Orleans interlude (Feb 2026) → Philadelphia (May 2026). 18 cities, 242 days, ~4,800 miles.

**Companion docs — this doc references them and does not repeat them:**

| Doc | Holds |
|---|---|
| [`decision-log.md`](decision-log.md) | Endorsed decisions (D1–D15) with rationale, plus open questions (O1–O5) |
| [`rejection-log.md`](rejection-log.md) | Rejected alternatives and non-goals (R1–R13) with rationale |
| [`implementation-plan.md`](implementation-plan.md) | Build milestones (M0–M7), current state, and the data-reconstruction audit |
| [`roadmap.md`](roadmap.md) | Floated-but-unendorsed feature ideas |
| `../setup/roadtrip-setup-guide.md` | Verified setup/deploy steps and data-entry workflow |

---

## 1. Concept

One arc, two migrations, three chapters ([D1](decision-log.md#d1-three-chapter-arc-framing)). The site is an **analysis, not a travel blog** — data-forward by identity, editorial by voice. Two structural theses:

1. **The comparison thesis.** Trip 1 was **self-curated** travel (own judgment, no external sources — but every city had a 32–42 place self-made Maps list); trip 2 was **sourced-curated** travel (10-category guides built from Atlas Obscura / Eater / Time Out / TasteAtlas). Retroactive guides for trip-1 cities create a control group, and the site's signature question — *does the source of curation change what you curate, or how faithfully you follow it?* — is answered with real data: list-following barely moved (47.4% → 52.5%), but content inverted (books ×6.9, museums ×2.9, records 0→24) ([D22](decision-log.md#d22-self-curation-vs-sourced-curation-supersedes-the-instinct-framing), superseding the earlier instinct framing — [R17](rejection-log.md#r17-the-instinct-vs-curation-framing)). Trip-1 and trip-2 data are semantically different and are **never visually conflated** ([D3](decision-log.md#d3-distinct-trip-1-status-enum), [D11](decision-log.md#d11-status-color-law)).
2. **The corridor thesis.** The route is accidentally a transect of American history and economics: the interstate West, the civil rights corridor, municipal fragmentation (city-proper vs. metro gap as a chartable proxy for racial-political history, [D8](decision-log.md#d8-fragmentation-bar-on-every-city-page)), and 2025–26 prices as a time capsule. The analytical layer is substantive content, not garnish.

**Voice:** honest superlatives (worst meal gets equal billing), wry stat cards (CPAP setups: 243), disclosed methodology (retro-guide anachronism, reconstruction error bars — the colophon is a real page).

## 2. Goals / non-goals

**Goals:** permanent personal artifact · SvelteKit learning vehicle · every recommendation citable to source ([D4](decision-log.md#d4-every-recommendation-carries-sourcecitedfrom)) · graceful incremental buildout — publishable at every stage of data entry ([D9](decision-log.md#d9-every-field-nullable)) · $0 hosting.

**Non-goals:** see [`rejection-log.md`](rejection-log.md) R1–R5 (no CMS/backend, no comments/social, no SEO, no other people's trips, no real-time).

## 3. Architecture

- **Stack:** SvelteKit 2.63 / Svelte 5 (runes) / Vite 8 / TypeScript 6 · `adapter-static`, full prerender · GitHub (private) → Vercel Hobby · ImageKit for photos.
- **"Database is Git"** ([D7](decision-log.md#d7-static-only-database-is-git)): all content is JSON in `src/lib/data/`. `cityIndex.json` (thin registry: 18 × id/coords/nights/label) drives the map and nav; `cities/*.json` (deep per-city files) drive city pages. A city page + all links to it materialize automatically when its JSON lands — no route work per city.
- **Crawler-safety pattern** ([D10](decision-log.md#d10-crawler-safety-data-pending-pattern)): unbuilt cities render as non-linked "data pending" everywhere. Load-bearing; keep it on new link surfaces.
- **Types as guardrail:** `types.ts` encodes the schema; `npm run check` rejects malformed city data before it can break a build. Config lives in `vite.config.ts` ([R12](rejection-log.md#r12-sveltekit-config-in-svelteconfigjs)).

## 4. Visual system

Ported from the trip guides for continuity ([D14](decision-log.md#d14-visual-system-ported-from-trip-guides)): bg `#111009` (+ `#1C1A12`, `#252318` surfaces), burnt orange `#C85A00`/`#E8722A`, gold `#D4A843`, cream `#F5EDD8`, muted `#8A8270`, hairline gold borders. Type: Playfair Display (display, italic accents in gold), IBM Plex Mono (labels/metadata/eyebrows, uppercase + tracked), IBM Plex Sans 300 (body). Tokens in `src/lib/tokens.css`.

**Status color law** ([D11](decision-log.md#d11-status-color-law)) governs waffles, chips, and any future chart touching status. **Motion** stays behind `prefers-reduced-motion` ([D15](decision-log.md#d15-motion-behind-prefers-reduced-motion)); the constellation draw is the one theatrical moment.

## 5. Page inventory

| Page | Design |
|---|---|
| Landing | Constellation hero ([D5](decision-log.md#d5-constellation-landing-map-no-basemap): data-driven SVG, dot r = 4+2√nights capped 20), stat strip, chapter cards, teasers |
| City template | Header (vibe word/tagline/stay) → fingerprint ([D6](decision-log.md#d6-fingerprint-leads-the-city-page)) + favorites → waffle + fragmentation gap → full sourced recommendation list → pop culture/pilgrimage + verdict → field notes → prev/next. All modules nullable-aware |
| Trip chapters ×3 | Format open (O1); interlude chapter gets lighter treatment (`type`-driven) |
| Data deep-dive | LayerChart; prices time capsule, spend, timelines, 18-city fragmentation comparison |
| Superlatives | Awards format from `superlatives.json` |
| Colophon | Methodology, reconstruction disclosure, wishlist ("things I wish I'd captured") |

Build status and sequencing live in [`implementation-plan.md`](implementation-plan.md).

## 6. Component inventory (runes-mode)

`ConstellationMap` (projection from cityIndex; label offsets data-driven) · `StatStrip` · `Fingerprint` (6-axis spider from `fingerprint`, renders nothing if all-null) · `Waffle` (derives counts from statuses; `isRetro` swaps palette + legend) · `RecommendationList` (grouped by the 10 guide categories; per-item status chip, source badges linking out where URL exists, cost/duration/best-time meta, closure warning) · `FragmentationBar` · `FieldNotes` (renders only non-null) · `PopCulture` (pilgrimage badge; trivia-only entries dimmed).

## 7. Data schema

**Principle ([D9](decision-log.md#d9-every-field-nullable)):** every field is nullable; the site renders gracefully around gaps — a missing spider axis or absent photo set degrades to nothing, not to an error or placeholder junk. `types.ts` in the scaffold is the enforced source of truth; this section is the annotated reference.

### 7.1 File layout

```
/src/lib/data/
  trips.json                 # trip-level metadata, all three chapters
  legs.json                  # every driving leg
  cityIndex.json             # thin registry: 18 × id/coords/nights/label
  cities/
    portland-or.json         boise-id.json            salt-lake-city-ut.json
    las-vegas-nv.json        phoenix-az.json          albuquerque-nm.json
    oklahoma-city-ok.json    dallas-tx.json           austin-tx.json      # dual-role: destination AND origin
    new-orleans-la.json      # interlude, flagged as such
    shreveport-la.json       jackson-ms.json          birmingham-al.json
    atlanta-ga.json          charlotte-nc.json        richmond-va.json
    washington-dc.json       philadelphia-pa.json
  prices.json                # cross-city benchmark table
  superlatives.json          # trip-wide awards
  serial-photos.json         # index of same-subject photo series
```

### 7.2 Trip level (`trips.json`)

```json
{
  "trips": [
    { "id": "west",  "title": "Portland → Austin",      "subtitle": "The Interstate West",
      "dates": { "start": "2025-10-02", "end": "2025-10-26" }, "type": "relocation",
      "cityIds": ["portland-or", "...", "austin-tx"] },
    { "id": "nola",  "title": "New Orleans",             "subtitle": "Mardi Gras Interlude",
      "dates": { "start": "2026-02-09", "end": "2026-02-19" }, "type": "interlude",
      "cityIds": ["new-orleans-la"] },
    { "id": "south", "title": "Austin → Philadelphia",   "subtitle": "The Civil Rights Corridor",
      "dates": { "start": "2026-05-03", "end": "2026-05-31" }, "type": "relocation",
      "cityIds": ["shreveport-la", "...", "philadelphia-pa"] }
  ]
}
```

`type` drives layout: interludes get a lighter chapter treatment; relocations get the full treatment (format per O1).

### 7.3 Legs (`legs.json`)

One record per driving day; powers the route map, timeline, and (if endorsed) elevation-profile and soundtrack features.

```json
{
  "id": "okc-dallas", "tripId": "west", "date": "2025-10-23",
  "from": "oklahoma-city-ok", "to": "dallas-tx",
  "miles": null, "driveTime": "7:49", "route": "I-35 S",
  "statelinesCrossed": ["OK/TX"],
  "elevationStartFt": 1200, "elevationEndFt": 430,
  "soundtrack": [
    { "type": "album", "title": "", "artist": "" },
    { "type": "podcast", "show": "", "episode": "" }
  ],
  "gasStops": [{ "location": "", "pricePerGal": null, "photoId": null }],
  "notes": "",
  "gotLost": { "genuinely": 0, "gpsLost": 0 }
}
```

A possible `detours` field is open question O5.

### 7.4 Cities (`cities/*.json`) — sections in render order

**Identity:**

```json
{
  "id": "birmingham-al", "name": "Birmingham", "state": "AL", "tripId": "south",
  "stay": { "arrive": "2026-05-09", "depart": "2026-05-12", "nights": 3 },
  "coords": { "lat": 33.5186, "lng": -86.8104 },
  "elevationFt": 644,
  "population": { "cityProper": null, "metro": null },
  "vibeWord": "", "tagline": "",
  "wouldILiveHere": { "verdict": null, "note": "" }
}
```

`population` city-proper vs. metro is deliberate — it feeds the fragmentation-gap ratio charted on every city page (D8).

**Recommendations** (the citable guide data) — one array, every entry tagged by the 10-category guide taxonomy (including Category 10, DIY Electronics/Maker Spaces):

```json
{
  "name": "Wooden Shoe Books", "categoryNum": 1,
  "source": { "type": "guide", "citedFrom": [
    { "source": "atlasobscura", "label": "Atlas Obscura", "url": "https://..." },
    { "source": "web-search", "label": null, "url": null }
  ] },
  "status": "attended",
  "interestTags": ["radical-politics", "bookstores"],
  "estCost": "$20-40", "bestTimeOfDay": "afternoon", "durationMin": 60,
  "rating": null, "note": "", "verifiedOpen": true
}
```

- `status` enum — trip 2 (sourced-curated): `attended` · `planned-skipped` · `off-guide-discovery` · `closed-on-arrival` · `unverified`; trip 1 (retro-guided): `attended-anyway` · `retroactive-recommendation`. **The two trip-1 values are provenance markers, not outcome claims** — `retroactive-recommendation` means "the retro guide picked this; visit status unknown," and `attended-anyway` is a confirmed-visited floor, not a rate (D3, redefined M3.5). Semantics and the never-conflate rule: D3.
- `source.citedFrom` is an array of `{ source, label, url }` (D19, M2) — one URL per citation, not one shared per recommendation. `source` is the enum: `atlasobscura` · `tasteatlas` · `eater` · `timeout` · `web-search` · `local-tip` · `self` (D4). `label` carries the real publication name when known; falls back to the enum's display label. Off-guide discoveries use `local-tip` or `self`. Where a per-item citation isn't recoverable from source material, it's `{ source: 'web-search', label: null, url: null }` — never invented.
- This one `status` field powers the waffle charts, the guide hit-rate **floor**, off-guide discovery highlights, and the closures ledger (Proof Bakeshop, Hodgepodge, Switched On, Ipanema — the displacement story is content, not just a data-quality footnote). It does **not** power the comparison thesis: that comes from `perCityAdherence` in `data/maps-trip-analysis-public.json`, computed from the full pre-sanitization corpus (D22). Deriving a thesis rate by counting statuses is what produced M3's `0 / N` defect.
- `rating` stays null pending O3.

**Pop culture:**

```json
"popCulture": {
  "filmedHere": [{ "title": "", "year": null, "locationVisited": null, "visitNote": "", "photoId": null }],
  "bornHere":   [{ "name": "", "relevance": "punk|horror|film|literature|politics", "note": "" }]
}
```

Filtered to interest-relevant figures only. `locationVisited` (bool) distinguishes "trivia" from "pilgrimage completed" (e.g., the TCM gas station in Bastrop).

**Fingerprint** — six axes, 1–5, subjective by design; scored in one sitting per trip (D12):

```json
"fingerprint": { "food": null, "musicScene": null, "weirdness": null,
                 "politicalEnergy": null, "cost": null, "interestCoverage": null }
```

**Favorites (city-local):**

```json
"favorites": {
  "meal": { "what": "", "where": "", "note": "" },
  "coffee": { "what": "", "where": "" },
  "site": { "what": "", "note": "" },
  "newFood": "", "bestStranger": "", "weirdestThing": ""
}
```

**Field notes (texture layer):**

```json
"fieldNotes": {
  "coffeePriceUsd": null, "eggsDozenUsd": null, "parkingEase": null, "tapWater": null,
  "strangerFriendliness": null, "bartenderAskedWhereFrom": null,
  "firstUnpromptedConversation": "", "accentNote": "", "roadQuality": null, "yardSignRatio": ""
}
```

**Spend** (D20, M2) — null until the M0 card-statement export lands; a guide's pre-trip cost estimate is not reconstructed spend:

```json
"spend": {
  "total": null, "byCategory": { "food": null, "lodging": null, "drinks": null },
  "lodging": { "name": null, "cost": null, "nights": null, "note": "" }
}
```

**Photos** — nulls expected; serial grids render whatever subset exists:

```json
"photos": {
  "hero": "imagekit-path", "gallery": ["..."],
  "serialSubjects": { "churchMarquee": null, "newspaperFrontPage": null,
    "specialtyDishInHand": null, "viewFromBed": null, "handwrittenSign": null,
    "overpass": null, "monumentOrPedestal": null }
}
```

### 7.5 Cross-city files

- **`prices.json`** — the time-capsule table: one row per city × {coffee, eggs, gas avg, cheapest beer}. Sourced from `fieldNotes` + `gasStops`, denormalized for direct chart consumption.
- **`superlatives.json`** — trip-wide awards: best meal, worst meal, most surprising, biggest letdown, biggest overdeliver, most moving moment, best album cover seen, most expensive purchase (the espresso machine), hardest city to leave.
- **`serial-photos.json`** — maps each serial subject → ordered city list → ImageKit paths, for the grid pages.

## 8. Data pipeline

Reconstruction sources: Google Maps Timeline export (routes/miles/durations), Spotify extended history (leg soundtracks), card CSVs (spend by city via date-range join), photo EXIF (city assignment + timestamps), trip-2 guide localStorage (**perishable — harvest first**), Curated Events calendar. Trip-1 guides: generated retroactively via the re-patched 10-category skill ([D13](decision-log.md#d13-skill-re-patch-before-retro-guides)); anachronism disclosed in the colophon.

The full feasibility audit (exists / reconstructable / unrecoverable, per domain) and the time-sensitive rescue sequence live in [`implementation-plan.md`](implementation-plan.md#m0--data-rescue-time-sensitive-in-order).
