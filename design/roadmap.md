# Roadmap (unendorsed)

Potential features that have been floated but **not endorsed**. Nothing here is committed work — endorsed work lives in [`implementation-plan.md`](implementation-plan.md), and endorsing an item here means moving it there (usually via a decision in [`decision-log.md`](decision-log.md)).

| Idea | What it would be | What endorsement depends on |
|---|---|---|
| Leg-ledger → scrollytelling upgrade | The live upgrade path: replace the shipped leg-ledger (D17) with full MapLibre scroll-driven panning route map (~2–3 sessions) | Leg-ledger shipping first (M4); appetite after seeing it with real leg data ([R15](rejection-log.md#r15-full-scrollytelling-as-the-initial-chapter-build)) |
| Elevation profile per leg | Chart of `elevationStartFt`/`elevationEndFt` (or full profiles from public elevation APIs at build time) on chapter pages | Whether the West's descent story earns the space; slots into either ledger or scrollytelling |
| Leg soundtrack modules | Per-leg album/podcast display from Spotify extended history | Spotify export actually arriving and being joinable per leg |
| `detours` field on legs | Stop-level detail explaining stretched drive times (e.g., OKC→Dallas at 7:49) | Open question O5 — decide during leg reconstruction |
| 1–5 recommendation ratings | Upgrade the shipped binary `rating` (D18) to a 1–5 scale, enabling ranked/numeric superlatives | Appetite for finer superlatives; accepting the per-rec scoring burden + calibration drift ([R16](rejection-log.md#r16-15-rating-scale)) |
| Trip-3 slot activation | A future trip added to the `trips.json` array | An actual trip 3; the slot exists structurally but is explicitly not being built for ([R4](rejection-log.md#r4-supporting-other-peoples-trips)) |
| Gas-stop ledger | `gasStops` (location, price/gal, receipt photo) surfaced as a feature rather than raw data | Prices being recoverable at all — audit rates them U without receipts/photos |
| Day/slot itinerary view | Surface the per-city guides' day-by-day, work-slot-tagged structure (`days[].activities[].slot`) as its own module, rather than flattening it into the flat `recommendations` list | Nothing currently renders this dimension of the source data; would need a design decision on whether the site wants a literal-itinerary view alongside the category-grouped one (M2 finding, Aug 2026) |
