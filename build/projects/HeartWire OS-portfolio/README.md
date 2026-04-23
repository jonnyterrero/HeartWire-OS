# HeartWire OS — Portfolio

The live static portfolio site for HeartWire OS, deployed on Vercel.

**Vercel project:** `HeartWire-OS` (renamed from `5am-club-ebon`).
**Root Directory:** `build/projects/HeartWire OS-portfolio`.

> Historical note: this folder was previously named `5amclubOS` and carried the internal title "5amClub OS v5.0.0". The codebase was renamed alongside the broader HeartWire OS rebrand.

## Structure

- `index.html` — single-page PWA entry point.
- `sw.js` — service worker for offline support and versioned caching.
- `vercel.json` — rewrites all routes to `index.html`; no-cache headers for `sw.js`, `version.json`, and `manifest.json`.
- `netlify.toml` — fallback Netlify config (drag-and-drop deploy still works).
- `version.json` — bumped to trigger PWA auto-update on clients.

## Deployment

**Primary (Vercel):** already configured. Pushing to `main` triggers a production deploy.
**Fallback (Netlify):** drag and drop this folder into [Netlify Drop](https://app.netlify.com/drop).

## Features

- Massive resource database: consolidated and deduplicated resources for SE, CS, Neuro, Math, Chem, and EE/BME.
- Kanban planner: drag-and-drop weekly planning.
- Course notes: dedicated notes per course.
- Progress tracking: visual progress bars and dashboard charts.
- Mobile-optimized sidebar navigation.
- PWA: installable, offline-capable, auto-updating via service worker.
