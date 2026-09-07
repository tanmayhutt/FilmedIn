#!/usr/bin/env bash
set -Eeuo pipefail
cd /home/ubuntu/tanmay/FilmedIn
exec 9>/home/ubuntu/tanmay/.filmedin-deploy.lock
flock -w 900 9
revision=${1:-}
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || { echo 'Expected a full commit SHA'; exit 1; }
[[ -z "$(git status --porcelain)" ]] || { echo 'Server worktree has local changes'; exit 1; }
git fetch origin main
[[ "$(git rev-parse origin/main)" == "$revision" ]] || { echo 'Skipping superseded deployment'; exit 0; }
git merge --ff-only "$revision"
previous=$(docker inspect --format '{{.Image}}' filmedin-app-1 2>/dev/null || true)
docker compose build app
if ! docker compose up -d --no-build --wait --wait-timeout 120 app; then
  if [[ -n "$previous" ]]; then
    docker tag "$previous" filmedin-rollback
    FILMEDIN_IMAGE=filmedin-rollback docker compose up -d --no-build --wait --wait-timeout 120 app
    echo 'Restored previous image after failed health check'
  fi
  exit 1
fi
curl --fail --silent --show-error http://127.0.0.1:5050/health
echo "Deployed $revision"
