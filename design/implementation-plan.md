# Implementation Plan

High-level build plan for the design in [`design.md`](design.md), grouped by milestones. Each milestone gets its own detailed doc when it starts; this doc holds just enough to build accurately from later. Undecided questions that gate milestones are tracked as O-numbers in [`decision-log.md`](decision-log.md#open-questions-undecided).

## Current state (as of M5a data page, Aug 2026)

Schema frozen · scaffold build-verified · landing page and city template built (all components runes-mode: `ConstellationMap`, `StatStrip`, `Fingerprint`, `Waffle`, `RecommendationList`, `FragmentationBar`, `FieldNotes`, `PopCulture`) · **colophon and data page built** ([M3.7](m37-colophon.md), [M5a](m5a-data-page.md)); trip chapters and superlatives unbuilt or stubs · **14 of 18 cities built** (`portland-or`, `austin-tx`, `new-orleans-la`, `philadelphia-pa` remain "data pending") — recommendation content is real (transcribed from `guides/*-guide.json`) · **the thesis is self- vs sourced curation (D22), not instinct vs curation** · per-city visit data is a **confirmed floor** (50 recs / 44 venues from the Takeout join across 719 recommendations) with the authoritative curation-adherence rates rendered verbatim from `perCityAdherence`, never re-derived; **no surface renders an unmeasured number** (M3.6: DC regenerated from its guide, all dummy statuses/ratings/placeholder strings gone; unsourced landing figures marked "not yet reconstructed") · `rating` is now **empty dataset-wide**, which blocks M6 — see below · all whole-city qualitative fields (`vibeWord`, `fingerprint`, `favorites`, `fieldNotes`, `wouldILiveHere`) are still empty/null · O1/O2/O3/O6 resolved (D16 public posture, D17 leg-ledger, D18 binary rating, D22 curation framing); O4/O5 remain open.

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

1. Export **Google Takeout** — search + Maps history. This is the leg-reconstruction source now that Timeline is gone (feeds M4 `legs.json`).
2. Export **card statements** Oct 2025 – Jun 2026 as CSV. Spend-by-city join is mechanical (dates are exact).
3. **Confirm NOLA guide existence.** If absent, NOLA joins the trip-1 retro-guide backlog (M3).

Reconstruction feasibility reference (E = exists, R = reconstructable, U = likely unrecoverable):

| Domain | Highlights |
|---|---|
| Route & driving | Dates E · miles R (retroactive Maps routing) · drive times approximate (search-history timestamps, no GPS) · Timeline N/A (disabled pre-trip) · gas prices U unless receipts/photos · elevation R (public APIs at build time) |
| Spend | Per-category R (card CSV × date ranges) · lodging R (booking emails) |
| Guides | Trip-2 guides E (HTML) · attended status R via memory + photos + calendar/tickets (checkboxes unused → no localStorage record) · trip-1 guides do not exist (hence retro guides) |
| Media | Photos + EXIF E (city assignment for free) · serial series partial — audit against the 7-subject list, accept gaps |
| Calendar | DC itinerary E (25 events on Curated Events calendar) · other cities partial via calendar search + ticket emails |

## M1 — Deploy v2 + template corrections

Deploy the current scaffold to Vercel; review the Birmingham sample template on mobile; run a corrections pass on whatever the review surfaces. Small, unblocks continuous deploys for everything after.

## M2 — First real city (schema reality-check) — in progress

Transcribed Washington DC end to end from `dc-city-guide.html` (the 9-category checklist format) joined with `washington-dc.html` (its 7-day calendar companion). DC was chosen over Birmingham once reconnaissance showed `Itineraries/` holds two different guide formats and Birmingham's is the day-calendar kind, populating only 2 of 10 categories — DC has both formats and validates the taxonomy the schema was built around. Findings, schema amendments (D19 per-citation URLs, D20 spend field), and the dummy-status review checklist are in [`m2-first-city.md`](m2-first-city.md). Birmingham's sample JSON stays in place, migrated only to the new citation shape, pending real transcription in M3.

## M3 — Guide + city data buildout

- ~~Trip-1 retro guides: one city per session using the re-patched 10-category skill (D13).~~ **Done** — all 7 non-Portland trip-1 cities generated in bulk (`guides/*-guide.json`, Aug 2026). Portland stays excluded from hit-rate (D2).
- ~~Transcribe remaining trip-2 cities~~ **Done for content** — 6 trip-2 cities (shreveport, jackson, birmingham, atlanta, charlotte, richmond) ingested via [`tools/ingest-guides.mjs`](../tools/ingest-guides.mjs); DC preserved from M2. Statuses are provisional (D21) — the checkbox/localStorage gap from M0 still means real attendance reconstructs from memory + photos + calendar/ticket emails, not yet done.
- ~~Birmingham (day-calendar format)~~ **Done** — Birmingham's sample JSON, explicitly pending reconstruction per CLAUDE.md, is now real transcribed content from `guides/birmingham-guide.json`.
- NOLA per the M0 finding: still backlogged, no guide exists.
- **Follow-up, not yet done:** the two-DC-sources reconciliation and schema proposals for the unmapped guide fields — both detailed in [m3-guide-ingest.md](m3-guide-ingest.md).

Pace: incremental by design — the site is publishable at every stage (D9/D10).

## M3.5 — Headline metric + curation framing — done

Fixed the `0 / N` defect M3 shipped: settled O6 as [D22](decision-log.md#d22-self-curation-vs-sourced-curation-supersedes-the-instinct-framing) (self- vs sourced curation), redefined D3's trip-1 statuses as provenance rather than outcome claims, and landed the Google Takeout join (`tools/join-takeout.mjs`) supplying a confirmed-visit floor plus per-city adherence rates. The hit-rate and thesis questions now render as separate panels from separate sources. Full findings, matcher rationale, and method caveats: [`m35-headline-metric.md`](m35-headline-metric.md).

Still open from it: rendering the saved-list overlap (190 recs / 164 venues, computed and documented, pending review) and folding the Greensboro off-guide discovery into M4's leg data.

## M5a — The data page — done

`/data` turned from a stub into a real page: the D22 curation inversion, per-city adherence, and the 14-city fragmentation comparison annotated with each city's boundary mechanism (closing M3.7's `population.note` editorial-pass deferral). Charts hand-rolled, zero new dependencies ([D25](decision-log.md#d25-hand-rolled-charts-no-charting-dependency)). Running the palette validator also caught a real defect in the existing visual system — `--gold` vs `--burnt-light` separated by only ΔE 12.5 in normal vision, on the landing map's two route lines — now fixed to `--burnt`. Full findings: [`m5a-data-page.md`](m5a-data-page.md).

## M3.7 — Deferred threads + colophon — done

The **colophon ships** (`/colophon`, linked from the landing page) — methodology, error bars, what is not reconstructed, and a neutral revisions log, with every figure derived from committed data at build time rather than typed in. `population.note` is carried for all 14 cities but deliberately not rendered (D23). The deferred saved-list review was carried out: it found one false positive (`Boise Co-op` ← `Boise Whitewater Park`), corrected the count to 189/163, and confirmed that **rendering stays blocked on the in-situ-save circularity, which review cannot settle**. Fourteen cited DC venues restored via a new additive-overrides mechanism (D24); DC now at 69 recs with its floor up from 2 to 4. Full findings: [`m37-colophon.md`](m37-colophon.md).

Still open from it: the `population.note` editorial pass, the colophon wishlist (the user's to write), and the other 22 dropped DC venues.

## M3.6 — Purge the last invented data — done

DC regenerated from its guide (ending the two-provenance split and its dummy statuses/ratings/`DUMMY-` placeholder strings), landing StatStrip's three unsourced figures marked `not yet reconstructed`, and `data/city-overrides.json` added so reviewed corrections — starting with DC's rejected `elevationFt: 25` — survive regeneration. **No surface on the site now asserts an unmeasured number.** Full findings, including the 37 M2-only DC venues dropped and the discarded `population.note` D8 caveat: [`m36-purge-invented-data.md`](m36-purge-invented-data.md).

## M4 — Chapter pages ×3

**Leg-ledger per D17** (~1 session), not the full MapLibre scroll-driven panning showpiece — scrollytelling stays a roadmap upgrade path (R15). Interlude chapter (NOLA) gets a lighter treatment (`type` drives layout). Consumes `legs.json`; leg reconstruction from M0 Timeline data feeds this.

## M5 — Data deep-dive page — **partially shipped ([M5a](m5a-data-page.md))**

**Shipped:** `/data` is a real page carrying the fragmentation comparison (14 of 18 cities, annotated with each city's boundary mechanism), the D22 curation inversion, and per-city adherence. Charts are hand-rolled, **not LayerChart** — see [D25](decision-log.md#d25-hand-rolled-charts-no-charting-dependency), which supersedes that part of this milestone's original spec.

**Still gated on M0:** prices time capsule (`prices.json`), spend by city, and driving timelines. All three are stated as absent on the page rather than faked.

## M6 — Superlatives + colophon — **blocked on ratings**

Writing-heavy; save for post-data. Superlatives page renders `superlatives.json` in awards format — superlatives derive from the **binary** would-return rating (D18), so awards are "keepers"-style lists, not numeric rankings. Colophon covers methodology, the retro-guide anachronism disclosure (D2/D22), reconstruction error bars, and the "things I wish I'd captured" wishlist.

**Colophon half shipped in [M3.7](m37-colophon.md)**; the superlatives half remains blocked.

**Blocker (M3.6):** `rating` is empty across all 719 recommendations — DC's 39 were the only populated ones, and they were invented. No export contains would-return signals; capturing them is a manual memory pass over the full corpus, the same class of work as trip-2 attendance reconstruction. **The superlatives page cannot be built until that happens**; the colophon half is unblocked and could ship first.

## M7 — Photo pipeline

ImageKit folder structure mirroring city IDs, plus the `/serial/{subject}/` tree for the seven serial-photo subjects. Populate `photos` blocks in city JSON and `serial-photos.json`; serial grids render whatever subset exists.
