# Implementation Plan

High-level build plan for the design in [`design.md`](design.md), grouped by milestones. Each milestone gets its own detailed doc when it starts; this doc holds just enough to build accurately from later. Undecided questions that gate milestones are tracked as O-numbers in [`decision-log.md`](decision-log.md#open-questions-undecided).

## Current state (as of M1.1 site-quality pass, Sep 2026)

Schema frozen · scaffold build-verified · landing page and city template built (all components runes-mode: `ConstellationMap`, `StatStrip`, `Fingerprint`, `Waffle`, `RecommendationList`, `FragmentationBar`, `FieldNotes`, `PopCulture`) · **colophon and data page built** ([M3.7](m37-colophon.md), [M5a](m5a-data-page.md)); city pages now also render where the days actually went ([M5b](m5b-visited-places.md)); **three chapter pages built** ([M4a](m4a-chapter-pages.md)); superlatives still a stub · **15 of 18 cities built** (`portland-or`, `austin-tx`, `philadelphia-pa` — origin, anchor, home — remain "data pending"; New Orleans ingested [`0c2e074`](https://github.com/gstro/field-notes/commit/0c2e074), seam closed in [M5c](m5c-deferred-threads.md)) — recommendation content is real (transcribed from `guides/*-guide.json`) · **the thesis is self- vs sourced curation (D22), not instinct vs curation** · per-city visit data is a **confirmed floor** (50 recs / 44 venues from the Takeout join across 787 recommendations) with the authoritative curation-adherence rates rendered verbatim from `perCityAdherence`, never re-derived; **no surface renders an unmeasured number** (M3.6: DC regenerated from its guide, all dummy statuses/ratings/placeholder strings gone; unsourced landing figures marked "not yet reconstructed") · `rating` is now **empty dataset-wide**, which blocks M6 — see below · all whole-city qualitative fields (`vibeWord`, `fingerprint`, `favorites`, `fieldNotes`, `wouldILiveHere`) are still empty/null (the city-page panels for the empty ones are now guarded rather than rendering orphan headings, per M5c) · O1/O2/O3/O6 resolved (D16 public posture, D17 leg-ledger, D18 binary rating, D22 curation framing); O4/O5 remain open.

## Milestone overview

| Milestone | Deliverable | Gated by |
|---|---|---|
| M0 | Data rescue (time-sensitive exports) | Nothing — do first |
| M1 | Deploy v2 + mobile template pass | — |
| M2 | First real city transcribed (schema reality-check) | Unblocked — O2 resolved (D16, public) |
| M3 | Trip-1 retro guides + trip-2 transcription | M2 learnings; skill re-patch (done) |
| M4 | Chapter pages ×3 | Leg-ledger per D17 (scrollytelling is a roadmap upgrade) |
| M5 | Data deep-dive page | Prices/spend reconstruction from M0 data |
| M6 | Superlatives + colophon | Binary rating per D18; most data landed |
| M7 | Photo pipeline | ImageKit account setup |

---

## M0 — Data rescue

Source-availability corrections (Jul 2026 — two perishable items resolved themselves):

- ~~Harvest localStorage from the trip-2 guides~~ **N/A** — the attended-vs-planned checkboxes were never used, so there is no localStorage state to recover. Attended status reconstructs from memory + photos (EXIF for city/date) + calendar/ticket emails. That is now the guide-attendance source of record; its lower precision is a colophon error-bar item (D2/M6) and an explicit caveat on the `attended-anyway` instinct-vs-curation metric (D3) — every attended/skipped call is a 2026 judgement, not a logged-at-the-time record.
- ~~Google Maps Timeline export~~ **N/A** — Timeline was disabled before the trip. Routes/mileage reconstruct from **Google Takeout search history (incl. Maps searches)** plus retroactive Google Maps routing for canonical per-leg mileage; drive *times* are approximate (search timestamps bound departure/arrival windows — no GPS breadcrumbs).
- **Spotify extended streaming history** — **in hand.** Feeds leg soundtracks; no longer blocking.

Remaining pulls:

1. ~~Export **Google Takeout** — search + Maps history.~~ **Done** — landed `4ba5101`, consumed by `tools/join-takeout.mjs` (M3.5). What's still outstanding for M4's `legs.json` is the *retroactive Google Maps routing* for per-leg mileage — the Takeout export alone bounds search windows, not distances.
2. Export **card statements** Oct 2025 – Jun 2026 as CSV. Spend-by-city join is mechanical (dates are exact). **Still outstanding** — the only genuinely unresolved M0 pull.
3. ~~**Confirm NOLA guide existence.**~~ **Resolved** — guide generated and ingested (`0c2e074`, Sep 2026).

Reconstruction feasibility reference (E = exists, R = reconstructable, U = likely unrecoverable):

| Domain | Highlights |
|---|---|
| Route & driving | Dates E · miles R (retroactive Maps routing) · drive times approximate (search-history timestamps, no GPS) · Timeline N/A (disabled pre-trip) · gas prices U unless receipts/photos · elevation R (public APIs at build time) |
| Spend | Per-category R (card CSV × date ranges) · lodging R (booking emails) |
| Guides | Trip-2 guides E (HTML) · attended status R via memory + photos + calendar/tickets (checkboxes unused → no localStorage record) · trip-1 guides do not exist (hence retro guides) |
| Media | Photos + EXIF E (city assignment for free) · serial series partial — audit against the 7-subject list, accept gaps |
| Calendar | DC itinerary E (25 events on Curated Events calendar) · other cities partial via calendar search + ticket emails |

## M1 — Deploy v2 + template corrections — done

Deploy the current scaffold to Vercel; review the Birmingham sample template on mobile; run a corrections pass on whatever the review surfaces. `setup/roadtrip/vercel.json` confirms the deploy config landed. **The mobile pass is now verified** ([M1.1](m11-site-quality.md)): six routes × three viewports measured over the DevTools protocol, zero horizontal overflow — no longer a hedge.

## M1.1 — Site-quality pass — done

The first chunk to treat the site as a site rather than as data. **Per-route payload cut ~72–75%** (landing 142 → 35 KB gzipped) by giving the aggregate pages a derived `citySummary.json` instead of globbing the whole corpus, and splitting `/city/[slug]` into per-city chunks — every visitor had been downloading all 787 recommendations to read a headline. Rebuilt the `/superlatives` stub on the design system so it states why it is empty instead of promising a file that does not exist. **Two reported defects turned out not to exist** — a D15 reduced-motion violation and a mobile overflow, both "confirmed" from screenshots and both disproved by measurement. Rendered text is byte-identical to the prior build on every page but `/superlatives`. Full findings: [`m11-site-quality.md`](m11-site-quality.md).

## M2 — First real city (schema reality-check) — done, superseded

Transcribed Washington DC end to end from `dc-city-guide.html` (the 9-category checklist format) joined with `washington-dc.html` (its 7-day calendar companion). DC was chosen over Birmingham once reconnaissance showed `guides/` (then `Itineraries/`) holds two different guide formats and Birmingham's is the day-calendar kind, populating only 2 of 10 categories — DC has both formats and validates the taxonomy the schema was built around. Findings, schema amendments (D19 per-citation URLs, D20 spend field), and the dummy-status review checklist are in [`m2-first-city.md`](m2-first-city.md). Birmingham's sample JSON stayed in place, migrated only to the new citation shape, pending real transcription in M3.

**Superseded by M3.6:** DC's hand-transcribed page (two provenances, invented statuses/ratings) was later regenerated from its guide like every other city; only the 14 venues its guide doesn't cover survive as additive overrides (D24).

## M3 — Guide + city data buildout

- ~~Trip-1 retro guides: one city per session using the re-patched 10-category skill (D13).~~ **Done** — all 7 non-Portland trip-1 cities generated in bulk (`guides/*-guide.json`, Aug 2026). Portland stays excluded from hit-rate (D2).
- ~~Transcribe remaining trip-2 cities~~ **Done for content** — 6 trip-2 cities (shreveport, jackson, birmingham, atlanta, charlotte, richmond) ingested via [`tools/ingest-guides.mjs`](../tools/ingest-guides.mjs); DC preserved from M2. Statuses are provisional (D21) — the checkbox/localStorage gap from M0 still means real attendance reconstructs from memory + photos + calendar/ticket emails, not yet done.
- ~~Birmingham (day-calendar format)~~ **Done** — Birmingham's sample JSON, explicitly pending reconstruction per CLAUDE.md, is now real transcribed content from `guides/birmingham-guide.json`.
- ~~NOLA per the M0 finding: still backlogged, no guide exists.~~ **Done** — guide generated and ingested ([`0c2e074`](https://github.com/gstro/field-notes/commit/0c2e074), Sep 2026); 15th city built, seam closed in [M5c](m5c-deferred-threads.md).
- **Follow-up, not yet done:** the two-DC-sources reconciliation and schema proposals for the unmapped guide fields — both detailed in [m3-guide-ingest.md](m3-guide-ingest.md).

Pace: incremental by design — the site is publishable at every stage (D9/D10).

## M3.5 — Headline metric + curation framing — done

Fixed the `0 / N` defect M3 shipped: settled O6 as [D22](decision-log.md#d22-self-curation-vs-sourced-curation-supersedes-the-instinct-framing) (self- vs sourced curation), redefined D3's trip-1 statuses as provenance rather than outcome claims, and landed the Google Takeout join (`tools/join-takeout.mjs`) supplying a confirmed-visit floor plus per-city adherence rates. The hit-rate and thesis questions now render as separate panels from separate sources. Full findings, matcher rationale, and method caveats: [`m35-headline-metric.md`](m35-headline-metric.md).

Still open from it: rendering the saved-list overlap (206 recs / 179 venues as of the 15-city corpus — computed and documented, pending review; moves with each city ingested since it's unrendered and no one is watching it). ~~Folding the Greensboro off-guide discovery into M4's leg data~~ — **done**, shipped on the `south` chapter page in [M4a](m4a-chapter-pages.md).

## M4a — Chapter pages — done

The three-chapter arc finally has pages. Also pre-wired New Orleans's pipeline slot ahead of its guide — four mapping entries plus three real bugs that would have surfaced on arrival, including `isRetro` deriving from `tripId` rather than the data. Proven with a throwaway stub guide, then discarded. Full findings: [`m4a-chapter-pages.md`](m4a-chapter-pages.md).

## M5b — Where the days actually went — done

Renders `topPlaces` for the first time: the most-navigated places per city, tagged three ways — 42 on the sourced guide, 85 on the self-made list, 23 found on the ground. Published guides account for the smallest share of actual navigation, sharpening D22. Kept deliberately out of `recommendations` so the hit-rate denominator stays honest ([D26](decision-log.md#d26-visited-places-are-their-own-surface-never-recommendations)); rec counts and every `≥N of M` are byte-identical to before.

Also removed one residence entry that had survived the export's own sanitization pass. **Outstanding: it remains in git history on a public repo** — scrubbing needs a force-push across merged PRs and is the user's call. Full findings: [`m5b-visited-places.md`](m5b-visited-places.md).

## M5f — The dropped DC venues, verified — done

Closes the thread carried since M3.6. Of the 22 DC venues M2 transcribed and M3.6 dropped for having an empty placeholder citation, **18 are restored** with a named, checked source each; **4 are excluded for cause** — three because the note's rationale rests on a wrong neighbourhood (Petite Cerise, Saku Saku, Harper Macaw) and one as a true duplicate of a guide entry (Capital City Mambo Sauce). Verifying them turned into an audit of the M2 transcription: **6 of 22 carry a factually wrong neighbourhood**, three of which were correctable in the name. Also rejected the obvious M5e follow-on as [R19](rejection-log.md). **Flagged, not settled: DC is now 87 recs against a next-largest of 53** — close to the ~92 union M3.6 rejected; reversal is one file. Full findings: [`m5f-dc-restorations.md`](m5f-dc-restorations.md).

## M5e — What the guide was made of — done

Renders the guides' 8-value cross-cutting interest axis for the first time — carried on 765 of 787 recommendations (749 of 769 when M5e shipped) since M3, referenced in three docs, displayed nowhere. Per city, sorted, within-city shares only: tagging density varies too much between guides (OKC 2.27 tags per tagged rec against Boise's 1.12) for raw counts to be comparable across cities, so no cross-city ranking is offered. Food and DIY are a constant floor; the differentiator is the third slot — political history in DC/Jackson/New Orleans, horror in Richmond/Albuquerque, punk across the west. Also closes the schema hole M3 named: `interestTags` is now a typed union with labels in `registry.ts`, verified to fail `check` on an out-of-vocabulary value. Full findings: [`m5e-interest-composition.md`](m5e-interest-composition.md).

## M5d — What curation displaced — done

Renders the last unconsumed result in the analysis corpus: on-ground searching fell 1.19 → 0.99 searches per direction request (−16.8%) while distinct places per city-day held near flat at 5.4 → 5.2. The flat second measure is what makes the first meaningful — the same ground covered with materially less looking around. Deliberately a stat row rather than a fourth chart (four numbers; and the two measures are different scales, so one plot would mean a dual axis). Also carries `windowAnalyzed`/`entriesInWindow` so the page's provenance line is rendered rather than typed. Every field in the corpus's `comparison` object is now either rendered or has a recorded reason not to be. Full findings, including a flexbox bug that silently broke the shared axis: [`m5d-improvisation-finding.md`](m5d-improvisation-finding.md).

## M5c — Close deferred threads — done

Closed the seam the NOLA ingest left open: New Orleans's `/data` fragmentation annotation (`fragmentation-notes.json`, dropped since the extraction pass in M5a predates NOLA), the colophon's typed-in `14` guide count (now derived, matching D27), and several stale "14 cities" comments across the codebase. Also fixed a rendering defect that predates NOLA — the city page's Fingerprint/Favorites headings rendered with no guard, so every one of the 15 cities showed two empty panel labels; both now hide until their data lands. Extended `tools/join-takeout.mjs` to carry `comparison.methodNotes` into `adherence.json`, though found on investigation that the colophon already states those caveats in its own prose — no duplicate added. Full findings: [`m5c-deferred-threads.md`](m5c-deferred-threads.md).

## M5a — The data page — done

`/data` turned from a stub into a real page: the D22 curation inversion, per-city adherence, and the 14-city fragmentation comparison annotated with each city's boundary mechanism (closing M3.7's `population.note` editorial-pass deferral). Charts hand-rolled, zero new dependencies ([D25](decision-log.md#d25-hand-rolled-charts-no-charting-dependency)). Running the palette validator also caught a real defect in the existing visual system — `--gold` vs `--burnt-light` separated by only ΔE 12.5 in normal vision, on the landing map's two route lines — now fixed to `--burnt`. Full findings: [`m5a-data-page.md`](m5a-data-page.md).

## M3.7 — Deferred threads + colophon — done

The **colophon ships** (`/colophon`, linked from the landing page) — methodology, error bars, what is not reconstructed, and a neutral revisions log, with every figure derived from committed data at build time rather than typed in. `population.note` is carried for all 14 cities but deliberately not rendered (D23). The deferred saved-list review was carried out: it found one false positive (`Boise Co-op` ← `Boise Whitewater Park`), corrected the count to 189/163, and confirmed that **rendering stays blocked on the in-situ-save circularity, which review cannot settle**. Fourteen cited DC venues restored via a new additive-overrides mechanism (D24); DC now at 69 recs with its floor up from 2 to 4. Full findings: [`m37-colophon.md`](m37-colophon.md).

Still open from it: ~~the `population.note` editorial pass~~ — **done**, shipped in [M5a](m5a-data-page.md) as `fragmentation-notes.json` for the 14 cities then built, with New Orleans's entry added once it landed ([M5c](m5c-deferred-threads.md)); the colophon wishlist (the user's to write); and ~~the other 22 dropped DC venues~~ — **closed in [M5f](m5f-dc-restorations.md)**: 18 restored with verified citations, 4 excluded for cause.

## M3.6 — Purge the last invented data — done

DC regenerated from its guide (ending the two-provenance split and its dummy statuses/ratings/`DUMMY-` placeholder strings), landing StatStrip's three unsourced figures marked `not yet reconstructed`, and `data/city-overrides.json` added so reviewed corrections — starting with DC's rejected `elevationFt: 25` — survive regeneration. **No surface on the site now asserts an unmeasured number.** Full findings, including the 37 M2-only DC venues dropped and the discarded `population.note` D8 caveat: [`m36-purge-invented-data.md`](m36-purge-invented-data.md).

## M4 — Chapter pages ×3 — **partially shipped ([M4a](m4a-chapter-pages.md))**

**Shipped:** `/chapter/west`, `/chapter/nola`, `/chapter/south` — the route as an ordered stop list, chapter rollups, the curation identity, the interest mix (read verbatim per [D27](decision-log.md#d27-chapter-aggregates-name-what-they-count-and-are-never-re-derived)), per-city adherence, visited places, and the Greensboro side trip. Interlude gets the lighter `type`-driven treatment (D1). NOLA's pipeline slot is pre-wired, so its guide drops in with two commands.

**Still gated on M0:** the leg-ledger itself (D17) — per-leg distances and drive times need the routing pull; tracking was off during the trips so no GPS traces exist. Scrollytelling stays a roadmap upgrade path (R15). Each chapter page states the ledger's absence.

## M5 — Data deep-dive page — **partially shipped ([M5a](m5a-data-page.md))**

**Shipped:** `/data` is a real page carrying the fragmentation comparison (15 of 18 cities, annotated with each city's boundary mechanism or population trend — New Orleans's annotation added in [M5c](m5c-deferred-threads.md)), the D22 curation inversion, what curation displaced ([M5d](m5d-improvisation-finding.md)), and per-city adherence. Charts are hand-rolled, **not LayerChart** — see [D25](decision-log.md#d25-hand-rolled-charts-no-charting-dependency), which supersedes that part of this milestone's original spec.

**Still gated on M0:** prices time capsule (`prices.json`), spend by city, and driving timelines. All three are stated as absent on the page rather than faked.

## M6 — Superlatives + colophon — **blocked on ratings**

Writing-heavy; save for post-data. Superlatives page renders `superlatives.json` in awards format — superlatives derive from the **binary** would-return rating (D18), so awards are "keepers"-style lists, not numeric rankings. Colophon covers methodology, the retro-guide anachronism disclosure (D2/D22), reconstruction error bars, and the "things I wish I'd captured" wishlist.

**Colophon half shipped in [M3.7](m37-colophon.md)**; the superlatives half remains blocked.

**Blocker (M3.6):** `rating` is empty across all 787 recommendations — DC's 39 were the only populated ones, and they were invented. No export contains would-return signals; capturing them is a manual memory pass over the full corpus, the same class of work as trip-2 attendance reconstruction. **The superlatives page cannot be built until that happens**; the colophon half is unblocked and could ship first.

## M7 — Photo pipeline

ImageKit folder structure mirroring city IDs, plus the `/serial/{subject}/` tree for the seven serial-photo subjects. Populate `photos` blocks in city JSON and `serial-photos.json`; serial grids render whatever subset exists.
