#!/usr/bin/env bash
# Rebuild deploy/whispering_lore-netlify_deploy-<yyyy-mm-dd>.zip for Netlify upload.
# Filters dev-only paths out of git ls-files, prerenders entity pages + full
# sitemap into the stage, then zips it. archive/ is gitignored: this is a
# local tool by design (project convention).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STAGE=/tmp/wl-deploy-stage
ZIP="$ROOT/deploy/whispering_lore-netlify_deploy-$(date +%Y-%m-%d).zip"
LIST=/tmp/wl-deploy.list
cd "$ROOT"
rm -rf "$STAGE" "$LIST"
mkdir -p "$STAGE" "$ROOT/deploy"
git ls-files \
  | grep -vE '^(\.github/|\.opencode/|tests/|docs/|archive/|skills/|marketing/|\.claude/)' \
  | grep -vE '(^|/)(eslint|jest|playwright|babel)[^/]*\.(js|cjs|json)$|(^|/)package(-lock)?\.json$' \
  > "$LIST"
rsync -a --files-from="$LIST" . "$STAGE/"
python3 archive/scripts/seo-build.py "$STAGE" | tail -5
rm -f "$ZIP"
(cd "$STAGE" && zip -q -r "$ZIP" .)
echo "deploy zip: $(unzip -l "$ZIP" | tail -1 | tr -s ' ')"
echo "repo files: $(wc -l < "$LIST")"