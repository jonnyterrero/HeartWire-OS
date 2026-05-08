# Deploying HeartWire-OS to Vercel

## One-time setup (Vercel dashboard)

1. Go to https://vercel.com/new
2. Import the GitHub repo: `jonnyterrero/HeartWire-OS`
3. **Configure Project**:
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `build/projects/platform` ← **important**, the app is in a subfolder
   - **Build Command**: leave default (`vercel.json` already sets `prisma migrate deploy && prisma generate && next build`)
   - **Install Command**: leave default (`vercel.json` sets `npm install --no-audit --no-fund`)
   - **Output Directory**: leave default (`.next`)
4. **Environment Variables** — add all 5 (paste from `.env` or your password manager):
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Set the deploy branch to `Backend-development` (or merge it to `main` and deploy from there).
6. Click **Deploy**. First build will:
   - install deps
   - run `prisma migrate deploy` (applies the `heartwire_upgrade_v1` migration to Supabase)
   - run `prisma generate`
   - build Next.js

## After first deploy

- Open the deployment URL → sign in with Supabase auth at `/login`.
- Visit `/settings` → click **Seed default tracks** to create the 6 default tracks.
- Verify each new page loads:
  - `/tracking/study-hours`
  - `/tracking/fe-pe`
  - `/tracking/journal`
  - `/tracking/leetcode`
  - `/tracking/rosalind`
  - `/tracking/textbooks`
  - `/library/github`, `/library/pdfs`, `/library/websites`, `/library/youtube`
  - `/calendar`

## Subsequent deploys

Push to `Backend-development` (or whatever branch is wired to Vercel). Each push runs `prisma migrate deploy` against Supabase, so new migrations auto-apply. **Never edit `prisma/schema.prisma` without creating a migration via `npx prisma migrate dev --name <name>` locally first** — otherwise Vercel will fail to match drift.

## URL-encoding gotchas in `DATABASE_URL`

If your Supabase password contains:
- `?` → encode as `%3F`
- `!` → optional, but safer as `%21`
- `@` → must encode as `%40`
- `#` → must encode as `%23`
- `/` → must encode as `%2F`

Easiest path: pick a password without special chars (alphanumeric only).

## Local dev

```bash
cd build/projects/platform
cp .env.example .env
# fill in real values
npm install
npx prisma generate
npx prisma migrate dev   # only the first time; subsequent dev runs use migrate dev only on schema changes
npm run dev
```
