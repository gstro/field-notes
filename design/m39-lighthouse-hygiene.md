# M39 — Lighthouse sweep, plus small hygiene

Per-milestone doc. `manual-steps.md` §5 listed "run a Lighthouse pass" as unstarted since M1.1, alongside three small code-only hygiene items that had been mis-filed in a document reserved for things only a human can do. This closes the Lighthouse item with real findings — the last one the M1.1 precedent would predict — and does the three hygiene edits in the same pass.

No production URL is recorded anywhere (`manual-steps.md` §2 flags that), so every measurement here is against `npm run build && npm run preview` on localhost. That excludes CDN/edge effects; the performance numbers below are a floor, not what a visitor on the live Vercel URL sees.

## Method

Six routes sampled — the same set M1.1 used for its viewport sweep (`/`, `/city/washington-dc`, `/chapter/west`, `/data`, `/colophon`, `/superlatives`) — via `lighthouse` (run ad hoc through `npx`, not added as a dependency) driving headless Chrome against the local preview server, scored on performance / accessibility / best-practices / SEO.

## Before

| route | perf | a11y | best-practices | SEO |
|---|---|---|---|---|
| `/` | 91 | 90 | 100 | 91 |
| `/city/washington-dc` | 88 | 92 | 100 | 91 |
| `/chapter/west` | 100 | 100 | 100 | 91 |
| `/data` | 100 | 95 | 100 | 91 |
| `/colophon` | 100 | 95 | 100 | 91 |
| `/superlatives` | 94 | 100 | 100 | 91 |

## What was actually broken

**Every muted-text element that added extra `opacity` on top of `--muted` failed WCAG AA.** `--muted` (`#8A8270`) against `--dark` (`#111009`) measures 5.0:1 and against `--dark2` (`#1C1A12`) measures 4.57:1 — both clear the 4.5:1 text threshold, but only just, and **any opacity fraction below 1 applied on top pushes it under 4.5:1** (checked at 0.55 through 0.9 — even 0.9 only reaches 4.28:1). Six call sites stacked an extra fade onto text already carrying the site's dimmest color:

- `StatStrip.svelte` — `.pending .n` (unreconstructed stat figures) and `.flag` ("not yet reconstructed" label)
- `src/routes/+page.svelte` and `city/[slug]/+page.svelte` — the `.pending` class marking not-yet-built cities
- `RecommendationList.svelte` — `.st-unknown`, the "VISIT UNKNOWN" status badge (83 of 89 violations on the DC page alone — nearly every trip-2 rec carries it)
- `Adherence.svelte` — `.d`, the sub-figure captions under the adherence numbers
- `FragmentationCompare.svelte` — `.p-list`, the not-yet-built-cities list on `/data`
- `InterestComposition.svelte` — `.zero`, the zero-count row style. **Lighthouse's own six-route sample never caught this one** — Washington DC (the sampled city) happens to use all 8 interest tags, so its zero state never renders. Charlotte, Phoenix, and Salt Lake City each use only 7 and do render it; checked and fixed by inspection, then verified directly against `/city/charlotte-nc` (0 contrast violations, 100 a11y after the fix).

