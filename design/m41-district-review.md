# M41 — Neighbourhoods, reviewed

Per-milestone doc. Closes the `district` half of the deferral [D28](decision-log.md#d28-four-of-the-unmapped-guide-fields-added-the-rest-stay-out) left open: *"Revisit once neighbourhood accuracy has a review pass, the way M5f gave DC's citations one."* This is that pass. `address` stays deferred ([D33](decision-log.md#d33-district-renders-only-through-a-review-manifest-address-stays-out)).

**451 guide `district` values reviewed. 287 now render; 164 render nothing.** Every rendered value was checked against a named source. No raw guide value reaches the page.

| verdict | count | renders |
|---|---|---|
| `confirmed` — the guide was right | 247 | the value, lightly normalized |
| `corrected` — real venue, different neighbourhood | 40 | the corrected value |
| `not-a-district` — the guide value isn't a neighbourhood | 96 | nothing |
| `unverified` — couldn't be placed against a source | 68 | nothing |

The other 336 of the 787 recommendations had no guide `district` to review and stay `null`. That includes all 32 additive DC restorations (D24), which M5f verified for citation, not neighbourhood.

## How it works

- **`data/district-review.json`** is the manifest, keyed `<guideSlug>/<recId>`. Each entry carries:
  - the raw `guideValue` (kept for audit, never rendered)
  - a `verdict`
  - the `value`
  - one line of `evidence` naming the source checked
  - an optional `noteConflict`
- **`tools/ingest-guides.mjs`** carries `value` into `Recommendation.district` only for `confirmed` and `corrected`. It never reads the guide's own `district`. It fails the ingest when:
  - a guide rec has a district but no review;
  - a verdict and its value disagree;
  - an entry has no evidence.

  So a new or regenerated guide can't leak unreviewed values.
- **`RecommendationList`** leads the meta line with the neighbourhood: `Carytown · $0-30 · 1 hr · best at Afternoon`. The line is now built by joining, which also fixes 3 recs that rendered a leading `· ` because they had no cost.

### What counted as evidence

- **The bar is M5f's.** Each value has a named source: the operator's own site where one exists, otherwise an official or editorial listing (Visit Jackson, Visit OKC, downtownokc.com, TravelOK, Sprudge, Wikipedia, local papers). A few use an aggregator, and the evidence line names it.
- **Placing by address is marked.** When a source gave an address but no neighbourhood, the value was placed from the address, and the evidence line says so.
- **URLs were checked but not carried.** That's the corpus-wide `url: null` invariant (M5f).

### Normalization rules (`not-a-district`)

- **Ruled out:**
  - the bare city name ("Boise", "Jackson")
  - "Multiple locations"
  - bare streets and intersections ("Central Ave", "14th Street NW")
  - host-venue names ("Sloss Furnaces", "Indian Pueblo Cultural Center")
  - sales channels
  - chains where the pick isn't one specific location
- **Out-of-city venues carry the municipality:** Tempe, Garden City, Homewood, Los Ranchos, Ridgeland, Heber City.
- **One override at consolidation:** `albuquerque/indian-pueblo-store` came back `confirmed` as "Indian Pueblo Cultural Center". It was reclassified to match the host-venue rule applied everywhere else.

## What was wrong

**40 corrections.** Some only narrow a compound value ("Sweet Auburn / Old Fourth Ward" → "Sweet Auburn"). Many are a different neighbourhood outright, which is M5f's 27% finding repeated at scale:

| rec | guide said | actually |
|---|---|---|
| richmond — Black Swan Books (×3 entries), Vinyl Conflict | Carytown | Downtown (Black Swan left W Main St in 2019) |
| richmond — WPA Bakery | Church Hill / Scott's Addition | Forest Hill (the Church Hill store closed in 2020) |
| atlanta — Boggs Social & Supply | Cabbagetown | West End |
| new-orleans — HiVolt Coffee | Bywater | Lower Garden District |
| new-orleans — Community Workshop | Bywater | Broadmoor |
| salt-lake-city — Heavy Metal Shop, Randy's, La Barba | Downtown / 9th & 9th | Maven District |
| salt-lake-city — Mrs. Backer's | Sugar House | Central City |
| oklahoma-city — Beer City Music Hall | Farmers Market District | Iron Works District |
| shreveport — Fatty Arbuckle's | Red River District | Highland (moved) |

**Three corrections are out of town entirely, and the city page now says so:**
- **Videri Chocolate** is listed on Atlanta's page but is in Raleigh, NC.
- **Mid City Ballroom** is listed on New Orleans's page but is in Baton Rouge.
- **Sugaree's Bakery** is listed on Jackson's page but is in New Albany, MS.

Rendering the true location is correct under D19. Whether those recs belong on those pages at all is a separate question, flagged below and not acted on.

## ⚠️ 21 notes contradict the true location — flagged, not fixed

In M5f, a note whose rationale rested on a wrong location was a reason to exclude the rec. This chunk only reviewed the neighbourhood field, so it records each conflict in the manifest (`noteConflict`) and leaves the notes alone. Rewriting them, or excluding recs, would change recommendation content. That is the same class of call as M5f's four exclusions, so it's left for the user. The strongest:

- **Not where the city page puts them:**
  - Videri ("Atlanta bean-to-bar maker", in fact Raleigh)
  - Yo Mama's sauces ("Atlanta-founded", in fact Clearwater, FL)
  - Mid City Ballroom (Baton Rouge)
- **The note's whole pitch is the wrong place:**
  - Boggs ("next to Oakland Cemetery", but it's in West End)
  - Mrs. Backer's ("a Sugar House institution", but it's on South Temple)
  - Cathead Distillery ("right on Farish Street", but it's outside the historic district, which also makes the Farish Street rec's own note wrong)
- **Factually wrong beyond geography:** New Orleans's "Anne Rice mausoleum" at Lafayette No. 1. She is interred at Metairie Cemetery, so that rec was left `unverified`.
- **Pairs with a closed business:** two Jackson notes pair with Morningbell Records, which has closed.

The full list is in the manifest: `jq '.reviews | with_entries(select(.value.noteConflict))' data/district-review.json`.

## Coverage is uneven, and why

The five review agents shared a session web-search budget that ran out partway through. They finished with direct page fetches. That's why the unverified share is lopsided:
- Dallas: 14 of 28
- Birmingham: 11 of 28
- Phoenix: 8 of 31
- OKC and Salt Lake City: 0

**`unverified` is not a finding about the venue.** About 7 look closed (lapsed or parked operator domains: Xanadu, Phoenix General, Club Dada, Growl). The rest are fetch failures. A retry pass is a mechanical follow-up: re-run the review on `verdict == "unverified"` entries and update the manifest. Every one fails safe, by rendering nothing.

Closures surfaced in passing and **not** acted on, since `verifiedOpen` is out of scope here:
- Les Madeleines (SLC, closed 2022)
- Buttercream Bakeshop (DC, closed 2023)
- The String Shop (Shreveport, 2017)

## Found on the way: `npm run check` wasn't checking city data

CLAUDE.md, the `validate` skill and `setup/dev-environment.md` all say `check` validates city JSON against `types.ts`. **It hasn't since M1.1.** That change moved `/city/[slug]` to a lazy `import.meta.glob` cast `as { default: City }`, so TypeScript never sees the JSON. This chunk added a required field, and `check` still passed with that field missing from all 787 recs.

The fix makes the documented gate true, rather than rewriting four docs to say it doesn't exist:
- **New script.** `scripts/check-city-data.ts` validates every city file against the already-generated `schemas/city.schema.json`, using `ajv`, now an explicit dev dependency.
- **Runs in `check`.** It's appended to `npm run check`, so CI picks it up with no workflow change.
- **Proven both ways.** It passes on the new data. On the pre-M41 city files it fails all 15, with `must have required property 'district'`.

## Verified during implementation

- `npm run check`: 0 errors, and the city data check passes on 15 files.
- `npm run lint` passes, and so does `npm run build`, with all pages prerendered.
- `npm run schemas`: the regenerated schema is committed, so CI's drift check stays green.
- The city JSON diff is additive only. The one new line per rec is `district`; every other field is byte-identical, and `citySummary.json` is unchanged.
- `visual-check` on `/city/richmond-va` at a 390px emulated viewport:
  - no horizontal overflow, and no meta line overflowing its box;
  - no leading or trailing separators across all 46 recs;
  - console clean.
- `svelte-autofixer` on `RecommendationList.svelte` reports three missing `{#each}` keys, all pre-existing and untouched here.

## Deferred

- **`address`** stays out (D33). It's a more perishable claim than neighbourhood: venues move, and several did in this very sample.
- Retrying the 68 unverified values.
- **User's call:**
  - the 21 note conflicts and the 3 out-of-town recs;
  - the closures noticed in passing.
