# M5f — The dropped DC venues, verified

Per-milestone doc. Closes the thread carried in four milestone docs since M3.6: the **22 Washington DC venues** that the M2 hand-transcription covered, the generated guide doesn't, and M3.6 dropped because their citation was an empty placeholder.

**18 restored, 4 excluded for cause.** The exclusions and the reason they exist are the more useful half of this chunk.

## What was actually wrong with them

M3.6 recorded these as "no citation" — true, but incomplete. Every one carried `{source: 'web-search', label: null, url: null}`: the *shape* of a citation with nothing in it. Restoring them meant verifying each venue against a named source, which turned into an audit of the M2 transcription itself.

**Six of the 22 carry a factually wrong neighbourhood** — 27% of the sample:

| venue | M2 said | actually |
|---|---|---|
| Dua DC | Dupont Circle | 923 15th St NW — Downtown, near McPherson Sq |
| The Potter's House | Columbia Heights | 1658 Columbia Rd NW — Adams Morgan |
| Tango Pastry | Adams Morgan | 408 H St NE |
| Petite Cerise | Georgetown | 1027 7th St NW — Shaw / Mt Vernon Triangle |
| Saku Saku Flakerie | Capitol Hill | Tenleytown and Cleveland Park |
| Harper Macaw | Union Market | factory & café on M St, Georgetown |

Three were correctable — the neighbourhood lived only in the `name`, so the name was fixed and the correction recorded in that entry's `reason`. **Three were not**, because the note's whole rationale rested on the wrong location. That is the exclusion criterion.

## The four exclusions

- **Petite Cerise** — the note says "from the team behind Albi", "yellow-accented Georgetown café", "one block from the Exorcist Steps", "natural pairing for the horror pilgrimage". It is Jeremiah Langhorne's (The Dabney), it is in Shaw, and the Exorcist Steps are in Georgetown about two miles away. Correcting the neighbourhood would leave a note whose reason for existing is false.
- **Saku Saku Flakerie** — "take-out only Capitol Hill shop… perfect pitstop before or after Spin Time Records or NMAAHC." Both locations are in upper northwest. Same failure: the pick is a geographic pairing that does not exist.
- **Harper Macaw** — named for Union Market, which no source associates it with; the note's "Bolivia, Peru, and Ecuador" sourcing also disagrees with the maker's own account (Brazil's Amazon and Atlantic rainforests). Two independent unverifiable claims in one short entry.
- **Capital City Mambo Sauce** — a genuine duplicate. The generated guide already carries **Bottled Mumbo Sauce** in the same category 6. Restoring it would put the same product on the page twice from two provenances.

Excluding beats silently fixing: rewriting M2's prose until it matched the facts would leave the entry looking transcribed when it was really reconstructed here.

**Cross-category pairs are *not* duplicates and were kept.** "Smash! Records" (cat 2) and "Smash! Records Zines + Dischord Merch" (cat 9) are the established pattern, matching `Sankofa Video Books & Cafe` / `(gift shelf)`, `Joint Custody` / `Vintage/Local Tees`, and `Rhizome DC` / `(maker/craft programming)` already in the file.

## What the citations are, and what they are not

Each restored venue is now cited to a named, checked source — the operator's own site where one exists (`capitolhillbooks-dc.com`, `smashrecords.com`, `pottershousedc.org`, `elpollorico.com`, `dischord.com`, `nbm.org`), otherwise a publication (MICHELIN Guide for The Dabney, DC Historic Sites for the Howard Theatre, Atlas Obscura for Riggs Library, which M2's own note had already named inline).

**The URLs were verified but are not carried.** The transform enforces `c.url === null` for every citation corpus-wide — "never synthesize" — which is why no citation anywhere on the site is a link. That invariant predates this chunk and is left alone; lifting it is a D19 decision for the user, not a side effect of a restoration branch.

Riggs Library's note also carried literal `<em>` markup, the only HTML in any note in the corpus. The tags are removed and the "Atlas Obscura pick" they wrapped is now a citation, where it belonged. Its note also now states plainly that the library is managed for university functions rather than open for general visitation — M2 had hedged this as "check visitor access rules".

## ⚠️ DC is now a size outlier — the user's call

**DC goes 69 → 87 recommendations. The next-largest city is Jackson at 53; the smallest is Richmond at 46.**

This is close to the outcome [M3.6](m36-purge-invented-data.md) explicitly rejected: *"Merging the two DC sources was rejected: they overlap only 20 of 57, so a union would be ~92 recs against every other city's 46–55."* Restoring 14 in M3.7 and 18 here arrives at 87 by increments.

Arguments it is fine: these are real picks from the real DC survey, each now individually cited; `≥N of M` is a per-city figure that was never normalized across cities; DC had the longest stay (7 nights) and two source guides. Arguments it is not: the Waffle grid and hit-rate denominator make DC visually and numerically unlike every other city page, which is the comparability concern M3.6 raised.

**Consequences if kept:** DC's headline moves from `≥4 of 69` to `≥4 of 87` (confirmed visits unchanged at 4 — none of the 18 appear in the truncated `topPlaces`), and the corpus total moves 769 → 787. The colophon's derived figures follow automatically.

**Reversal is one file.** Deleting entries from `washington-dc.additionalRecommendations` in `data/city-overrides.json` and re-running `node tools/ingest-guides.mjs` restores any earlier count exactly. Flagged rather than decided, because M3.6's objection was on the record and this chunk does not overturn it.

## Verified during implementation

- `npm run check` — 0 errors, 203 files. `npm run build` — all pages prerender.
- Every restored entry passes the D24 guards: none sets `status`, `rating` or `verifiedOpen`. Confirmed in the output — all 18 have `rating: null`, `verifiedOpen: null`, and status assigned by the takeout join.
- `id` collisions against the 14 already restored: none.
- Corpus-wide: no empty `citedFrom`, no citation carrying a URL, **no broken citation anchor** in the built HTML.
- Only `washington-dc.json` changed — the other 14 city files regenerate byte-identical.
- Confirmed-visit floor unchanged at **50** corpus-wide; DC's confirmed count unchanged at 4.
- No `<em>` or other markup leaks into the built page.
- Rendered and inspected: all 18 appear under the right categories with their citation as plain text and "Visit unknown" status.

## A note on the M2 record's completeness

The m36 list was checked against the pre-M3.6 file recovered from git history, and it holds up: of ten M2 venues that a naive diff flags as absent, eight are present under the generated guide's own naming (Seylou, Som Records, Cedar Hill, Eastern Market Weekend Artisans, Politics and Prose, the U Street walk, and two mumbo-sauce entries). Only **DC9 Nightclub** is genuinely absent and unlisted, with the Busboys and Poets gift-area entry a borderline second. Both are left alone — this chunk restores the recorded 22 and does not quietly extend its own scope.

## Also settled here

**Rejected: a per-city navigated-interest module** (new [R19](rejection-log.md)). The obvious follow-on to [M5e](m5e-interest-composition.md) — pairing "what the guide was made of" with "what you actually navigated to" — does not survive contact with the data. The two vocabularies overlap on **2 of 8 tags** (only `books` and `food`); `interestTagCounts` sums direction *requests* rather than places, so it has a different denominator again; and it is computed over 8–14 truncated `topPlaces` per city. Rendering them side by side would read as one comparison while being three different measurements.

## Deferred

Unchanged: the unmapped-guide-field schema proposal, saved-list overlap rendering, the git-history scrub, and the ratings/attendance/fingerprint memory passes. Per-recommendation tag chips in `RecommendationList` remain a density call ([M5e](m5e-interest-composition.md)).
