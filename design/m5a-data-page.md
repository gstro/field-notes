# M5a — The data page, built from what's reconstructed

Per-milestone doc, matching the `m2-`/`m3-`/`m3.5-`/`m3.6-`/`m3.7-` pattern. Turns `/data` from a five-line stub into a real page carrying the analysis that already existed in committed files with nothing rendering it.

**This is a partial M5.** Prices and spend need the M0 card-statement export and are explicitly absent, stated on the page rather than faked (D9/D10 — publishable at every stage). What shipped is M5's "18-city fragmentation comparison" plus the D22 finding.

## What's on the page

**1. What curation changed** — a slope chart of the interest mix, trip 1 → trip 2, sorted by delta. The D22 inversion: books 11→76, museums & history 15→44, record stores 0→24, against coffee 50→31 and film 7→0.

The two trips' category sets **don't align** — trip 1 has `film` and no `records_music`, trip 2 the reverse. The union renders with explicit zeros, because `film 7 → 0` and `records 0 → 24` are the inversion, not gaps to hide.

**2. How closely each list was followed** — per-city `listConversionPct` and `visitsThatWereOnListPct`, grouped by curation method. Both are percentages on one scale; there is no second axis.

**3. The fragmentation gap** — 14 cities sorted by ratio, 8% (Atlanta) to 61% (Albuquerque), each annotated with the mechanism behind it where the guide recorded one. The four cities without population data are shown as *data pending*, not silently omitted.

**The aggregate trap, avoided.** Every headline figure reads `comparison` verbatim from `adherence.json` — 47.4% / 52.5% — never an average over the per-city rows. That is exactly the error caught on the colophon in M3.7 (an unweighted mean gave 46.9 / 51.7), and a cross-city page is where it would have come back. Verified: no `reduce`/mean over `adherence.cities` anywhere in the page or components.

## No charting library (D25)

M5's spec said "LayerChart installs here." **Not done, deliberately.** That line predates the four hand-rolled viz components (`ConstellationMap`, `Fingerprint`, `Waffle`, `FragmentationBar` — 32–65 lines each), and the site has **zero runtime dependencies**. Three charts do not justify the first one against D7 ("free tier forever, portable, nothing to maintain") and R13. The three new components follow the existing hand-rolled pattern; `package.json` still has no `dependencies` block.

## A validated colour finding — and a fix beyond this chunk's plan

Running the palette validator (rather than eyeballing) surfaced a real defect in the **existing** visual system:

```
#D4A843 (--gold) ↔ #E8722A (--burnt-light)
  normal vision ΔE 12.5  → FAIL (below the 15 floor)
  deuteranopia  ΔE  6.9  → WARN

#D4A843 (--gold) ↔ #C85A00 (--burnt)
  normal vision ΔE 18.4  → PASS
  deuteranopia  ΔE 15.3  → PASS
```

`--gold` against `--burnt-light` is the site's **trip-1 vs trip-2** convention, and it was carrying the two route lines on the landing constellation map — the pair that most needs distinguishing, since the routes cross the same space. Both colours are D14's; only which orange is used changes.

**Fixed on the map, its legend swatch, and the anchor dot**, so the new charts don't introduce a convention that contradicts the hero visualisation. This is beyond the letter of the chunk's plan — but the alternative was either shipping failing charts or leaving the site with two different trip-2 colours. Contrast against the real page background (`#111009`) re-checked at ≥3:1.

## `population.note` → annotations (closes M3.7's deferral)

M3.7 stored `population.note` (D23) but rendered nothing, deferring the editorial pass. An unannotated fragmentation chart is meaningless — the spread looks arbitrary without knowing *why* Atlanta is 8% and Oklahoma City is 48% — so the pass happened here.

Extractions live in `src/lib/data/fragmentation-notes.json`, **each beside its verbatim `sourceNote`** so the trimming stays auditable — the same principle as `city-overrides.json` carrying a `reason`.

**Extraction rule:** keep the factual municipal-history or population-trend clause; drop census-vintage provenance and every reference to the guide's own authoring decisions (`fragmentationRatio left null…`, `consistent with the caveat practice established in the … JSON files`, `flagged as a possible Field Notes follow-up`). No fact added, sharpened, or reworded beyond compression.

The 14 notes split three ways — a more accurate breakdown than M3.7's rough "10 substantive":

| kind | n | cities |
|---|---|---|
| **mechanism** — a structural reason for the ratio | 6 | Atlanta (cityhood movement) · Oklahoma City (annexed to ~620 sq mi) · Washington DC (cannot annex; no county government) · Dallas (polycentric; Fort Worth/Arlington/Plano independent) · Las Vegas (the Strip is unincorporated Clark County) · Richmond (Virginia independent-city structure) |
| **trend** — a trajectory qualifying how to read it | 4 | Jackson (decline amid the water crisis) · Charlotte (fastest-growing) · Birmingham (declining base) · Shreveport (down from a 2010 peak) |
| **none** — census provenance only, no annotation rendered | 4 | Albuquerque · Boise · Phoenix · Salt Lake City |

Mechanisms and trends are marked differently on the page (gold rule vs muted) — a structural explanation and a population trajectory are different claims and shouldn't read as the same one.

## Verified during implementation

- `npm run check` — 0 errors, 194 files. `npm run build` — `/data` prerenders, landing teaser resolves.
- **All 14 fragmentation percentages** cross-checked against the city JSON: no mismatches. **All eight interest-mix pairs** verified against source, including both explicit zeros.
- **No source note leaks**: none of the 14 verbatim `sourceNote` strings appears on the page. Every figure inside an annotation is present in its own source.
- Headline figures are 47.4% / 52.5%, read verbatim from `comparison`.
- Zero runtime dependencies; no motion anywhere on the page (D15 satisfied trivially).
- Caught in the rendered output: the adherence chart was showing `Okla. City` (cityIndex's map-label abbreviation) — the same defect class as M3.6's `<h1>` finding. Now prefers the city file's name. Percentages fixed to 1dp so a tabular column doesn't mix `46%` with `68.4%`.

## Deferred

- **Prices and spend** — M0 card-statement export.
- **Driving distances and times** — M0 routing pull; no GPS traces exist.
- **M4 leg ledger**, the other 22 dropped DC venues, the saved-list overlap render (blocked on circularity), the colophon wishlist, NOLA's guide, and M6 superlatives (ratings empty dataset-wide).
