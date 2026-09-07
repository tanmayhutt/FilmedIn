#!/usr/bin/env bash
set -euo pipefail
if [[ "${SSH_ORIGINAL_COMMAND:-}" =~ ^deploy\ ([0-9a-f]{40})$ ]]; then
  exec bash /usr/local/lib/filmedin/deploy.sh "${BASH_REMATCH[1]}"
fi
echo 'Only FilmedIn deployment commands are permitted' >&2
exit 1
