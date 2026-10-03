#!/usr/bin/env bash
# Launches the chrome-devtools MCP (see .mcp.json). Locally this is just the
# plain server. In Claude Code on the web it adapts to the image, where:
#   - there is no Google Chrome at the stable-channel path, but Playwright's
#     Chromium is preinstalled under /opt/pw-browsers, and
#   - the session runs as root, and Chrome refuses to start as root without
#     --no-sandbox (https://crbug.com/638180), and
#   - outbound HTTPS goes through a TLS-intercepting proxy (see below).
# The first two are detected by inspecting the machine; the proxy is detected
# by CLAUDE_CODE_REMOTE=true.
set -euo pipefail

args=(--headless --isolated --no-usage-statistics)

chrome="${CHROME_PATH:-}"
if [ -z "$chrome" ] && [ ! -x /opt/google/chrome/chrome ]; then
	chrome="$(ls -d /opt/pw-browsers/chromium-*/chrome-linux*/chrome 2>/dev/null | sort -V | tail -1 || true)"
fi
[ -n "$chrome" ] && args+=(--executablePath "$chrome")

[ "$(id -u)" = 0 ] && args+=(--chrome-arg=--no-sandbox)

# Cloud sessions reach the internet through a TLS-intercepting proxy. curl, Node
# and git trust its CA through env vars, but Chromium only reads its own NSS store,
# so external requests like Google Fonts fail with ERR_CERT_AUTHORITY_INVALID.
# This is a throwaway headless profile, so ignoring certificate errors there is
# acceptable.
[ "${CLAUDE_CODE_REMOTE:-}" = true ] && args+=(--chrome-arg=--ignore-certificate-errors)

exec npx -y chrome-devtools-mcp@1.10.1 "${args[@]}"
