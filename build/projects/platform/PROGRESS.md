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
- Phase C: sidebar rewrite, new tracking/library/calendar/settings pages, dashboard widgets.
- Phase D: lint, build, final commit.
