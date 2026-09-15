# M5e — What the guide was made of

Per-milestone doc. Renders the guides' **cross-cutting interest axis** for the first time — an 8-value vocabulary carried on 749 of 769 recommendations since the M3 ingest, referenced in three design docs, and displayed nowhere. It was the largest body of committed, real data with no surface on the site.

Also closes the schema hole M3 named but left open: `interestTags` was typed `string[]`, so the vocabulary was unenforced.

## The axis, and what it is not

Eight tags, orthogonal to the 10 guide categories — a record shop is category 2 whether or not it reads as `i-punk`:

`i-food` · `i-drinks` · `i-books` · `i-punk` · `i-diy` · `i-political` · `i-horror` · `i-bees`

This is a **third** interest vocabulary on the site and must not be confused with the other two:

| vocabulary | source | question it answers | where it renders |
|---|---|---|---|
| **Guide `interestTags`** (8, `i-*`) | the guides, per recommendation | what the guide was made of | city pages (this milestone) |
| Maps `interestMix` (7, keyword) | Takeout, keyword-tagged on destination names | what got navigated to, trip-wide | `/data` — `CurationSlope` (M5a) |
| Maps `interestTagCounts` (same 7) | Takeout, per city | what got navigated to, per city | carried in `visited.json`, unrendered |

They have different vocabularies, different sources, and answer different questions. Putting them on one axis would be the D27 error exactly.

## What it shows

The module is per city, sorted by count, with every tag's share of that city's tags. Food and DIY are a near-constant floor everywhere — **the differentiator is the third slot**:

- **Political history** is #2 in Washington DC (19 tags, 22%), and runs high in Jackson (16%) and New Orleans (17%) — the Civil Rights Corridor cities, showing up in the guides' own composition rather than in anything editorial.
- **Horror & occult** leads the tail in Richmond (16%) and Albuquerque (12%).
- **Punk & indie** takes the slot across the west — Dallas, Las Vegas, Phoenix, Boise, Salt Lake City.

## Within-city only — the reason is a data finding

Tagging density varies by guide, and by a lot. Oklahoma City averages **2.27 tags per tagged recommendation**; Boise averages **1.12**. The histograms are not close: OKC has 27 recommendations at two tags and 18 at three, while 44 of Boise's 50 carry exactly one.

So a raw tag count is a fact about **tagging style as much as about the city**, and OKC's 118 tags against Phoenix's 53 would read as a real difference when much of it is not. Shares inside a single city normalize that out; the same bar against another city's does not.

The module therefore renders **no cross-city comparison and no ranking**, and nothing on the page invites one. Same standing rule as D27 and the unweighted-mean near-miss in M3.7: a number must answer the question its label asks.

This is also why the note under the module says *shares are of tags, not of recommendations* — with multi-tagging, those are different denominators.

## Zeros are kept

Three cities have a tag at zero (Charlotte, Phoenix and Salt Lake City, all `i-drinks`). The row stays, labelled, with its ink removed rather than dropped — following `CurationSlope`'s explicit-zeros precedent, where "film 7 → 0" is the finding rather than a gap to hide. An absent interest is a fact about the guide; dropping the row would make every city's list look equally full.

## The schema hole, closed and proven

`interestTags: string[]` let a guide invent a value silently — the failure M3 actually hit, when DC's vocabulary had diverged to a 21-value set and `npm run check` caught neither side. It is now `InterestTag[]`, a union of the eight, with display labels in `registry.ts` beside `CATEGORIES` and `STATUS_META`.

**Verified it enforces rather than merely type-checks:** injected `i-cheese` into one Boise recommendation and confirmed `npm run check` fails on it, then reverted. The union also passes clean against all 15 cities as committed, which is itself the proof the vocabulary is exactly these eight everywhere.

## Form

Sorted horizontal bars, **one hue**. The tags are nominal, so colouring by value would double-encode bar length and spend the only free channel for nothing — `FragmentationCompare`'s reasoning, applied again. Eight categorical hues would also sit at the very top of the CVD ladder for no gain. Hand-rolled, no dependency (D25); no new palette, so no validator run was needed.

Placed in the right-hand column of the fragmentation row, which had been rendering as a half-empty two-column grid, and directly above the full list whose composition it describes.

## Verified during implementation

- `npm run check` — 0 errors, 203 files. `npm run build` — all pages prerender.
- The `InterestTag` union fails on an injected out-of-vocabulary value (tested, reverted) and passes on all committed data.
- Rendered and inspected at 1050px on Washington DC (all eight present) and Phoenix (the zero state). Shares sum to 100% and counts to the stated total on both.
- No `recommendations` data touched — rec counts and every `≥N of M` unchanged (D26). This milestone adds no data file at all; the module derives entirely from what each city already carries.
- `portland-or`, `austin-tx`, `philadelphia-pa` still carry no `href` on the built pages.

Note for whoever screenshots next: the flat-file build serves city pages at `city/<slug>.html`, and opening that path directly makes the client router read the slug as `<slug>.html` and render its own 404 after hydration. The prerendered HTML is correct; use `npm run preview`, which routes the way Vercel does.

## Deferred

- **Per-recommendation tag chips in `RecommendationList`.** The module summarizes the composition but a reader cannot see which picks carry which tag. That list already carries a status chip, cost, time, duration, citations and a note per item; adding one to three more chips is a density decision, not a data gap.
- **`interestTagCounts` in `visited.json`** (the Maps vocabulary, per city) is still unrendered — a *navigated-to* composition that would pair naturally with this *guide* composition, but only if the two vocabularies are kept visibly distinct.

Unchanged from [M5d](m5d-improvisation-finding.md): the unmapped-guide-field schema proposal, the 22 dropped DC venues, saved-list overlap rendering, the git-history scrub, and the ratings/attendance/fingerprint memory passes.
