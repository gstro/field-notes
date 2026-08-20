# Road Trip Site — Setup & Deployment Guide

**What you have:** `roadtrip-starter.zip` — a working, build-verified SvelteKit project. Every step below was executed and tested on Jul 6, 2026 against these versions: SvelteKit 2.63 · Svelte 5.56 · Vite 8.0 · adapter-static 3.0 · Node 22. The starter already contains the design tokens, fonts, schema-shaped data files, TypeScript types (including the trip-1 `attended-anyway` / `retroactive-recommendation` statuses and the `citedFrom` source enum), a prerendered dynamic city route, and placeholder pages ready to receive the mockup ports.

**Three gotchas discovered during the test build — already fixed in the starter, but know them:**

1. **`svelte.config.js` is dead in the current template.** SvelteKit config (including the adapter) now lives inside the `sveltekit()` plugin options in `vite.config.ts`. Most tutorials online still show the old file; if you follow one, your adapter silently won't apply.
2. **The prerender crawler fails the build on any broken link** — including a missing favicon and, more importantly, links to city pages whose JSON doesn't exist yet. The landing page therefore only links cities that have data files; the rest render as "data pending." As you add each city JSON, its page and link appear automatically. No config, no route changes.
3. **Svelte 5 runes mode is forced on** in this template (`let { data } = $props()`, not `export let data`). Any Svelte 4 example code you copy will fail. The placeholder pages in the starter are correct runes-mode references.

---

## Part 1 — Local setup (~10 min)

**Prerequisites:** Node 20+ (`node -v` to check; install via [nodejs.org](https://nodejs.org) or `brew install node`), git, a GitHub account.

```bash
# 1. Unzip and enter
unzip roadtrip-starter.zip && cd roadtrip

# 2. Install dependencies (node_modules was stripped from the zip)
npm install

# 3. Verify the build works on your machine
npm run build
# Expect: "Using @sveltejs/adapter-static / Wrote site to build"

# 4. Run the dev server
npm run dev -- --open
```

You should see the placeholder landing page: three chapters, Birmingham as the only live link, 17 cities pending. Click through to Birmingham to see the sample data render (14/50 stat comes from the one sample recommendation — it computes `attended / total` live from the JSON).

## Part 2 — GitHub (~5 min)

```bash
git init && git add -A && git commit -m "Scaffold: verified SvelteKit static build"
```

Create a **private** repo at github.com/new (no README/gitignore — the starter has both), then:

```bash
git remote add origin git@github.com:YOURUSER/roadtrip.git
git branch -M main
git push -u origin main
```

## Part 3 — Vercel (~5 min)

1. vercel.com → sign in **with GitHub** (this wires up auto-deploys with zero config).
2. **Add New → Project** → import the `roadtrip` repo.
3. Vercel auto-detects SvelteKit. Change nothing. **Deploy.**
4. ~60 seconds later you have a live URL. Every `git push` to `main` now redeploys automatically; PRs get preview URLs.

**Free-tier posture:** Hobby plan, non-commercial (this qualifies), 100GB bandwidth/mo — a static personal site will use a rounding error of that. The static adapter means zero serverless function invocations, so there's genuinely nothing to hit a limit on.

## Part 4 — ImageKit (~15 min, do when photos are ready)

1. Free account at imagekit.io → note your **URL endpoint** (`https://ik.imagekit.io/YOUR_ID`).
2. Media library → one folder per city (`/birmingham-al/`, etc.) matching city IDs exactly — the `photos` fields in city JSON store paths relative to the endpoint.
3. Delivery pattern in components:
   `https://ik.imagekit.io/YOUR_ID/birmingham-al/hero.jpg?tr=w-800,q-80,f-auto`
   Use `srcset` with `tr=w-400` / `w-800` / `w-1600` variants for responsive loading.
4. Add the endpoint as a constant in `src/lib/imagekit.ts` so it's defined once.

⚠️ Verify ImageKit's current free-tier bandwidth cap before uploading the full photo library — tier limits change, and photo-heavy pages are the one place this stack could hit a wall. If it's a problem, Cloudflare Images is the fallback we previously benched.

## Part 5 — Working the data (the actual workflow)

**Adding a city:** copy `src/lib/data/cities/birmingham-al.json`, rename to the city ID, fill it in. That's the whole process — the glob import in `src/routes/city/[slug]/+page.ts` discovers it, prerenders the page, and the landing link goes live on next build. The schema section of `design/design.md` is the field reference.

**Types are enforced:** `src/lib/types.ts` encodes the schema — including the rule that trip-1 recommendations use `attended-anyway`/`retroactive-recommendation` and every recommendation carries `source.citedFrom` (atlasobscura / tasteatlas / eater / timeout / web-search / local-tip / self). `npm run check` will catch malformed city files before they break a build.

**Porting the mockups:** the placeholder pages mark exactly where each mockup's markup goes. Recommended decomposition into `src/lib/components/`:

| Component | Source in mockup | Notes |
|---|---|---|
| `ConstellationMap.svelte` | landing hero SVG | Generate dots/paths from `trips.json` + city coords instead of hardcoding — the SVG projection math is 6 lines |
| `StatStrip.svelte` | landing stats | Props-driven |
| `ChapterCard.svelte` | landing chapters | Maps over `trips.json` |
| `Fingerprint.svelte` | city spider chart | Compute polygon points from `city.fingerprint` values |
| `Waffle.svelte` | city hit-rate grid | Derive counts from `recommendations[].status`; **color trip-1 statuses differently** per the schema rule |
| `FragmentationBar.svelte` | city population bars | From `city.population` |
| `FieldNotes.svelte` | city bottom strip | Nullable-aware: render nothing for null fields |

Port CSS into each component's `<style>` block (scoped by default — the mockups' class names can stay as-is).

**Chart/map libraries** — install only when you reach those features, not now:

```bash
npm i layerchart            # Svelte-native charts for the data deep-dive page
npm i maplibre-gl           # only if the constellation graduates to a real basemap
```

The constellation hero needs neither — it's plain SVG. LayerChart earns its install at the data page (grouped bars, timelines). MapLibre only if you decide you want real geography + free vector tiles (Protomaps/OpenFreeMap) for the scrollytelling chapters.

## Part 6 — Pre-launch checklist

- [ ] `npm run check` passes (type-checks all city JSONs against the schema)
- [ ] `npm run build` locally before pushing anything structural
- [ ] Public/private decision made (schema doc §7.3) **before** real spend/lodging data enters Git history — scrubbing it later is painful
- [ ] Replace the placeholder favicon (`static/favicon.png`, currently a 32px dark square)
- [ ] Lighthouse pass on the Vercel preview URL once the landing is ported
