---
name: lighthouse
description: Run Lighthouse CI against the production build (six sampled routes) and read the results. Use after visual/CSS/markup changes, colour or contrast changes, or when asked about accessibility, SEO, or best-practices scores.
---

# Lighthouse

In `setup/roadtrip/`:

```bash
npm run build && npm run lhci
```

`lighthouserc.json` starts `vite preview` on :4173 and audits `/`, `/city/washington-dc`, `/chapter/west`, `/data`, `/colophon`, `/superlatives` (the M39 sample). It asserts **accessibility, best-practices, and SEO = 100**. Performance is collected but not asserted: M39 measured 91–99 swings between identical runs.

Reports land in `setup/roadtrip/.lighthouseci/` (gitignored), one `lhr-*.json` + `.html` per route. To find failures, read `categories.<id>.score` and the audits with `score < 1` in the JSON.

- Contrast fixes must be **re-measured**, not judged from CSS. D29 (no opacity on `--muted` text) came from exactly that.
- Don't audit `build/city/<slug>.html` directly with a file server; it 404s after hydration. Always go through `vite preview`.
- For one-off audits of a single page during a session, the chrome-devtools MCP's `lighthouse_audit` tool also works.
- **Known failure:** `/` fails `font-size` (59.66% legible against a 60% bar) because of the 8–10px mono labels. It's an open type-scale decision (`design/manual-steps.md` §8). Report it as known rather than "fixing" font sizes unasked, and flag any *other* failure as new.
- **In cloud sessions,** the SessionStart hook sets `CHROME_PATH` and `LHCI_COLLECT__SETTINGS__CHROME_FLAGS` (adding `--ignore-certificate-errors` for the TLS proxy). If `errors-in-console` fails with `ERR_CERT_AUTHORITY_INVALID`, that export didn't happen; check the hook.
- The live-URL re-run is a manual step (`design/manual-steps.md`).
