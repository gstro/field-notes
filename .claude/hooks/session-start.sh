#!/usr/bin/env bash
# SessionStart hook (D30). Cloud-only: local machines manage their own
# node_modules. In a Claude Code on the web session, make sure the site's
# dependencies are installed so check/build/lint work on the first command.
set -euo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}/setup/roadtrip"

# .npmrc has engine-strict=true and engines.node is >=22.12.0, so an older
# Node fails `npm ci` with a cryptic error. Say so plainly instead.
node_version="$(node -v 2>/dev/null || echo v0.0.0)"
IFS=. read -r major minor _ <<<"${node_version#v}"
if [ "$major" -lt 22 ] || { [ "$major" -eq 22 ] && [ "$minor" -lt 12 ]; }; then
	echo "session-start: Node $node_version is below 22.12; see setup/dev-environment.md (cloud setup script)." >&2
	exit 0
fi

# Reinstall only when the lockfile is newer than the last install.
if [ ! -f node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
	npm ci --no-audit --no-fund >&2
fi
