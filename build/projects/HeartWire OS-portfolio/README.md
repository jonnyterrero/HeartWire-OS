# HeartWire OS — Static Demo (Archive)

**This folder is an archived local-first PWA demo.** It is **not** the production app.

- **Live app:** [https://heart-wire-os.vercel.app](https://heart-wire-os.vercel.app) — Next.js app at `build/projects/platform`
- **This demo:** single-page HTML + service worker; data stays in `localStorage` (reads legacy `5amClub_v5` / `5amClub_v8` keys). Cloud sync is disabled.

## Structure

- `index.html` — single-page PWA entry point (local demo)
- `manifest.json` — install metadata
- `sw.js` — offline app shell + optional CDN cache
- `version.json` — bump to trigger PWA update toast (currently `8.0.0`)
- `vercel.json` — static hosting config (for a **separate** Vercel project if you deploy this demo)

## Do not point the main Vercel project here

The `heart-wire-os` Vercel project must keep **Root Directory:** `build/projects/platform`.

To host this demo separately, create a second Vercel project with Framework **Other** and root `build/projects/HeartWire OS-portfolio`.

## Features (local demo)

- Resource database, Kanban planner, course notes, progress tracking
- PWA installable with offline app shell
- HeartWire branding (v8.0.0)

## Historical note

Previously named 5amClub OS. Storage keys intentionally retain `5amClub_v5` / `5amClub_v8` for migration.
