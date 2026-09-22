# M38 — Four of the unmapped guide fields, and a shop-talk audit

Per-milestone doc. Closes the one item M3's inventory of unmapped guide content ([`m3-guide-ingest.md`](m3-guide-ingest.md#unmapped-guide-content--inventory-not-a-schema-change)) left as "should become a schema proposal as its own decision" — the only unblocked item the implementation plan named as outstanding, everything else in the milestone table gated on the M0 pulls, a manual ratings pass, or an ImageKit account.

**Added:** `sources`, `scopeDecision`, `honestGaps`, `statusNotes`, `popCulture.correctionNote` — full rationale and render targets in [D28](decision-log.md#d28-four-of-the-unmapped-guide-fields-added-the-rest-stay-out). **Rejected as render targets:** `framing`/`analyticalThread` ([R20](rejection-log.md#r20-framing-and-analyticalthread-as-rendered-city-page-content)). **Deferred, not rejected:** `district`/`address`.

## The discriminator

M3's inventory listed 8 per-city and 9 per-recommendation unmapped fields with no ranking among them. The rule that sorted them: **does rendering this assert something unverified about the world, or does it describe the guide's own method?** `sources`/`scopeDecision`/`honestGaps`/`statusNotes`/`correctionNote` are all the guide talking about itself — what it drew on, what scope it set, what it couldn't confirm. Nothing here is a new claim about a place. `framing`/`analyticalThread` are the opposite: generated narrative prose standing in for the traveler's own voice in a first-person retrospective. `district`/`address` are real claims about the world, just unaudited ones — M5f's finding (6 of 22 DC neighbourhoods wrong) is exactly the failure mode 552 more unaudited values would repeat at scale.

## What shipped

- `types.ts`: `GuideGap` (`id`, `categoryNum`, `text`, `citedFrom: string | null`) and `GuideNote` (`id`, `severity: 'info' | 'warning'`, `text`) — new interfaces, not reuses of `Citation`/`Recommendation`, because a guide-level note isn't a place being recommended. `City` gains `sources: string[]`, `scopeDecision: string | null`, `honestGaps: GuideGap[]`, `statusNotes: GuideNote[]`; `popCulture` gains `correctionNote`.
- `tools/ingest-guides.mjs`: `transformHonestGaps` maps `honestGaps[].category` through the same `CATEGORY_TO_NUM` table recommendations use, so `honestGaps[].categoryNum` and `Recommendation.categoryNum` mean the same thing. `transformStatusNotes` and `transformCorrectionNote` are thin copies, plus the exclusion/redaction logic below.
- `GuideNotes.svelte` (new): renders `scopeDecision`, `honestGaps` (grouped under "What the Guide Looked For and Didn't Find," each tagged with its `CATEGORIES` label), `statusNotes` (under "Corrections & Live-Status Caveats"), and the `sources` bibliography. Guarded at the page level (`hasGuideNotes`) and mounted as a new "About This Guide" section on `/city/[slug]`, directly below "The Full List — Sourced & Cited."
- `PopCulture.svelte`: `correctionNote` renders first, ahead of `filmedHere`/`bornHere`, since it reframes what follows (e.g. "Napoleon Dynamite wasn't actually shot in Boise" before the films that *were*).

All four are per-field nullable/empty-safe per D9; none required a `population.note`-style store-not-render hold, because the audit below *was* the editorial pass D23 left outstanding for that pattern.

## The shop-talk audit

Reviewing all 15 guides' `statusNotes`/`scopeDecision`/`sources` by hand (49 status notes, 15 scope decisions, ~160 source-list entries) surfaced three instances of the exact leak D23 named for `population.note`: guide-*generation* commentary ("this run's web-search tool budget was exhausted... shared across a 13-city parallel batch") sitting inside guide content, rather than a caveat about a place.

- **Charlotte** `statusNotes['search-budget-exhausted']` and **Richmond** `statusNotes['search-tooling-constrained']` — excluded by id via a `STATUS_NOTE_EXCLUSIONS` set in the transform.
- **Richmond** `scopeDecision` — the field is one real sentence ("Richmond-proper primary.") followed by three sentences of tool-budget commentary. Trimmed via `data/city-overrides.json`'s `richmond-va` entry to the real sentence, verbatim, using the same override mechanism D24 already established for reviewed corrections.
- **Richmond** `sources` — the bibliography's last entry carried the same parenthetical (`"...( search-engine tooling constrained this session -- see scopeDecision)"`); trimmed the same way, keeping "Targeted web search and direct-source fetch."

Running the same check against the fields *already live since M3* — because leaving a known-identical defect unaudited while writing about auditing for it would be inconsistent — found two more, both in `Recommendation.note`: Oklahoma City's Prototek OKC pick and Charlotte's Local Honey pick, each carrying a "(web-search budget...)"/"(search-tool access was limited)" parenthetical. These predate this chunk (M3, Aug 2026) but are the same defect class, so fixed here via a new `NOTE_REDACTIONS` map (keyed `slug/recId`, same shape as `STATUS_NOTE_EXCLUSIONS`) rather than deferred, since the fix is two strings.

**What was kept.** Roughly a dozen other `statusNotes`/`Recommendation.note` entries use "this run"/"this session" phrasing too — but scoped to one place ("Ken Sanders Rare Books' current address could not be confirmed... this session"), which is a normal, honest verification-currency caveat, not a declaration about the guide-generation process. Excluding those would have deleted real content for no reason; only the five instances above are actually about the run itself.

One `honestGaps` entry (Atlanta, `no-dedicated-gear-shop`) has `citedFrom: null` in the source guide — carried as `null`, not backfilled, per the standing D19-corollary rule against inventing attribution.

## Verified during implementation

- `npm run check` — 0 errors, 205 files. `npm run build` — all pages prerender.
- `node tools/ingest-guides.mjs --dry-run` before writing: 15 city files, overrides applied `richmond-va.scopeDecision, richmond-va.sources, washington-dc.elevationFt, washington-dc.+32recs` — no surprise overrides fired.
- Diffed every regenerated city file: the only changes are the four new top-level fields plus `popCulture.correctionNote`; every existing `recommendations[]` entry's `status`/`rating`/`categoryNum`/`note` is untouched except the two `NOTE_REDACTIONS` hits.
- Corpus-wide grep of the built `build/` output for the shop-talk phrases (`search budget`, `tool budget`, `budget for this batch`, `search-tool access was limited`) — zero hits post-fix, confirming both the transform-level exclusions and the `city-overrides.json` trims actually reached the rendered pages.
- Spot-checked `CATEGORIES[g.categoryNum]` resolves for every `honestGaps` entry across all 15 cities — all 8 category strings used (`bookstores`, `records`, `pastry`, `gifts`, `electronics`, `souvenirs`, `venues`, `sights`) map through the existing table; `validateCity` now also hard-fails on an out-of-range `categoryNum` or an unrecognized `severity`.
- `richmond-va.json`: `scopeDecision` reads `"Richmond-proper primary."`; `sources`' last entry reads `"Targeted web search and direct-source fetch"` — confirmed matching the override, not the raw guide value.
- `charlotte-nc.json`/`richmond-va.json`: `statusNotes` no longer carry `search-budget-exhausted`/`search-tooling-constrained`; every other id present.

## Also found, corrected in passing

The saved-list overlap figure carried three different values across three docs (`189/163` in [m37-colophon.md](m37-colophon.md), `206/179` in the implementation plan, `217/189` from a fresh `join-takeout.mjs --dry-run` today) — expected drift, since the plan's own line already says the count "moves with each city ingested," but three live values for one figure is more than that caveat should produce. Updated the implementation plan's line to the current number; the milestone docs that recorded a point-in-time count (`m35`, `m37`) are left as the historical record they are.

## Deferred

Unchanged: `district`/`address` (see D28's corollary), the M4 leg-ledger and M5 prices/spend (both gated on the M0 card-statement/routing pulls), saved-list overlap rendering (blocked on the in-situ-save circularity, not on review), the git-history scrub, and the ratings/attendance/fingerprint memory passes (M6).

**`guideValue` in `city-overrides.json` is documentation, not a check.** `applyOverrides` sets `city[field] = spec.value` unconditionally; it never diffs against what the guide currently produces. Richmond's two new entries record the shoptalk string they're trimming as `guideValue`, same as D24's restorations record theirs — but nothing re-verifies that string against a regenerated `richmond-guide.json` if the guide file itself ever changes. Harmless today (guides are a fixed input, not something this repo edits), and not worth a schema/tooling addition on the strength of a hypothetical; flagged so a future guide regeneration doesn't trust a stale comment.

**Checked, not changed:** `GuideNotes`' render guard is an OR across `scopeDecision`/`honestGaps`/`statusNotes`/`sources`, so a hypothetical city with only a bibliography would get the "About This Guide" heading over one line. Not the M5c orphan-heading defect (that was a heading over *zero* content) — a sources-only panel still renders real content — and no city in the current 15 is in that state (all four fields are populated everywhere but the two exclusions). Left as-is rather than hardened against a case that doesn't occur.
