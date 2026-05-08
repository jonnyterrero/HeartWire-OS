# HeartWire-OS Upgrade — Progress Log

Branch: `feat/heartwire-upgrade`

## 2026-05-07 — Phase A (schema) + Phase B (API)

### Done
- Wrote `.env.local` and `.env` (both gitignored) with Supabase project credentials for `opappznvhjtalcelcrta`. Password URL-encoded.
- Rewrote `prisma/schema.prisma` with the full HeartWire upgrade — additive only:
  - New enum `ResourceType` (10 values per spec).
  - New models: `ExamPracticeSession`, `Tag`, `ResourceTag`, `NoteTag`, `TaskTag`, `CalendarEvent`.
  - New columns on `StudySession` (`startedAt`, `endedAt`, `durationMinutes`, `trackId`, `courseId`, `sessionType`, `focusScore`, `energyScore`, sync + soft-delete).
  - New columns on `Resource` (`resourceType` enum, `description`, `filePath`, `sourcePlatform`, `isFavorite`, `userId`, `trackId`, sync + soft-delete) and `courseId` loosened to nullable for library scope.
  - New columns on `Note` (`noteType`, `journalDate`, `moodScore`, `energyScore`, sync + soft-delete).
  - Indexes on FKs, `deletedAt`, common filter columns.
- `npx prisma generate` succeeded — client has all new types.
- Wrote new API routes:
  - `src/app/api/exam-practice/route.ts` — GET (list + accuracy stats), POST.
  - `src/app/api/exam-practice/[id]/route.ts` — GET, PATCH, DELETE (soft-delete).
  - `src/app/api/calendar-events/route.ts` — GET (range filter), POST.
  - `src/app/api/calendar-events/[id]/route.ts` — GET, PATCH, DELETE (soft-delete).
  - `src/app/api/calendar/route.ts` — aggregator: tasks + events + study sessions + exam sessions for a date range.
  - `src/app/api/tags/route.ts` and `[id]/route.ts` — list/create/delete.
  - `src/app/api/resources/[id]/tags/route.ts` — attach/detach.
  - `src/app/api/seed-defaults/route.ts` — idempotent seed of 6 default tracks for the current user.
- Extended existing routes:
  - `src/app/api/resources/route.ts` — supports library-scope (no courseId), `resourceType` enum filter, favorite filter, soft-delete exclusion, includes track/tags.
  - `src/app/api/resources/[id]/route.ts` — supports new fields and soft-delete.
  - `src/app/api/sessions/route.ts` — accepts new optional fields (track/course/session-type/scores/started-at/ended-at), returns trend vs previous window.
- All new routes use `getAuthenticatedUser()`, validate via `src/lib/api.ts` helpers, soft-delete only.
- `npx tsc --noEmit` — passes.

### Blocked
- **`npx prisma migrate dev` failed with P1000 (auth)**. The host `db.opappznvhjtalcelcrta.supabase.co` resolves and accepts the connection, but the `postgres` user / password combination provided is rejected. Possible causes:
  1. Password typo in chat (the user said `Q6371895nycj108!2937?`).
  2. Supabase auto-rotated credentials after keys were pasted in plaintext.
  3. Direct-connection user format may have changed (some Supabase projects now require `postgres.<ref>` even for direct).
- **Action needed from user**: rotate keys in Supabase dashboard, then put the new `DATABASE_URL` and `DIRECT_URL` in `.env` (URL-encode any special chars). Then run `npx prisma migrate dev --name heartwire_upgrade_v1`.

### Pending
- Phase D: live-DB testing once migration runs.

## 2026-05-07 — Phase C (frontend) + Phase D (verify)

### Done
- Sidebar rewritten (`src/components/layout/Sidebar.tsx`) with new IA: Dashboard / Tracking / Study Tracks / Library / More (Calendar, Planner, Notes, Settings). Existing 5-group `track-groups.ts` preserved. UI rules followed: muted uppercase section labels, subtle active state, no gradient buttons, no colored circles.
- New pages:
  - `/tracking/study-hours` — log + week stats + trend vs prior week.
  - `/tracking/courses` — redirects to `/courses`.
  - `/tracking/fe-pe` — log + accuracy stats + history.
  - `/tracking/habits` — redirects to `/habits`.
  - `/tracking/journal` — list of `noteType=JOURNAL` notes + create form.
  - `/library/[type]` — dynamic route handling github/pdfs/websites/youtube. Filters resources by `resourceType` slug map. Star toggle wired to `PUT /api/resources/:id`.
  - `/calendar` — month grid + day detail + 14-day upcoming. Aggregates via `/api/calendar`. Inline create-event form posts to `/api/calendar-events`.
  - `/settings` — account info, sign out, Seed Default Tracks button calling `/api/seed-defaults`.
- Dashboard rewrite (`src/app/page.tsx`): 4 stat cards (Study 7d w/ trend, Tasks open w/ due-today, Habits week %, FE/PE accuracy) + 3 sections (Recent resources, Last journal, Upcoming events). Quick-action row at bottom. No gradient cards, no placeholder data.
- All quality gates pass:
  - `npx tsc --noEmit` — 0 errors.
  - `npx next lint --max-warnings 0` — clean.
  - `npx next build` — succeeds, all 41 routes compile (15 new).

### Still blocked — diagnosis
- Direct connection (`db.opappznvhjtalcelcrta.supabase.co:5432`) → DNS resolves, TCP accepts, but `P1000: Authentication failed`.
- Pooler (`aws-0-<region>.pooler.supabase.com`) tried in 9 regions → all return "Tenant or user not found" or unreachable.
- Both error patterns together strongly suggest **the Supabase project is paused** (free-tier projects auto-pause after 7 days of inactivity). When paused, the direct host stays up but auth is rejected, and the pooler reports the tenant as missing.

### What you need to do to unblock the migration
1. Open the Supabase dashboard: https://supabase.com/dashboard/project/opappznvhjtalcelcrta
2. If the project is paused, click "Restore project" and wait ~1 min.
3. (Recommended) Rotate keys & DB password since they were pasted in chat: Project Settings → Database → Reset password; Project Settings → API → reset anon + service-role keys.
4. Update `build/projects/platform/.env` and `.env.local` with the new password (URL-encode special chars — `?` → `%3F`, `!` → `%21`) and the new keys.
5. Run:
   ```
   cd build/projects/platform
   npx prisma migrate dev --name heartwire_upgrade_v1
   npx prisma generate
   ```
6. Then `npm run dev` and walk through the test flow above.

### Final state of the branch (`feat/heartwire-upgrade`)
- Commit `af39e0c` — schema + API routes (Phase A code + Phase B).
- Commit `c5e2046` — frontend (Phase C + verified Phase D).
- `.env` and `.env.local` written locally, gitignored, never committed.
- `tsc --noEmit` clean. `next lint` clean. `next build` succeeds (41 routes, 15 new).
- Only the live DB migration is pending.

### How to test (after migration applies)
1. `npm run dev`
2. Sign in at `/login`
3. `/settings` → Seed default tracks → 6 new tracks created
4. `/tracking/study-hours` → log a session → appears in list, stats update
5. `/tracking/fe-pe` → log a practice → accuracy stat updates
6. `/tracking/journal` → write entry → shows on `/` dashboard "Last journal" widget
7. `/calendar` → click a date → day panel shows tasks/events for that day; create an event via the form
8. `/library/pdfs` → add a PDF resource via `/resources` (set `resourceType=PDF`) → appears in `/library/pdfs`
