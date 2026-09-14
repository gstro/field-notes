# M5d — What curation displaced

Per-milestone doc. Renders the last unconsumed result in the authoritative Maps analysis: **on-ground searching fell while the number of distinct places reached held steady.** Everything else in `comparison` was already on the site; these two fields had been sitting in `data/maps-trip-analysis-public.json` since the first Takeout commit, cited in the corpus's own `reading` prose, and displayed nowhere.

## The finding

| measure | trip 1 · self-curated | trip 2 · sourced guides | change |
|---|---|---|---|
| Searches per direction request | 1.19 | 0.99 | −16.8% |
| Distinct places per city-day | 5.4 | 5.2 | −3.7% |

A ratio below 1 means more places were navigated to than searched for on the ground.

**The second row is what makes the first one mean something.** Searching falling on its own is ambiguous — it's equally consistent with simply doing less. It's the near-flat place count that rules that out: the same amount of ground got covered with materially less looking around. The guides answered the question searching used to answer, and did not add stops.

This is a third angle on D22, and the first one that measures *behaviour* rather than content. M5a showed sourced guides inflated list size ~55% while conversion dropped; M5b showed published guides accounted for the smallest share of actual navigation. This shows what the guides took over.

**Stated as observational, on the page and here.** Nothing in the export records *why* a search did or didn't happen; the ratio is consistent with the list pre-answering it, and that is the strongest claim the data supports.

## Why this is not a fourth chart

The `/data` page already carries three. This is four numbers — two measures × two trips — and a handful of headline numbers is a stat row, not a grouped bar.

It also *can't* be one chart honestly: a ratio and a per-day count are different scales, and putting them on one plot means a dual axis. Percentage change is the one common base they legitimately share, so the bars encode only that, on a shared axis, in a **single hue** (magnitude, not identity). The raw before/after values are direct-labelled from the verbatim figures and carry trip identity via the gold/burnt dots `CurationSlope` already established.

Hand-rolled, no dependency, per [D25](decision-log.md#d25-hand-rolled-charts-no-charting-dependency).

## A geometry bug, caught by looking at it

The first version put the fill and its percentage label in one flex context. Flex then shrank the **longest** bar to make room for its label — so the bar that should have read 100% of the shared axis silently didn't, and the two bars were no longer comparable. That comparability is the entire finding.

Fixed by giving the track its own flex child at `flex: 1` with the label fixed-width beside it, so both tracks measure identically and each fill is an exact percentage of a full-width track. Verified in the built HTML: `100%` and `22.037%`, against a hand-check of 3.7037 / 16.8067 = 22.037%.

Caught by rendering the page and looking, not by reading the markup — the markup looked correct.

## Palette check

Ran the CVD/contrast validator on the gold/burnt pair before writing chart colour. It reproduces [D25](decision-log.md#d25-hand-rolled-charts-no-charting-dependency)'s recorded figures exactly — **normal-vision ΔE 18.4, deuteranopia 15.3**, contrast ≥3:1 — so the pair this component inherits is confirmed still passing, not assumed.

One check **FAILs**: gold `#D4A843` sits outside the validator's lightness band for a dark surface (0.753). That is a property of the site's D14 visual system, which uses gold as the primary accent site-wide, and predates this component by every milestone. **Not changed here** — repainting the site's accent is a D14 question for the user, not a side effect of adding a panel. Recorded so the next person running the validator isn't surprised by it. The separation checks that govern whether two series are tellable apart all pass, and every value is direct-labelled regardless.

## Also carried

`windowAnalyzed` and `entriesInWindow` now land in `adherence.json` alongside the comparison, so the page's provenance line ("drawn from 26,779 Maps entries between 2025-09-01 and 2026-07-18") is rendered from data rather than typed into prose — the same discipline M5c applied to the colophon's guide count.

`comparison.interlude_NOLA` remains uncopied and that is deliberate: its three figures are New Orleans's own, and `AdherenceCompare` already renders that city's row (33.3% conversion) from `perCityAdherence`. Copying the aggregate would put the same number on the page twice from two sources.

## Verified during implementation

- `npm run check` — 0 errors, 202 files. `npm run build` — all pages prerender.
- Generator diff confined to the intended keys: `searchToDirectionsRatio` and `uniquePlacesPerCityDay` on both trips, plus the two corpus-scale keys. `visited.json` and `attendance-matches.json` byte-identical.
- Rendered values are the stored ones — 1.19, 0.99, 5.4, 5.2 — with no formatting applied; `String()` gives the source's own precision.
- The derived −16.8% reconciles with the corpus's own prose, which states the same move as "fell 17%".
- Bar widths exactly proportional on a shared axis (see the geometry bug above).
- `portland-or`, `austin-tx`, `philadelphia-pa` still carry no `href` on the built `index.html`, `data.html`, `colophon.html`.
- Rec counts and every `≥N of M` untouched — no `recommendations` data in the diff (D26).
- Rendered at 900px and inspected; a 380px capture clips, but the untouched colophon clips identically at that width, so it is a headless-capture artifact rather than an overflow introduced here.

## Deferred

Unchanged from [M5c](m5c-deferred-threads.md): the unmapped-guide-field schema proposal, the 22 dropped DC venues, saved-list overlap rendering, the git-history scrub, and the ratings/attendance memory passes. M5's remaining gated half (prices, spend, driving timelines) still waits on the M0 card-statement export.

With this, **every field in the analysis corpus's `comparison` object is either rendered or has a recorded reason not to be.**
