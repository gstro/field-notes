# Dev Environment — Usage Guide

How to work on this repo, whether you're a person or a Claude Code agent, locally or in Claude Code on the web. Set up in [M40](../design/m40-dev-environment.md); the reasoning is in [D30](../design/decision-log.md#d30-dev-environment-lintformat-ci-generated-json-schema-committed-agent-config) and the rejected alternatives in [R21](../design/rejection-log.md#r21-playwright-test-suite-devcontainer-lighthouse-in-ci). Versions were verified in Sep 2026.

Rule of thumb: **everything runs from `setup/roadtrip/`, and everything Claude Code loads lives at the repo root.** That's where Claude starts in both local and cloud sessions.

---

## Quick start

**Local (macOS)**

```bash
cd setup/roadtrip
fnm use            # reads .nvmrc → Node 24 (any Node ≥22.12 works)
npm ci
npm run dev -- --open
```

Open the repo root in VS Code and accept the recommended extensions. Run `claude` from the repo root, and approve the two project MCP servers the first time it asks.

**Cloud (Claude Code on the web).** Pick this repo and start a session. The SessionStart hook runs `npm ci` for you. One-time environment setup (network allowlist, optional setup script) is in [manual-steps §9](../design/manual-steps.md#9-dev-environment-m40-one-time).

**Before any commit:** `npm run check && npm run lint && npm run build`, or ask Claude to run the `validate` skill.

---

## Compatibility matrix

|  | Local — macOS | Cloud — Claude Code on the web | GitHub Actions CI |
|---|---|---|---|
| OS / arch | Darwin, Apple Silicon | Ubuntu 24.04, x86_64 | `ubuntu-latest` |
| Node | 24 via fnm (`.nvmrc`) | 22 preinstalled (must be ≥22.12; `engine-strict`) | 24 via `setup-node` + `.nvmrc` |
| Dependency install | you run `npm ci` | SessionStart hook runs it | workflow step |
| `check` / `lint` / `build` / `schemas` | ✅ | ✅ | ✅ (all four + schema-drift check) |
| `npm run lhci` | ✅ uses installed Chrome | ✅ Playwright Chromium; the hook sets the path and Chrome flags (flags verified via an equivalent CLI override) | — not run (R21) |
| Svelte MCP: `svelte-autofixer` | ✅ | ✅ offline | — |
| Svelte MCP: docs tools | ✅ | ⚠️ needs `svelte.dev` on a Custom allowlist | — |
| chrome-devtools MCP | ✅ | ✅ Playwright Chromium via the wrapper (verified Oct 2026) | — |
| Project skills / commands / hook | ✅ | ✅ loaded from repo | — |
| Svelte Claude plugin (optional) | ✅ if you install it | ❌ plugins don't load in cloud | — |
| GitHub access | `gh` CLI (authenticated) | ✅ built-in GitHub MCP; `gh` not needed | built-in `GITHUB_TOKEN` |
| VS Code JSON Schema validation | ✅ | n/a | — |

⚠️ = works once the one-time step in manual-steps §9 is done. Until then the rest of the environment still works; only that tool is missing.

---

## Tools

### Node, npm, fnm

- **What:** the runtime. `.nvmrc` pins **24**; `package.json` `engines.node` is `>=22.12.0`, and `.npmrc` sets `engine-strict=true`, so an older Node fails `npm ci` right away.
- **Use:** use `fnm use` locally (it reads `.nvmrc`). Use `npm ci` for clean installs and `npm install <pkg> -D` to add a dev dependency. There are **no runtime dependencies** (D25), so everything goes in `devDependencies`.
- **Note:** npm 11 prints an `allow-scripts` warning about `fsevents`. That warning is harmless: it's a macOS-only optional dependency whose install script isn't needed.

### npm scripts (in `setup/roadtrip/`)

| Script | What it does | When |
|---|---|---|
| `dev` | Vite dev server with HMR | interactive work |
| `check` | `svelte-kit sync` + `svelte-check`; validates pages **and** every city JSON against `types.ts` | after any code or data change |
| `lint` | `prettier --check .`, `eslint .`, then the type-scale guard (`scripts/check-type-scale.ts`, D32) | before committing |
| `format` | `prettier --write .` | fixing lint's formatting half |
| `build` | full static prerender; **fails on any broken internal link** | before committing; this is what Vercel runs |
| `preview` | serves `build/` with clean URLs on :4173 | browser checks, Lighthouse |
| `schemas` | regenerates `schemas/city.schema.json` from `types.ts` | after editing `types.ts` |
| `lhci` | Lighthouse CI on 6 routes (`npx @lhci/cli@0.15.1`) | after visual/markup/colour changes |

### ESLint + Prettier

- **What:** ESLint 10 (flat config, `typescript-eslint`, `eslint-plugin-svelte` v3) and Prettier 3 (`prettier-plugin-svelte`). Config lives in `eslint.config.js`, `.prettierrc` (tabs, single quotes, width 100) and `.prettierignore`.
- **No `svelte.config.js`.** That's deliberate (R12). ESLint gets the runes setting inline instead, so don't create the file to satisfy a tool.
- **Rules turned off**, with the reasons written in the config: `no-navigation-without-resolve`, `require-each-key`, `no-useless-mustaches`. `_`-prefixed names are exempt from the unused-variable rule.
- **Data JSON is Prettier-ignored** (`src/lib/data/`), because its column-aligned rows produce clean diffs. Don't run Prettier on it by hand either.
- **Blame:** the one-time formatting sweep is listed in `.git-blame-ignore-revs`. GitHub skips it automatically; locally, run `git config blame.ignoreRevsFile .git-blame-ignore-revs`.

### JSON Schema for city data

- **What:** `schemas/city.schema.json`, generated from the `City` interface by `ts-json-schema-generator`. VS Code maps it to `src/lib/data/cities/*.json` through `.vscode/settings.json`, which is set up both at the repo root and in `setup/roadtrip` so it works whichever folder you open.
- **Use:** open a city file and you get autocomplete for fields and status values, plus red squiggles on typos, wrong types or missing required fields. This is aimed at the manual data passes (manual-steps §7).
- **Rules:**
  - `types.ts` is the source of truth. After changing it, run `npm run schemas` and commit the result; CI fails if you forget.
  - **Never add a `$schema` key to a data file.** svelte-check types those imports, so an extra key breaks `check`.
  - `cityIndex.json` has no exported type, so it has no schema.
- **Ad hoc validation** outside the editor: `npx -y ajv-cli@5 validate --spec=draft7 --strict=false -s schemas/city.schema.json -d "src/lib/data/cities/*.json"`.

### Svelte MCP (`svelte` in `.mcp.json`)

- **What:** the official Svelte MCP server (`@sveltejs/mcp`, pinned in `.mcp.json`). Its tools:
  - `list-sections` and `get-documentation`: current Svelte 5 and SvelteKit docs.
  - `svelte-autofixer`: static analysis that flags Svelte 4 idioms, rune misuse and a11y issues in a component. Run it repeatedly until it comes back clean.
  - `playground-link`: builds a shareable playground link.
- **Use (agents):** run `svelte-autofixer` on every `.svelte` file you create or change. It reports "Each block should have a key" on most of this site's `{#each}` loops. That's expected: ESLint's `require-each-key` rule is off for the same reason (static prerendered lists, D30), so ignore that one suggestion. Use `get-documentation` before writing unfamiliar runes or SvelteKit APIs rather than recalling them from memory; runes mode is forced, so Svelte 4 syntax fails.
- **Use (people):** in a Claude session, "check this component with svelte-autofixer" or "look up the `$derived.by` docs".
- **Cloud:** `svelte-autofixer` works offline. The two docs tools fetch from `svelte.dev` at runtime, so add that host to the environment's Custom allowlist (manual-steps §9).
- **Optional extra, local only:** the Svelte Claude Code plugin bundles this same MCP server plus Svelte skills and a `svelte-file-editor` subagent. It doesn't load in cloud sessions, which is why the repo relies on `.mcp.json`. To install it:
  ```
  /plugin marketplace add sveltejs/ai-tools
  /plugin install svelte
  ```
  If you install it, disable the project `svelte` server locally (`/mcp`) so you don't run two copies.

### Chrome DevTools MCP (`chrome-devtools` in `.mcp.json`)

- **What:** `chrome-devtools-mcp`, which drives headless Chrome over CDP in an isolated, throwaway profile. Its tools include:
  - page control: `new_page`, `navigate_page`, `resize_page`
  - inspection: `take_screenshot`, `take_snapshot` (the accessibility tree), `evaluate_script`, console and network inspection
  - emulation: `emulate` (colour scheme, viewport, CPU/network, geolocation). It does **not** do `prefers-reduced-motion`; the `visual-check` skill audits the stylesheets for that instead.
  - auditing: performance traces and `lighthouse_audit`
- **Why this one and not Playwright MCP:** M1.1 established that layout gets verified by measuring (`scrollWidth` vs `clientWidth` over CDP), not by eyeballing a screenshot. This server does exactly that, and it adds perf traces.
- **Use:** follow the `visual-check` skill:
  1. Build and preview.
  2. Open clean URLs (never `city/<slug>.html`, which 404s after hydration).
  3. Resize to 390px and measure overflow.
  4. Audit the stylesheets for unguarded animations.
  5. Take a screenshot.
- **Launch:** `.mcp.json` starts it through `.claude/scripts/chrome-devtools-mcp.sh`.
  - **Locally,** that's the plain server and your installed Chrome.
  - **In the cloud,** the wrapper points it at Playwright's Chromium and adds `--no-sandbox`, because the session runs as root. Otherwise the first browser call fails with "Could not find Google Chrome executable for channel 'stable'."
  - To bump the version, edit the pin inside the wrapper.

### Lighthouse CI

- **What:** `lighthouserc.json` starts `vite preview` and audits `/`, `/city/washington-dc`, `/chapter/west`, `/data`, `/colophon` and `/superlatives`. It asserts **accessibility, best-practices and SEO = 100**. Performance is recorded but not asserted (M39: 91–99 run-to-run noise).
- **Use:** `npm run build && npm run lhci`. Reports go to `setup/roadtrip/.lighthouseci/` (gitignored). For a single page mid-session, the chrome-devtools MCP's `lighthouse_audit` is quicker.
- **Rule (D29):** re-measure contrast changes; don't judge them from the CSS.
- **Legible type (D31):** Lighthouse counts text ≥12px as legible and fails a page under 60%. Every sampled route is now 87–100% legible. Size small text with the `--text-*` tokens in `tokens.css` (D32), never raw px. `npm run lint` rejects px values that a token covers and anything below 10px.
- **Not in CI** (R21). The live-URL run is a manual step (manual-steps §5).

### GitHub Actions CI + Dependabot

- **What:** `.github/workflows/ci.yml` runs on every PR and on pushes to `main`: `npm ci` → `check` → `lint` → schema drift → `build`. It needs no secrets. `.github/dependabot.yml` opens grouped monthly PRs for npm (Svelte/Vite and lint groups) and for Actions.
- **Use:** open PRs as usual; `gh pr checks` shows the status. Once branch protection is on (manual-steps §9), red CI blocks the merge.
- **Dependabot PRs:** check the release notes for Svelte and Kit minors, let CI run, then merge. A major version of ESLint, Prettier or the Svelte plugin may need `npm run format` and a look at `eslint.config.js`.

### Claude Code project configuration

Everything is at the repo root, so it loads in both local and cloud sessions.

| File | Role |
|---|---|
| `.mcp.json` | the two MCP servers above; versions are pinned, so bump them deliberately |
| `.claude/settings.json` | pre-approved commands (npm scripts, dry-run tools, read-only git/gh, the MCP read tools), the enabled MCP servers, and the SessionStart hook |
| `.claude/hooks/session-start.sh` | **cloud only** (`CLAUDE_CODE_REMOTE=true`): checks Node ≥22.12, then runs `npm ci` in `setup/roadtrip` if `node_modules` is missing or older than the lockfile. Locally it exits immediately. |
| `.claude/skills/validate` | check → lint → schema drift → build, and how to read a prerender broken-link failure |
| `.claude/skills/city-data-edit` | editing city JSON: the nullable-not-placeholder rule, citations, the trip-1/trip-2 status split, overrides (D24), ingest dry-runs |
| `.claude/skills/lighthouse` | running and reading Lighthouse CI |
| `.claude/skills/visual-check` | the chrome-devtools MCP browser-verification recipe |
| `.claude/commands/next-task.md` | `/next-task`: pull `main` and start the next chunk on a new branch (repo copy, so it works in cloud too) |
| `CLAUDE.md` | project memory: architecture, design rules, where docs live |

**Adding to it:**
- A new recurring workflow becomes a skill in `.claude/skills/<name>/SKILL.md`.
- A new always-safe command goes in `permissions.allow`.
- Personal preferences go in `.claude/settings.local.json` (gitignored), never in the shared file.

### gh CLI

- **Use:**
  - `gh pr create`, `gh pr checks`, `gh pr view --comments`
  - `gh run view --log-failed` to read a CI failure
- **Cloud:** don't use `gh` there. The session's built-in GitHub MCP (`mcp__github__*`) covers PRs, issues, CI status and logs, and it's verified working. The `GH_TOKEN` the platform injects is a placeholder that `gh` rejects, and nothing in the repo needs `gh`.

### Repo data tools (`tools/*.mjs`)

These are plain Node ESM scripts with no dependencies. Run them from the **repo root**.
- `node tools/ingest-guides.mjs [--dry-run]` turns `guides/*-guide.json` into `setup/roadtrip/src/lib/data/cities/*.json`. Always dry-run first. Per-city fixes that must survive a re-ingest go in `data/city-overrides.json`.
- `node tools/join-takeout.mjs [--dry-run] [--naive]` joins recommendations against Takeout and writes `data/attendance-matches.json`.

They're outside ESLint's scope (it lints `setup/roadtrip` only). New scripts can be TypeScript: Node 24 runs `.ts` directly (`node tools/x.ts`, erasable syntax only). On Node 22, add `--experimental-strip-types`. Keep them dependency-free.

### Editor (VS Code)

- `.vscode/extensions.json` recommends Svelte, ESLint, Prettier and EditorConfig.
- `.vscode/settings.json` sets the formatters and maps the JSON Schema.
- `.editorconfig` sets tabs and LF line endings everywhere except Markdown and YAML (2 spaces). `data/`, `guides/` and `mockups/` are left alone.

---

## Cloud: Claude Code on the web

What a session actually showed (Oct 2026, verified in a real session):

| | Cloud image |
|---|---|
| Node | v22.22.0, which meets the ≥22.12 floor |
| Browser | no Google Chrome; **Playwright's Chromium** at `/opt/pw-browsers/chromium-*/chrome-linux/chrome` |
| User | root, so Chrome needs `--no-sandbox` |
| Network | outbound HTTPS goes through a TLS-intercepting proxy. curl, Node and git trust its CA via env vars (`NODE_EXTRA_CA_CERTS`, `GIT_SSL_CAINFO`, …). Chromium doesn't, so without a flag Google Fonts fails with `ERR_CERT_AUTHORITY_INVALID`. |
| GitHub | the session's built-in **GitHub MCP** (`mcp__github__*`) covers PRs, issues and CI; git push goes through the session's own remote |
| `GH_TOKEN` | **platform-injected placeholder** (14 chars, starts `prox`), not a GitHub token, and not something you can delete. It's why `gh` reports "invalid token". Harmless, because nothing in the repo uses `gh`. |

1. **Environment** (once, at claude.ai/code): set network to **Custom**, tick "include default allowed domains," and add `svelte.dev`. **You don't need a setup script or your own token.** Chromium is already in the image, and the `gh` CLI isn't used anywhere in this repo.
2. **Every session:** the SessionStart hook does three things:
   - installs dependencies;
   - exports `CHROME_PATH` (the Playwright Chromium) so `npm run lhci` can find a browser;
   - exports `LHCI_COLLECT__SETTINGS__CHROME_FLAGS` (`--headless=new --no-sandbox --ignore-certificate-errors`). This replaces `lighthouserc.json`'s Chrome flags in the cloud only, so the proxy's certificate doesn't turn into a console error on every route.

   The chrome-devtools MCP is launched through `.claude/scripts/chrome-devtools-mcp.sh`. Locally it runs the plain server. In the cloud it adds:
   - `--executablePath <that Chromium>`;
   - `--chrome-arg=--no-sandbox`;
   - `--chrome-arg=--ignore-certificate-errors`.

   Ignoring certificate errors is limited to that throwaway headless profile. `.mcp.json`, the skills and the settings load from the repo.
3. **Not available in cloud:** plugins, and MCP servers added with `--scope user|local`. Anything the project needs must be committed at the repo root.

---

## Common workflows

**Hand data entry** (manual-steps §7: vibeWord, fingerprint, favorites, attendance…)
1. Open the city JSON in VS Code; the schema gives autocomplete and inline errors.
2. Leave unknowns as `null`. Cite every recommendation.
3. Run `npm run check && npm run build`, or ask Claude to use `city-data-edit` then `validate`.
4. Tick off the item in `manual-steps.md`.

**New chart or component** (M5 spend/prices, leg ledger)
1. Hand-roll the SVG (D25) using the tokens in `tokens.css`, with motion behind `prefers-reduced-motion`.
2. Run `svelte-autofixer`, then `validate`.
3. Run `visual-check` at 390px and in reduced motion.
4. Run `lighthouse` if colours changed. The status colour law in CLAUDE.md applies.

**Accessibility or contrast pass**
1. `npm run build && npm run lhci`, then read the failing audits in `.lighthouseci/*.json`.
2. Fix, then re-measure. Never infer a contrast fix from the CSS (D29).

**Photo pipeline prep** (M7): there's no new tooling. The ImageKit endpoint is a public constant (`src/lib/imagekit.ts`), not a secret. Use `visual-check` to confirm images don't break mobile layout.

**Troubleshooting**

| Symptom | Fix |
|---|---|
| `npm ci` fails with `EBADENGINE` | Node is below 22.12; run `fnm use` (locally) |
| cloud chrome-devtools: "Could not find Google Chrome" or "running as root" | `.mcp.json` must launch through `.claude/scripts/chrome-devtools-mcp.sh`, not plain `npx` |
| `gh`: "The token in GH_TOKEN is invalid" (cloud) | expected: `GH_TOKEN` is a platform placeholder. Use the GitHub MCP. |
| `build` fails with `404 /city/<slug>` | a new link points at a city with no JSON; render it as "data pending" |
| CI fails at "JSON Schema is up to date" | run `npm run schemas` and commit |
| MCP shows "failed" in `/mcp` | cloud: check the allowlist (`svelte.dev`); local: `bash .claude/scripts/chrome-devtools-mcp.sh </dev/null` to see the error |
| ESLint complains about `svelte.config.js` | don't create it; parser options are inline in `eslint.config.js` |
