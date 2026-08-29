# Static Demo Deployment (Optional)

**Production app:** `build/projects/platform` → [heart-wire-os.vercel.app](https://heart-wire-os.vercel.app)

This folder is an **archived local-first demo**. Only deploy it as a **separate** Vercel project — do not change the main `heart-wire-os` project root.

## Separate Vercel project (optional)

1. [vercel.com/new](https://vercel.com/new) → import `jonnyterrero/HeartWire-OS`
2. **Root Directory:** `build/projects/HeartWire OS-portfolio`
3. **Framework:** Other — no build command, output `.`
4. Deploy

## Local preview

Open `index.html` via a static server, or use Vercel/Netlify Drop on this folder only.

## Notes

- Data stays in browser `localStorage` (legacy keys `5amClub_v5` / `5amClub_v8`)
- Cloud sync is disabled; use the live Next.js app for accounts
- Bump `version.json` and `sw.js` `CACHE_NAME` together when releasing demo updates
