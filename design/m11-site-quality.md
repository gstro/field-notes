# M1.1 — Site-quality pass

Per-milestone doc. Six milestones of data work never touched the site as a *site*. This is that pass: what a visitor actually downloads, whether the motion rule holds, the one page that looked unfinished, and the mobile review [M1](implementation-plan.md) never verified.

Two of the four things I set out to fix **turned out not to be broken**. Both had been "confirmed" by looking at a screenshot. Measuring them is what settled it, and that is the more useful finding of the two.

## Every visitor was downloading all fifteen cities

Five separate `import.meta.glob('$lib/data/cities/*.json', { eager: true })` call sites pulled the whole corpus — 787 recommendations with their notes — into one shared client chunk. Confirmed by grepping the built bundle: Birmingham's Sloss Furnaces and DC's Politics and Prose were both sitting in the JavaScript served to someone who opened the landing page.

The landing page globbed all fifteen cities **to collect their ids**. `/data` never touches a recommendation at all — it needs identity and population. The colophon and the chapter pages need totals. **Only `/city/[slug]` needs a whole city**, and it needs exactly one.

Two changes:

- **`citySummary.json`**, written by `tools/ingest-guides.mjs` alongside the city files — id, name, state, tripId, population and four counts per city. Derived by the transform that owns those files, so it cannot drift from them. 4.6KB against 676KB of city JSON. `population.note` is deliberately excluded: it is the D23 field no surface renders, and shipping it to the browser would send the one thing the site keeps unrendered.
- **`/city/[slug]` globs lazily.** `import.meta.glob` without `eager` still resolves its key set at build time, so the path lookup is free and only the awaited import loads data. Each city becomes its own chunk — verified: DC 53KB, Birmingham 28KB, no chunk containing two cities.

Measured per route, summing every JS asset the HTML references, built from `main` in a worktree for the before:

| route | before | after | |
|---|---|---|---|
| `/` | 521 KB · 142 KB gz | **89 KB · 35 KB gz** | −75% |
| `/data` | 553 KB · 150 KB gz | **121 KB · 43 KB gz** | −71% |
| `/colophon` | 527 KB · 144 KB gz | **95 KB · 37 KB gz** | −74% |
| `/city/washington-dc` | 553 KB · 151 KB gz | **123 KB · 44 KB gz** | −71% |
| `/chapter/west` | 545 KB · 148 KB gz | **113 KB · 42 KB gz** | −72% |

DC is the largest city in the corpus and still lands at 44KB gzipped. This serves D7 directly: a site whose stated virtue is being portable and dependency-free should not ship its entire database to read a headline.

## The D15 violation that wasn't

I reported that `ConstellationMap`'s `.nola` spur animates under `prefers-reduced-motion`, because the reduced-motion block appeared to cover only `.route`. **That was wrong.** The block does carry `.nola { opacity: 0.55 }`, and because `@keyframes fade` declares only a `to`, its implicit `from` resolves to whatever opacity is in force — 0.55 — so it animates to itself and nothing moves.

An exhaustive sweep for `animation`, `transition`, `transform`, `scroll-behavior`, `@keyframes` and Svelte's transition/animate directives finds the site's only motion is those two route animations, both handled, plus a `border-color` transition on the landing page's teaser cards, which is not motion. **D15 holds.**

One real weakness remains, so it is hardened rather than "fixed": that correctness is load-bearing on an *implicit* keyframe value. Adding a `from { opacity: 0 }` to the keyframe later would silently reintroduce the fade. `.nola` now sets `animation: none` explicitly, with the existing opacity override keeping the spur visible — remove that opacity and the New Orleans spur disappears entirely for reduced-motion users.

## The mobile overflow that wasn't either

At 390px the landing page screenshot showed the headline, the eyebrow, the stat strip and the constellation map all cut off at the right edge. It looked conclusive.

It was the same headless-capture artifact that produced clipped screenshots earlier in this project — the old `--screenshot` path lays out at a default width and crops to the window, so *every* page appears clipped regardless of its CSS. The viewport meta is present and correct, which ruled out the usual cause and forced a real measurement.

Driving Chrome over the DevTools protocol with `Emulation.setDeviceMetricsOverride` and comparing `documentElement.scrollWidth` against `clientWidth`:

**Six routes × three viewports (390, 360, 768) — eighteen checks, zero horizontal overflow.** `scrollWidth` equals `clientWidth` in every case.

Screenshots captured *through* CDP (which honours the emulated viewport) render correctly: the stat strip drops to two across, chapter cards stack, the constellation map scales, nothing clips. **M1's unverified mobile pass is now verified**, and the plan's hedge on it can be retired.

The lesson worth keeping: a screenshot from `--screenshot` is not evidence about layout. `scrollWidth` vs `clientWidth` over CDP is.

## The superlatives stub

The one page that looked unfinished, and the only one not on the design system — inline `style` attributes, no `<script>`, and a promise that it would be "populated from superlatives.json once reconstruction lands", naming a file that does not exist.

Rebuilt on the same structure as `/colophon`: back link, eyebrow, lede, sections, pull quote, the shared token palette. It now **states why it is empty** rather than promising content — ratings are the one field no export can supply, location history proves where the days went but not whether a place was worth returning to, and the only ratings that ever existed here were invented for layout and removed.

Its figures are derived from `citySummary`, not typed, so the page corrects itself the moment ratings land: it renders "None of the 787 recommendations carries one" today and "N of 787 recommendations carry one" if that changes.

## Verified during implementation

- `npm run check` — 0 errors, 204 files. `npm run build` — 22 pages prerender (15 cities, 3 chapters, 4 top-level).
- **Rendered visible text is byte-identical to `main` on all nine sampled routes except `/superlatives`**, the one page intentionally rewritten — compared against a `main` worktree build with scripts, styles and comments stripped. A payload refactor that changed no output.
- Every derived figure unchanged: 15 guides, 50 of 787 confirmed, 787 recommendations.
- Per-city code splitting confirmed: no chunk contains two cities' prose.
- D10 intact — no `href` to `portland-or`, `austin-tx` or `philadelphia-pa` on any built page, `/superlatives` included.
- Transform idempotent; `citySummary.json` regenerates identically.

## Deferred

`ConstellationMap` is legible but cramped at 390px — city labels sit near the floor of readable size. Not a defect and not a clipping problem; a design question about whether the map wants a mobile-specific treatment, which is D5 territory.

Unchanged: the unmapped-guide-field schema proposal, saved-list overlap rendering, the git-history scrub, and the ratings / attendance / fingerprint passes. Trip-2 attendance via calendar was investigated and declined this session — see the session's finding that a calendar entry evidences a plan, not a visit.
