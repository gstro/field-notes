# M5c — Close deferred threads

Per-milestone doc. The NOLA guide ingest ([`0c2e074`](https://github.com/gstro/field-notes/commit/0c2e074)) landed the 15th city but shipped without a design doc, and left several surfaces written when there were 14 out of step with HEAD. This chunk closes that seam, fixes a live rendering defect it surfaced, and reconciles the docs. Corrective, not additive.

## The 15th-city seam

`fragmentation-notes.json` covered 14 cities; New Orleans was absent. Verified before editing: `/data`'s `fragRows` builds from the **city glob**, not from this file's keys, resolving `mechanism`/`kind` as `?? null` / `?? 'none'` — so NOLA was already rendering as a chart row (correctly *not* in the "Data pending" block, which is unbuilt cities only), just with a blank annotation line where the other 14 have one.

Added a `new-orleans-la` entry under the file's own extraction rule: kept the factual clause (population has fluctuated significantly since Hurricane Katrina), dropped the census-vintage provenance and the sea-level clause (qualifies elevation, not the city/metro ratio), `kind: "trend"` — a trajectory qualifying the ratio, not a structural mechanism explaining it, so it renders with the muted rule rather than gold. `sourceNote` keeps the guide's `population.note` verbatim.

Also verified no tool writes `fragmentation-notes.json` (unlike `adherence.json` — see below), so hand-editing was the correct mechanism.

**The colophon's `14 machine-generated 10-category guides` was typed in**, on a page whose own comment says every figure is derived, never typed. Replaced with the `{built}` value the page already derives from the city glob (line 14) — `guides/*-guide.json` and `src/lib/data/cities/*.json` are an exact 1:1 match at 15, so the glob count is also the guide count. Recorded that invariant in a comment so a future break (e.g. a guide landing without a corresponding city file) gets caught rather than silently mislabeling the figure — same D27 concern as the fingerprint-mechanism comment below.

**Stale comments corrected**, no behavior change: `city/[slug]/+page.svelte`'s `isRetro` derivation comment ("would mislabel New Orleans the moment its retro guide landed" — it landed), `AdherenceCompare.svelte`'s interlude-group comment (NOLA "isn't silently filtered out… once it enters" — it's in there), and `types.ts`'s D23 comment. The last one is not a blind 14→15 swap: it counts cities whose `population.note` carries *either* a mechanism or a trend (`fragmentation-notes.json`'s non-`none` kinds), which was exactly 10 of 14 before NOLA and is 11 of 15 after — verified by counting the `kinds` split directly rather than assuming the numerator holds.

## The unguarded-headings defect (predates NOLA)

`city/[slug]/+page.svelte`'s fingerprint row rendered two `<p class="panel-label">` headings — "City Fingerprint", "Favorites" — unconditionally, while `Fingerprint.svelte` self-guards its own content on `hasData` and the favorites `{#each}` guards each entry. Since `fingerprint` (all 6 axes) and `favorites` (the 3 keys this row reads) are empty in every one of the 15 city files, **every city page opened with an empty two-column section under two headings** — a live violation of CLAUDE.md's render-nothing rule, not a NOLA-caused regression.

Fixed by deriving `hasFingerprint` (mirrors `Fingerprint.svelte`'s own emptiness check: some axis non-null) and `hasFavorites` (mirrors the existing per-entry guard) in the page, guarding each column independently and the wrapping section on both — so the row disappears entirely today and each column reappears independently once its data lands (fingerprints in one sitting per O4; favorites piecemeal, since `newFood`/`bestStranger`/`weirdestThing` are separate fields headed for the superlatives page, out of scope here).

## `methodNotes` — a premise correction mid-branch

Planned to add `comparison.methodNotes` (three caveats: keyword-tagging is rough, adherence excludes `place_view` as circular, saves can't be dated) to the colophon, on the premise that nothing on the site rendered them.

**That premise was wrong.** The colophon's existing "Error bars" section already carries all three, in its own words, under `dt`s "Interest categories are keyword-tagged", "Adherence is directions-only", and "Saves cannot be dated" — a paraphrase this branch verified line-for-line against the corpus text, not something re-checked from an assumption. Adding a second, verbatim-worded list alongside would duplicate content the page already states more precisely (the existing prose ties two of the three to this site's own numbers and the saved-list-overlap non-publication decision).

**Kept:** extended `tools/join-takeout.mjs` to copy `methodNotes` verbatim into `adherence.json`'s `comparison` object, alongside the `pick()`ed `trip1`/`trip2` figures — closing a real gap (the file claimed to be a corpus-comparison copy but was missing one of the corpus's four `comparison` keys) and giving `adherence.json` a field parallel to the still-uncomsumed `uniqueDirTargets`/`cityDays` already carried there. Re-ran the generator; diff confirmed the *only* change across `adherence.json`, `visited.json`, and `attendance-matches.json` was the one added key.

**Not done:** no new colophon prose. Recording this here rather than silently narrowing scope.

## Deferred — not this branch

- **Schema proposals for unmapped guide fields** (`framing`, `analyticalThread`, `honestGaps`, `statusNotes`, `scopeDecision`, per-rec `district`/`address`) — a decision requiring the user.
- **The other 22 dropped DC venues** — needs hand citation recovery per D4.
- **Saved-list overlap rendering** (206/179 as of this branch's generator re-run — the count moves with every city ingested, since it's unrendered and unwatched) — blocked on in-situ-save circularity; M3.7's review already tried and could not settle it.
- **The residence entry in git history** (M5b) — needs a history rewrite plus force-push across merged PRs; the user's call.
- **Ratings pass (M6 blocker) and trip-2 attendance reconstruction (D21)** — manual memory passes over the corpus.
- **`comparison.searchToDirectionsRatio` / `uniquePlacesPerCityDay` / `entriesInWindow` / `interlude_NOLA`** — unrendered upstream findings; new reader-facing surface, not a correction.

## Verified during implementation

- **Adding `methodNotes` to `adherence.json` broke `npm run check`** (2 errors) — `colophon/+page.svelte` and `data/+page.svelte` each cast `adherence.comparison` to `Record<string, {...}>` for `.trip1`/`.trip2` lookups, and the new `methodNotes: string[]` sibling key doesn't fit that shape. `comparison` was never actually a homogeneous map (always just `trip1`/`trip2`); fixed both casts to the real named-key shape rather than a `Record`, which is the more correct type either way. `npm run check` — 0 errors after the fix.
- `npm run build` — all pages prerender; `portland-or`, `austin-tx`, `philadelphia-pa` still render non-linked "data pending" with no `href`, checked directly against the built output at `build/index.html`, `build/data.html`, and `build/colophon.html` (SvelteKit's static adapter flattens routes to `<route>.html`, not `<route>/index.html`).
- NOLA's `/data` fragmentation row now carries a mechanism line, styled `trend` (muted rule) — confirmed in the built HTML (`class="mech svelte-1fr7dj4 trend"`).
- Colophon's guide count and rec total read 15 and 769, derived — confirmed in the built HTML.
- No city page renders an orphan fingerprint/favorites heading; confirmed absent (`fp-row` not present at all) on three sampled built city pages. Rest of each page unchanged.
- Rec counts and every `≥N of M` untouched — this branch touches no `recommendations` data (D26).
- `git diff --stat` on the regenerated files confined to the intended one key in `adherence.json`; `fragmentation-notes.json`'s diff is the hand-added entry only, confirmed the generator doesn't touch it.
- A second `node tools/join-takeout.mjs` run is idempotent on `adherence.json` — no further diff.
