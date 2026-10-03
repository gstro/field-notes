#!/usr/bin/env bash
# Launches the chrome-devtools MCP (see .mcp.json). Locally this is just the
# plain server. In Claude Code on the web it adapts to the image, where:
#   - there is no Google Chrome at the stable-channel path, but Playwright's
#     Chromium is preinstalled under /opt/pw-browsers, and
#   - the session runs as root, and Chrome refuses to start as root without
#     --no-sandbox (https://crbug.com/638180).
# The setup works out each of these by inspecting the machine, not from an env
# flag, so the wrapper behaves the same whatever environment launches it.
set -euo pipefail

args=(--headless --isolated --no-usage-statistics)

chrome="${CHROME_PATH:-}"
if [ -z "$chrome" ] && [ ! -x /opt/google/chrome/chrome ]; then
	chrome="$(ls -d /opt/pw-browsers/chromium-*/chrome-linux*/chrome 2>/dev/null | sort -V | tail -1 || true)"
fi
[ -n "$chrome" ] && args+=(--executablePath "$chrome")

[ "$(id -u)" = 0 ] && args+=(--chrome-arg=--no-sandbox)

exec npx -y chrome-devtools-mcp@1.10.1 "${args[@]}"
