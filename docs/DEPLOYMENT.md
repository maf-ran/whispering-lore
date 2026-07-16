# Netlify Deployment Guide

## Prerequisites

- Node.js 18+
- Netlify CLI (`npm i -g netlify-cli`) — or use Git-based deploy
- Access to the Netlify team/site

## Pre-deploy Checklist

Run these before every deploy:

```bash
# 1. Regenerate data shards (if creatures.json or stories.json changed)
node archive/scripts/shard-data.mjs

# 2. Run validation (if creatures.json changed)
node archive/scripts/validate-creatures.mjs

# 3. Run all tests
npm test

# 4. Lint
npm run lint
```

If any step fails, fix before deploying.

## Deploy

### Option A: Git-based (recommended)

Push to the production branch. Netlify auto-deploys from:

1. Commit all changes
2. `git push origin main`

Netlify runs `npm test` if configured in build settings. Since the site is static HTML/JS (no build step), the publish directory is `.`.

### Option B: Netlify CLI (manual)

```bash
# Preview deploy (staging URL)
netlify deploy --dir . --prod=false

# Production deploy
netlify deploy --dir . --prod
```

### Option C: Drag-and-drop

1. `node archive/scripts/shard-data.mjs`
2. Drag the project root into Netlify's manual deploy UI

## Post-deploy Verification

1. Load `https://[site].netlify.app/` — hero renders, stats match current counts
2. Click **Explore Bestiary** — cards load, detail overlay works
3. Click **Read Stories** — story cards load
4. Check `https://[site].netlify.app/world.html` — globe loads
5. Open DevTools → Application → Service Workers → verify SW registered and caching
6. Run a quick E2E check:
   ```bash
   npx playwright test --project=chromium
   ```

## Update from Latest Deployment

If you deployed before the June 29 data overhaul and are updating:

1. **Shards must be regenerated** — the old deploy has stale `data/sharded/*` files with wrong counts and broken cross-references. Always run `node archive/scripts/shard-data.mjs` before deploying.

2. **Service worker** — if `sw.js` changed, increment the version string inside it to force clients to re-cache. Otherwise users see stale cached files.

3. **No other build steps** — HTML, CSS, and JS deploy as-is. No bundler, no framework.

## Rollback

On Netlify:

1. Go to **Deploys** → find the last known-good deploy
2. Click the **...** menu → **Publish deploy**
3. If reverting data, re-run `node archive/scripts/shard-data.mjs` against the old JSON first

## Configuration

`netlify.toml` controls headers, redirects, and caching:

- HTML: `max-age=0, must-revalidate` (always fresh)
- JS/CSS/SVG/JPG: `max-age=31536000, immutable` (fingerprinted by path)
- `data/*`: `max-age=3600` (1 hour — shards change with deploys)
- Catch-all `/*` → `404.html` for SPA-like 404 handling
