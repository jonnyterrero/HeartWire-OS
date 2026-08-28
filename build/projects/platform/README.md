# HeartWire OS

Personal study + project tracker. Tracks → Courses → Resources, Kanban tasks, notes, study sessions, habits.

**Stack:** Next.js 14 (App Router) · Prisma 5 · Supabase (Auth + Postgres) · Tailwind · PWA

---

## Local development

### 1. Prerequisites
- Node 20+
- A Supabase project (free tier is fine). Get URL + anon key + DB connection strings from **Project Settings → API** and **Project Settings → Database**.

### 2. Install + configure
```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# DATABASE_URL, DIRECT_URL
```

### 3. Migrate the schema
```bash
npm run db:deploy   # runs prisma migrate deploy against DATABASE_URL/DIRECT_URL
```

### 4. RLS is applied by Prisma now
Policies live in `supabase_rls.sql` and ship via
`prisma/migrations/20260828000000_lock_postgrest_and_rls`. `npm run db:deploy`
(and the Vercel build) applies them. The Next.js API still uses Prisma with
the postgres role (bypasses RLS). PostgREST table grants for `anon` /
`authenticated` are revoked because the app only uses supabase-js for Auth.

Optional manual re-apply:
```bash
psql "$DIRECT_URL" -f supabase_rls.sql
```

### 5. Run
```bash
npm run dev
# open http://localhost:3000 → /login → sign up
```

### 6. (Optional) Seed your account with the full track/course/task catalog
After your first login, copy your user ID from **Supabase → Auth → Users**:

```bash
SEED_USER_ID=<your-uuid> SEED_USER_EMAIL=you@example.com npm run db:seed
```

This populates ~12 tracks, ~70 courses, and ~140 starter project tasks.

---

## Scripts

| Script             | Purpose                                                |
|--------------------|--------------------------------------------------------|
| `npm run dev`      | Local dev server                                       |
| `npm run build`    | `prisma migrate deploy && prisma generate && next build` |
| `npm run start`    | Run the production build                               |
| `npm run lint`     | Next.js / ESLint                                       |
| `npm run typecheck`| `tsc --noEmit`                                         |
| `npm run db:deploy`| Apply migrations (production-safe)                     |
| `npm run db:migrate`| Create + apply a new migration locally                |
| `npm run db:studio`| Prisma Studio                                          |
| `npm run db:seed`  | Seed catalog (requires `SEED_USER_ID`)                 |
| `npm run db:reset` | Drop + remigrate + reseed (destructive)                |

---

## Deploy to Vercel

The repo already has `vercel.json` wired so the build runs `prisma migrate deploy` before `next build`. To ship:

```bash
# from build/projects/platform
npx vercel link            # one-time, pick the existing project
npx vercel env pull .env.local   # optional, to mirror prod secrets locally
npx vercel --prod
```

### Required environment variables in Vercel

Set these in **Project → Settings → Environment Variables** for **Production** and **Preview**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` (pooled, port 6543)
- `DIRECT_URL` (direct, port 5432)
- `NEXT_PUBLIC_APP_URL` (e.g. `https://yourdomain.com`)

`SUPABASE_SERVICE_ROLE_KEY` is reserved for future admin tasks; leave unset unless used.

### Supabase OAuth redirect (if using Google)

In **Supabase → Authentication → URL Configuration**, add your Vercel URL to **Redirect URLs**:
```
https://your-vercel-domain.vercel.app/auth/callback
https://yourdomain.com/auth/callback
```

---

## Architecture notes

### Auth flow
- All `/api/*` routes call `getAuthenticatedUser()` (`src/lib/auth.ts`), which reads the Supabase session cookie and upserts a row in our `users` table on first call.
- Middleware (`src/middleware.ts`) gates **page** routes, redirecting anonymous traffic to `/login`. It deliberately does **not** intercept `/api/*` so route handlers return JSON 401s instead of HTML redirects.

### Data ownership
Every Prisma query is scoped by `userId` (or by `track.userId` for transitive resources). The API never trusts client-supplied `userId`.

### Health check
`GET /api/health` returns `{status,db,latencyMs,ts}` with a 200/503. Wire it into Vercel Monitoring or any uptime probe.

### Known trade-offs
- **Prisma uses the postgres role**, so RLS is defense-in-depth, not the primary control. App-level `userId` checks in route handlers are the source of truth. PostgREST access for the anon key is revoked.
- **API write rate limiting is in-memory** (per Vercel instance). Enable [Vercel WAF](https://vercel.com/docs/security/vercel-waf) and Supabase Auth [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) before a busy public launch.
- **No Zod.** Validation is done by hand-rolled helpers in `src/lib/api.ts` to keep the dep list lean. Swap in Zod if the API grows.