Fix in every case: drop the extra `opacity`, keep `--muted` at its designed value ([D29](decision-log.md#d29-no-opacity-multiplier-on---muted-text)). One case additionally lost a design-time toggle: `PopCulture.svelte`'s `.item.dim` (opacity on un-visited filmed-location entries) is removed outright rather than dialed back, since the "Visited" pilgrim badge already carries that distinction and the dim state was hitting `.note` text at ~4.57:1 base contrast before any fade — no fraction of it would have passed.

Removing the opacity left `st-skipped` and `st-unknown` (`RecommendationList.svelte`) sharing the same text color with only a border-style difference (solid vs. dotted) — the fade the old code comment called "fainter than skipped" had been doing real differentiating work. Checked against the full corpus: `planned-skipped` has zero occurrences across all 787 recommendations today, so this is not a live collision, but D21's pending trip-2 attendance reconstruction will populate it eventually, so `st-unknown` was given a background fill to keep the two distinct once it does. **First attempt used a `--muted`-tinted fill, which re-broke the exact contrast bug this pass exists to fix** — caught by re-running Lighthouse after the "fix" rather than trusting the CSS read: at a 4.57:1 base margin against a 4.5:1 floor, any warm fill pulls the background toward the text color and drops contrast further, the same mechanism as the opacity bug. Swapped to `rgba(0,0,0,0.18)` — a dark fill moves the opposite direction (4.57:1 → 4.75:1) and still reads as a visually distinct, recessed badge. Full detail in [D29](decision-log.md#d29-no-opacity-multiplier-on---muted-text).

**`landmark-one-main` and `heading-order` were failing on `/` and `/city/[slug]`**, the two pages that never adopted the `<main>` wrapper the other four routes already use, and that render section titles as `<p class="section-label">` / `<p class="panel-label">` instead of `<h2>`, so `<h1>` jumps straight to a component's internal `<h3>`. Both pages now wrap their content in `<main>` and promote those labels to `<h2>` — no visual change, since the site's global reset already zeroes heading margins and `.section-label`/`.panel-label` are class-scoped, not tag-scoped.

**`meta-description` was missing on all six routes** (the SEO score's one universal deduction) — no page had one, and there's no shared layout to inherit from. Added a real, page-specific description to every route's `<svelte:head>` rather than a boilerplate string. City pages fall back to a generic line when `tagline` is empty (`??` doesn't catch it — `tagline` is `""`, not `null`, dataset-wide today), which is every built city at present.

**One unstyled link**: `<a href="#revisions">` in the colophon's prose was the only anchor in the codebase with no scoped color rule, rendering in the browser's default link blue (`#0202d7`, 1.8:1 against `--dark`). Now styled with the site's own in-prose link convention (`--gold`, `--burnt-light` on hover).

## After

| route | perf | a11y | best-practices | SEO |
|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 100 |
| `/city/washington-dc` | 98 | 100 | 100 | 100 |
| `/chapter/west` | 100 | 100 | 100 | 100 |
| `/data` | 100 | 100 | 100 | 100 |
| `/colophon` | 100 | 100 | 100 | 100 |
| `/superlatives` | 100 | 100 | 100 | 100 |
| `/city/charlotte-nc` (spot check, not in the original six) | 91–99 (re-run varied) | 100 | 100 | 100 |

Remaining performance deductions are Lighthouse's LCP/FCP/TTI timing on an unthrottled localhost preview — not a defect, and not comparable to a production measurement over a real network; re-running the charlotte page showed performance swing between 91 and 99 across otherwise-identical runs, which is the noise floor for this measurement method, not a regression. Accessibility, best-practices and SEO were stable at 100 across every re-run.

Charlotte was re-verified against the final build (after the `st-unknown` fill fix below) rather than left standing on its earlier capture — a11y 100, zero contrast violations, confirmed by re-running Lighthouse a second time after the fix that follows.

## Hygiene, same branch

Three items from `manual-steps.md` §5 were code-only and had been sitting there since M1.1 by mis-categorization (the doc's own preamble excludes code changes) rather than by any real blocker:

- Dropped `@sveltejs/adapter-auto` — grepped for any reference outside `package.json`/the lockfile and found none; the app has used `adapter-static` via `vite.config.ts` since the scaffold.
- Added `engines.node` (`"^20.19.0 || >=22.12.0"`) and a matching `.nvmrc` (`24`). The range is Vite 8's own stated `engines.node`, read from the installed package rather than guessed — `.npmrc` sets `engine-strict=true`, so a wrong range here would hard-fail `npm install` rather than warn. `npm install`, `npm run check`, and `npm run build` all still pass under it.
- Fixed the stale `README.md` line telling readers they "may need to install an adapter" — one has been configured and in use the whole time.

All three are removed from `manual-steps.md` §5 as part of this change; that document is for things only a human can do, and these no longer qualify as undone.

## Verified during implementation

- `npm run check` — 0 errors, 205 files.
- `npm run build` — same 22 prerendered pages as before, no new warnings.
- Every fix re-measured directly (contrast math checked by hand against the exact colors Lighthouse reported, then confirmed by re-running Lighthouse against the rebuilt site) rather than assumed fixed from reading the CSS.
- Every rendered *string* is unchanged — this pass touched color, opacity, markup semantics, and `<head>` metadata, never copy. Visually: the `<h2>`/`<main>` promotions are non-events (global margin reset already zeroed heading spacing; `.section-label`/`.panel-label` are class-scoped); every de-opacified muted element is now visibly brighter than before, by design — that brightening is the fix, not a side effect.
- Looked at it, not just measured it: full-page Chrome screenshots of the landing page and Washington DC's city page against the rebuilt preview. The now-full-opacity "not yet reconstructed" stat figures read clearly as data without reading as *findings* — the muted color alone (against the gold of a real figure) still carries the "this isn't measured" signal; the opacity had been doing no visual work the color wasn't already doing. The `st-unknown` "VISIT UNKNOWN" badges are legible with their dotted border and recessed fill, distinct from a plain `st-skipped` badge without being visually loud.

## Deferred

Not run: a Lighthouse pass against the actual production Vercel URL, since it isn't recorded anywhere (`manual-steps.md` §2) — that's still a manual-steps item, now narrowed to "record the URL and re-run Lighthouse against it," not "run Lighthouse" cold. The `ConstellationMap` mobile-treatment question (`m11-site-quality.md`'s deferral) is untouched — still D5 territory, still the user's call.
