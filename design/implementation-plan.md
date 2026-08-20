# Implementation Plan

High-level build plan for the design in [`design.md`](design.md), grouped by milestones. Each milestone gets its own detailed doc when it starts; this doc holds just enough to build accurately from later. Undecided questions that gate milestones are tracked as O-numbers in [`decision-log.md`](decision-log.md#open-questions-undecided).

## Current state (as of design v1, Jul 2026)

Schema frozen · scaffold build-verified · landing page and city template built (all components runes-mode: `ConstellationMap`, `StatStrip`, `Fingerprint`, `Waffle`, `RecommendationList`, `FragmentationBar`, `FieldNotes`, `PopCulture`) · trip chapters, data deep-dive, superlatives, colophon unbuilt or stubs · **all displayed numbers are sample data pending reconstruction** · O1/O2/O3 resolved (D16 public posture, D17 leg-ledger, D18 binary rating); O4/O5 remain open.

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

- Trip-1 retro guides: one city per session using the re-patched 10-category skill (D13). Portland excluded from hit-rate (D2).
- Transcribe remaining trip-2 cities from the existing HTML guides. (Corrected per M0: the trip-2 guides' attended/planned checkboxes were never used, so there is no localStorage to harvest — attended status reconstructs from memory + photos + calendar/ticket emails instead.)
- Birmingham (day-calendar format) and the five other per-city guides in that format still need transcribing — M2 validated the checklist-format path via DC; the day-calendar path was proven usable for citation cross-referencing but not yet transcribed as a primary source.
- NOLA per the M0 finding (existing guide or retro backlog).

Pace: incremental by design — the site is publishable at every stage (D9/D10).

## M4 — Chapter pages ×3

**Leg-ledger per D17** (~1 session), not the full MapLibre scroll-driven panning showpiece — scrollytelling stays a roadmap upgrade path (R15). Interlude chapter (NOLA) gets a lighter treatment (`type` drives layout). Consumes `legs.json`; leg reconstruction from M0 Timeline data feeds this.

## M5 — Data deep-dive page

LayerChart installs here. Content: prices time capsule (`prices.json`), spend, timelines, 18-city fragmentation comparison. Requires prices/spend reconstruction from M0 exports to have landed.

## M6 — Superlatives + colophon

Writing-heavy; save for post-data. Superlatives page renders `superlatives.json` in awards format — superlatives derive from the **binary** would-return rating (D18), so awards are "keepers"-style lists, not numeric rankings. Colophon covers methodology, the retro-guide anachronism disclosure (D2), reconstruction error bars, and the "things I wish I'd captured" wishlist.

## M7 — Photo pipeline

ImageKit folder structure mirroring city IDs, plus the `/serial/{subject}/` tree for the seven serial-photo subjects. Populate `photos` blocks in city JSON and `serial-photos.json`; serial grids render whatever subset exists.
