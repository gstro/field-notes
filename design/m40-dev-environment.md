# M40 — Dev environment for people and agents, local and cloud

Per-milestone doc. Before M40 the repo had two validation gates, `npm run check` and `npm run build`, and nothing else: no CI, no linter, no formatter, no project-level Claude Code config. Every agent session re-derived how to verify its work. What's left on the roadmap is mostly hand-entered JSON (manual-steps §7), hand-rolled SVG charts (D25), accessibility re-measurement (D29), and the ImageKit pipeline (M7). This milestone adds tooling for exactly those loops and nothing at runtime. The decision is [D30](decision-log.md#d30-dev-environment-lintformat-ci-generated-json-schema-committed-agent-config) and the rejected alternatives are [R21](rejection-log.md#r21-playwright-test-suite-devcontainer-lighthouse-in-ci). The usage guide is [`setup/dev-environment.md`](../setup/dev-environment.md).

## What landed

| Piece | Where |
|---|---|
| ESLint 10 flat config + Prettier 3 | `setup/roadtrip/eslint.config.js`, `.prettierrc`, `.prettierignore`; `npm run lint` / `format` |
| JSON Schema from `types.ts` | `setup/roadtrip/schemas/city.schema.json`; `npm run schemas`; `.vscode/settings.json` `json.schemas` |
| Lighthouse CI (on demand) | `setup/roadtrip/lighthouserc.json`; `npm run lhci` |
| GitHub Actions + Dependabot | `.github/workflows/ci.yml`, `.github/dependabot.yml` |
| Claude Code project config | `.mcp.json`, `.claude/settings.json`, `.claude/hooks/session-start.sh`, `.claude/skills/*`, `.claude/commands/next-task.md` |
| Editor | root `.editorconfig`, root and `setup/roadtrip` `.vscode/` |
| Blame hygiene | `.git-blame-ignore-revs` (the Prettier sweep) |

## Findings

**Lint triage.** The first ESLint run reported 55 errors, all from the recommended Svelte config:

| Rule | Count | Outcome |
|---|---|---|
| `svelte/require-each-key` | 27 | Turned off; reasons in `eslint.config.js` |
| `svelte/no-navigation-without-resolve` | 24 | Turned off; reasons in `eslint.config.js` |
| `svelte/no-useless-mustaches` | 2 | Turned off; reasons in `eslint.config.js` |
| `svelte/prefer-svelte-reactivity` | 1 | False positive: a local tally `Map` inside `$derived.by`. Suppressed on that line, with a comment. |
| unused `_` in `{#each AXES as _, i}` | 1 | Resolved by an ignore pattern for names starting with `_` |

No code defects were found.

**Formatting sweep.** Prettier reformats all 27 source files, about 3,100 changed lines whatever the `printWidth`: at 100, 120, 140 and 180 the diff stays between 3,097 and 3,405 lines. The churn comes from Prettier's markup and CSS layout, not from line length, so the conventional 100 was kept.

The sweep was checked by building before and after and comparing all 22 prerendered HTML pages. After collapsing whitespace runs and normalizing asset hashes, the only differences left are whitespace-only text nodes between block siblings (`</p> <p>` in the landing teasers, `</dt> <dd>` in a flex-column `dl` on the colophon). Browsers don't render those.

Data JSON under `src/lib/data/` is excluded from Prettier, so `cityIndex.json`'s column-aligned rows survive.

**JSON Schema.** The generated schema validates all 15 city files. A deliberately broken copy (bogus status, missing `tagline`) is rejected. `cityIndex.json` has no exported type in `types.ts`, so it gets no schema; adding one would be a schema change, and the schema is frozen.

**Svelte MCP needs network access.** The `@sveltejs/mcp@0.1.26` bundle fetches `https://svelte.dev/docs/experimental/sections.json` and per-section `llms.txt` at runtime. On Claude Code on the web's default "Trusted" network, `list-sections` and `get-documentation` therefore fail, while `svelte-autofixer` (a local static analysis) still works. The allowlist step is in manual-steps §9.

**Lighthouse CI baseline.** The first `npm run lhci` run covered all six M39 routes, and all of them pass the 100 assertions for accessibility, best-practices and SEO. This matches M39.

**Node floor.** `engines.node` rose from `^20.19.0 || >=22.12.0` to `>=22.12.0`:
- `ts-json-schema-generator` 2.9 requires Node 22 or later.
- Node 20 is end-of-life.
- The Claude Code on the web image defaults to Node 22.

`.nvmrc` stays at 24, which is what runs locally (fnm) and in CI. With `engine-strict=true`, a cloud image with Node older than 22.12 would fail `npm ci`, so the SessionStart hook checks the version first and prints a clear message.

## Not done here
- The claude.ai/code environment itself (network allowlist, optional setup script), the first cloud smoke test, and branch protection. These are vendor-UI steps, listed in manual-steps §9.
- The Svelte Claude Code plugin (`sveltejs/ai-tools`). It's an optional local extra, covered in the guide, and it doesn't load in cloud sessions.

## Follow-up: cloud verification (Oct 2026)

A real Claude Code on the web session (tracked in [#19](https://github.com/gstro/field-notes/issues/19)) found four things.

**No Chrome, running as root.** The image has no Google Chrome, only Playwright's Chromium, and the session runs as root. The chrome-devtools MCP now launches through `.claude/scripts/chrome-devtools-mcp.sh`, which adds `--executablePath` and `--no-sandbox` when needed. The SessionStart hook exports `CHROME_PATH`.

**TLS-intercepting proxy.** Outbound HTTPS goes through a proxy whose CA curl, Node and git trust via env vars, but Chromium doesn't. Google Fonts failed with `ERR_CERT_AUTHORITY_INVALID`, which failed Lighthouse's `errors-in-console` audit on every route. In the cloud only:
- the wrapper adds `--ignore-certificate-errors`;
- the hook exports `LHCI_COLLECT__SETTINGS__CHROME_FLAGS`.

I verified locally that this env var fully replaces `lighthouserc.json`'s `chromeFlags`: an env-only proxy flag made `errors-in-console` fail on every route.

**`GH_TOKEN` is a platform placeholder.** It starts `prox` and is 14 characters long, so it isn't a GitHub token. That's why `gh` says "invalid token". The session's GitHub MCP covers all GitHub work, so `gh` and `GH_TOKEN` aren't needed.

**A real legibility finding: `/` fails Lighthouse's `font-size` audit.** Only 59.66% of its text is ≥12px, against a 60% bar; the culprits are the 8–10px mono labels.
- It reproduces locally (Chrome 154) and in the cloud.
- It passed in this milestone's Sep 26 baseline. The score sits right at the threshold, so it can flip between runs.
- `/chapter/west` is at 61.67%.

This is not an environment artefact. It's filed as a type-scale decision in manual-steps §8.
