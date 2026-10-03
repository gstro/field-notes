#!/usr/bin/env bash
# SessionStart hook (D30). Cloud-only: local machines manage their own
# node_modules. In a Claude Code on the web session, make sure the site's
# dependencies are installed so check/build/lint work on the first command.
set -euo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}/setup/roadtrip"

# The cloud image has no Google Chrome, only Playwright's Chromium. Export it as
# CHROME_PATH for the session's Bash commands so `npm run lhci` (chrome-launcher)
# finds it; lighthouserc.json already passes --no-sandbox for running as root.
# The chrome-devtools MCP finds it on its own (.claude/scripts/chrome-devtools-mcp.sh).
if [ -z "${CHROME_PATH:-}" ] && [ -n "${CLAUDE_ENV_FILE:-}" ]; then
	pw_chrome="$(ls -d /opt/pw-browsers/chromium-*/chrome-linux*/chrome 2>/dev/null | sort -V | tail -1 || true)"
	[ -n "$pw_chrome" ] && echo "export CHROME_PATH=\"$pw_chrome\"" >>"$CLAUDE_ENV_FILE"
fi

# Same TLS-proxy problem as in .claude/scripts/chrome-devtools-mcp.sh: Chromium
# doesn't trust the proxy CA, so Google Fonts fails and Lighthouse's
# errors-in-console audit fails on every route. LHCI_* env vars replace the
# lighthouserc.json value entirely, so repeat its flags here.
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
	echo 'export LHCI_COLLECT__SETTINGS__CHROME_FLAGS="--headless=new --no-sandbox --ignore-certificate-errors"' >>"$CLAUDE_ENV_FILE"
fi

# .npmrc has engine-strict=true and engines.node is >=22.12.0, so an older
# Node fails `npm ci` with a cryptic error. Say so plainly instead.
node_version="$(node -v 2>/dev/null || echo v0.0.0)"
IFS=. read -r major minor _ <<<"${node_version#v}"
if [ "$major" -lt 22 ] || { [ "$major" -eq 22 ] && [ "$minor" -lt 12 ]; }; then
	echo "session-start: Node $node_version is below 22.12; see setup/dev-environment.md (Cloud section)." >&2
	exit 0
fi

# Reinstall only when the lockfile is newer than the last install.
if [ ! -f node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
	npm ci --no-audit --no-fund >&2
fi
