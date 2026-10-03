# Manual steps

Everything in this project that only a human can do: vendor setup, one-time verification,
memory passes over the data, and decisions the design docs are waiting on. Code and content
changes don't belong here — see `implementation-plan.md` for those. Add to this file instead
of leaving a new one-off "manual pass" note buried in a milestone doc.

## 1. Env vars and secrets — there are none

Nothing to place, nothing to rotate. Confirmed by search: no `.env*` file exists, and no code
references `import.meta.env`, `$env/`, `process.env`, or `PUBLIC_`. CI
(`.github/workflows/ci.yml`, [D30](decision-log.md#d30-dev-environment-lintformat-ci-generated-json-schema-committed-agent-config))
needs no repo secrets either. `.gitignore` already has the standard
`.env`/`.env.*` rules staged (`setup/roadtrip/.gitignore:16-19`) in case one is ever needed —
nothing currently uses them.

If ImageKit is set up (§3), its URL endpoint is **public**, not a secret — it's a constant in
`src/lib/imagekit.ts`, not an env var (`setup/roadtrip-setup-guide.md:64`).

## 2. Hosting: Vercel (verify, don't redo)

`setup/roadtrip/vercel.json` is already configured and, per `implementation-plan.md:48-50`,
the deploy landed. Verify these in the Vercel dashboard:

- [ ] **Root Directory is `setup/roadtrip`.** The original setup guide assumed a repo named
      `roadtrip` with the app at the repo root (`roadtrip-setup-guide.md:43,51`). The actual
      repo is `gstro/field-notes` with the app nested under `setup/roadtrip/` — if the project
      was imported before that was accounted for, the root directory setting needs to point
      there explicitly.
- [ ] **Plan is Hobby, non-commercial.** (`roadtrip-setup-guide.md:55`)
- [ ] **Record the production URL somewhere** — it isn't written down anywhere in the repo or
      docs today.
- [ ] Custom domain / DNS — optional, nothing is set up now, no doc calls for one.

## 3. Repo visibility — verify GitHub matches the decided posture

`design/decision-log.md:109-111` (D16) settled this: the site is **fully public**, spend and
all recovered data included, and that's confirmed live in the colophon
(`setup/roadtrip/src/routes/colophon/+page.svelte:209`, "public Git repository"). `design.md`
previously had a stale "private" line — fixed. The remaining action is just:

- [ ] Confirm the `gstro/field-notes` repo is actually set to public on GitHub.

## 4. Photos: ImageKit (M7, do when photos are ready)

Not started — `src/lib/imagekit.ts` doesn't exist yet, `photos` fields are typed but empty in
every city file. When you're ready (`roadtrip-setup-guide.md:57-66`):

- [ ] Create a free ImageKit account, note the URL endpoint (`https://ik.imagekit.io/YOUR_ID`).
- [ ] **Check ImageKit's current free-tier bandwidth cap before uploading** — tier limits
      change, and photo-heavy pages are the one place this stack could hit a wall. Fallback:
      Cloudflare Images.
- [ ] Set up the media library folder structure: one folder per city ID, plus
      `/serial/{subject}/` for the seven serial-photo subjects
      (`implementation-plan.md:144`).
- [ ] Add the endpoint as a constant in `src/lib/imagekit.ts`.

## 5. Small site hygiene

- [ ] Replace the placeholder favicon (`setup/roadtrip/static/favicon.png`) — still the
      original 32px dark square (`roadtrip-setup-guide.md:102`).
- [ ] Run Lighthouse against the **live Vercel URL** once §2's URL is recorded
      (`roadtrip-setup-guide.md:103`). [M39](m39-lighthouse-hygiene.md) ran it against a local
      `preview` build instead — every sampled route now scores 100 on accessibility,
      best-practices and SEO, with the real contrast/landmark/heading/meta-description defects
      fixed, but local-preview performance numbers exclude CDN/edge effects.
- ~~Pin the Node version~~, ~~drop the unused `@sveltejs/adapter-auto` dependency~~, and ~~fix
  the stale README adapter line~~ — **done in [M39](m39-lighthouse-hygiene.md)**. (These were
  code-only edits mis-filed here; this document is for what only a human can do.)

## 6. Privacy — your call, not a default action

- [ ] **Scrub the removed home-address entry from git history.** It was removed from the
      current data but survives in git history on a public repo. Scrubbing needs
      `git filter-repo` or BFG and a force-push across every merged PR
      (`implementation-plan.md:90`, `m5b-visited-places.md:31`). Nobody should do this without
      you explicitly deciding to, since it rewrites shared history.
- [ ] A wider privacy re-audit of the Google Takeout export is still outstanding beyond the
      one entry already caught (`m5b-visited-places.md:32`).

## 7. Data only you can supply

These are memory passes or exports — nothing in the codebase can generate them.

| Task | Blocks / why it matters | Source |
|---|---|---|
| Export card statements, Oct 2025 – Jun 2026, as CSV | D20 spend data, the `/data` spend section — "the only genuinely unresolved M0 pull" | `implementation-plan.md:35` |
| Retroactive Google Maps routing for per-leg mileage | `legs.json`, the M4 leg ledger (Takeout bounds search windows, not distances) | `implementation-plan.md:34` |
| Would-return ratings, ~787 recommendations | M6 superlatives page — `rating` is empty dataset-wide | `implementation-plan.md:140` |
| Trip-2 attendance reconstruction from memory + photos + calendar/ticket emails (D21) | Moves trip-2 statuses off provisional | `implementation-plan.md:28,69` |
| Fingerprint scoring session, all 18 cities in one sitting (D12) | Calibration drift across sessions would corrupt the overlay comparisons | `decision-log.md:95,221` (O4) |
| Whole-city qualitative fields: `vibeWord`, `fingerprint`, `favorites`, `fieldNotes`, `wouldILiveHere` | Currently empty/null across every city | `implementation-plan.md:7` |
| Neighbourhood/address accuracy review, ~552 unverified values | Unblocks rendering `district`/`address` (M5f found 6 of 22 hand-checked DC values wrong; machine guides carry the same risk at ~25× the volume) | `decision-log.md:217` |
| Colophon "things I wish I'd captured" text | Ready and waiting for your words | `m37-colophon.md:13` |

## 8. Decisions waiting on you

- **O4** — when to hold the fingerprint scoring session. Currently: "after a few cities'
  qualitative data lands." (`decision-log.md:221`)
- **O5** — whether legs need a `detours` field, to be decided during leg reconstruction.
  (`decision-log.md:222`; see also `roadmap.md:10`)
- **DC as a size outlier** — 87 recommendations vs. the next-largest city's 53. Flagged, not
  settled; reversal is one file if you want it. (`m5f-dc-restorations.md:43-51`,
  `implementation-plan.md:94`)
- **Whether to render the saved-list overlap** (217 recs / 189 venues as of the 15-city
  corpus) — computed and documented, sitting unrendered. (`implementation-plan.md:80`,
  `m37-colophon.md:39,76`)
- **`ConstellationMap` mobile treatment at 390px** — flagged as a D5-territory design
  question, not yet resolved. (`m11-site-quality.md:70`)
- Unendorsed feature ideas (scrollytelling, a 1–5 rating scale, soundtrack modules, etc.) live
  in `design/roadmap.md` — nothing there needs a decision until you promote one into the plan.

## 9. Dev environment (M40, one-time)

Everything in-repo is committed ([D30](decision-log.md#d30-dev-environment-lintformat-ci-generated-json-schema-committed-agent-config)).
These steps live in vendor UIs that only you can reach. Background and troubleshooting are in
[`setup/dev-environment.md`](../setup/dev-environment.md).

- [x] **Claude Code on the web environment.** Network is set to **Custom** with the
      defaults plus `svelte.dev`. The Svelte MCP's `list-sections`/`get-documentation` fetch
      from `svelte.dev` at runtime, and both were verified working in a cloud session (Oct 2026).
- [ ] **Delete `GH_TOKEN` and the setup script** from the environment settings. Neither is
      needed:
      - The token is invalid, and it only breaks `gh`, which nothing in the repo uses.
      - GitHub work goes through the session's built-in GitHub MCP, which is verified working.
      - The setup script 403'd on `dl.google.com`, and the image already ships Playwright's
        Chromium.
- [ ] **Re-run the browser checks in a fresh cloud session** after the chrome-devtools
      wrapper (`.claude/scripts/chrome-devtools-mcp.sh`) lands on `main`. Already verified:
      Node v22.22.0, the `validate` skill, both Svelte MCP tools, and the GitHub MCP. Still
      to verify:
      - chrome-devtools `new_page` → `about:blank` and `list_pages`;
      - the `visual-check` skill on `/city/boise-id`;
      - `npm run build && npm run lhci`.
- [ ] **Branch protection on `main`** (GitHub → Settings → Branches): require the `CI /
      validate` check before merging.
- [ ] **VS Code:** accept the workspace's recommended extensions prompt (Svelte, ESLint,
      Prettier, EditorConfig).
- [ ] **Optional, local only:** `git config blame.ignoreRevsFile .git-blame-ignore-revs` so
      local `git blame` skips the Prettier sweep. GitHub already does this.
