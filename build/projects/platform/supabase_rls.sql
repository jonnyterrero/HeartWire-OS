-- ============================================================
-- Row-Level Security (defense-in-depth)
-- ============================================================
-- The Next.js API uses Prisma with the `postgres` superuser via DATABASE_URL,
-- which BYPASSES RLS. These policies exist as a safety net in case anything
-- ever queries Supabase directly (supabase-js, future Edge Functions, the
-- Supabase Studio query editor while signed in as a regular user, etc.).
--
-- Apply once after `prisma migrate deploy`:
--   psql "$DIRECT_URL" -f supabase_rls.sql
--
-- Idempotent: safe to re-run.
-- ============================================================

-- ─── Enable RLS on every user-scoped table ──────────────────
alter table users               enable row level security;
alter table tracks              enable row level security;
alter table courses             enable row level security;
alter table resources           enable row level security;
alter table tasks               enable row level security;
alter table notes               enable row level security;
alter table study_sessions      enable row level security;
alter table user_focus_courses  enable row level security;
alter table user_focus_tasks    enable row level security;
alter table habits              enable row level security;
alter table habit_completions   enable row level security;

-- ─── USERS ──────────────────────────────────────────────────
drop policy if exists "users_select_self" on users;
create policy "users_select_self" on users
  for select using (auth.uid()::text = id);

drop policy if exists "users_update_self" on users;
create policy "users_update_self" on users
  for update using (auth.uid()::text = id)
  with check (auth.uid()::text = id);

-- No insert/delete policies — handled by Prisma (server-side) only.

-- ─── TRACKS ─────────────────────────────────────────────────
drop policy if exists "tracks_select_own" on tracks;
create policy "tracks_select_own" on tracks
  for select using (auth.uid()::text = user_id);

drop policy if exists "tracks_insert_own" on tracks;
create policy "tracks_insert_own" on tracks
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "tracks_update_own" on tracks;
create policy "tracks_update_own" on tracks
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "tracks_delete_own" on tracks;
create policy "tracks_delete_own" on tracks
  for delete using (auth.uid()::text = user_id);

-- ─── COURSES (scoped via parent track) ─────────────────────
drop policy if exists "courses_select_own" on courses;
create policy "courses_select_own" on courses
  for select using (
    exists (select 1 from tracks t where t.id = courses.track_id and t.user_id = auth.uid()::text)
  );

drop policy if exists "courses_insert_own" on courses;
create policy "courses_insert_own" on courses
  for insert with check (
    exists (select 1 from tracks t where t.id = courses.track_id and t.user_id = auth.uid()::text)
  );

drop policy if exists "courses_update_own" on courses;
create policy "courses_update_own" on courses
  for update using (
    exists (select 1 from tracks t where t.id = courses.track_id and t.user_id = auth.uid()::text)
  ) with check (
    exists (select 1 from tracks t where t.id = courses.track_id and t.user_id = auth.uid()::text)
  );

drop policy if exists "courses_delete_own" on courses;
create policy "courses_delete_own" on courses
  for delete using (
    exists (select 1 from tracks t where t.id = courses.track_id and t.user_id = auth.uid()::text)
  );

-- ─── RESOURCES (scoped via course → track) ─────────────────
drop policy if exists "resources_select_own" on resources;
create policy "resources_select_own" on resources
  for select using (
    exists (
      select 1 from courses c join tracks t on t.id = c.track_id
      where c.id = resources.course_id and t.user_id = auth.uid()::text
    )
  );

drop policy if exists "resources_insert_own" on resources;
create policy "resources_insert_own" on resources
  for insert with check (
    exists (
      select 1 from courses c join tracks t on t.id = c.track_id
      where c.id = resources.course_id and t.user_id = auth.uid()::text
    )
  );

drop policy if exists "resources_update_own" on resources;
create policy "resources_update_own" on resources
  for update using (
    exists (
      select 1 from courses c join tracks t on t.id = c.track_id
      where c.id = resources.course_id and t.user_id = auth.uid()::text
    )
  ) with check (
    exists (
      select 1 from courses c join tracks t on t.id = c.track_id
      where c.id = resources.course_id and t.user_id = auth.uid()::text
    )
  );

drop policy if exists "resources_delete_own" on resources;
create policy "resources_delete_own" on resources
  for delete using (
    exists (
      select 1 from courses c join tracks t on t.id = c.track_id
      where c.id = resources.course_id and t.user_id = auth.uid()::text
    )
  );

-- ─── TASKS ──────────────────────────────────────────────────
drop policy if exists "tasks_select_own" on tasks;
create policy "tasks_select_own" on tasks
  for select using (auth.uid()::text = user_id);

drop policy if exists "tasks_insert_own" on tasks;
create policy "tasks_insert_own" on tasks
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "tasks_update_own" on tasks;
create policy "tasks_update_own" on tasks
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "tasks_delete_own" on tasks;
create policy "tasks_delete_own" on tasks
  for delete using (auth.uid()::text = user_id);

-- ─── NOTES ──────────────────────────────────────────────────
drop policy if exists "notes_select_own" on notes;
create policy "notes_select_own" on notes
  for select using (auth.uid()::text = user_id);

drop policy if exists "notes_insert_own" on notes;
create policy "notes_insert_own" on notes
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "notes_update_own" on notes;
create policy "notes_update_own" on notes
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "notes_delete_own" on notes;
create policy "notes_delete_own" on notes
  for delete using (auth.uid()::text = user_id);

-- ─── STUDY SESSIONS ────────────────────────────────────────
drop policy if exists "study_sessions_select_own" on study_sessions;
create policy "study_sessions_select_own" on study_sessions
  for select using (auth.uid()::text = user_id);

drop policy if exists "study_sessions_insert_own" on study_sessions;
create policy "study_sessions_insert_own" on study_sessions
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "study_sessions_update_own" on study_sessions;
create policy "study_sessions_update_own" on study_sessions
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "study_sessions_delete_own" on study_sessions;
create policy "study_sessions_delete_own" on study_sessions
  for delete using (auth.uid()::text = user_id);

-- ─── HABITS ────────────────────────────────────────────────
drop policy if exists "habits_select_own" on habits;
create policy "habits_select_own" on habits
  for select using (auth.uid()::text = user_id);

drop policy if exists "habits_insert_own" on habits;
create policy "habits_insert_own" on habits
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "habits_update_own" on habits;
create policy "habits_update_own" on habits
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "habits_delete_own" on habits;
create policy "habits_delete_own" on habits
  for delete using (auth.uid()::text = user_id);

-- ─── HABIT COMPLETIONS (scoped via parent habit) ───────────
drop policy if exists "habit_completions_select_own" on habit_completions;
create policy "habit_completions_select_own" on habit_completions
  for select using (
    exists (select 1 from habits h where h.id = habit_completions.habit_id and h.user_id = auth.uid()::text)
  );

drop policy if exists "habit_completions_insert_own" on habit_completions;
create policy "habit_completions_insert_own" on habit_completions
  for insert with check (
    exists (select 1 from habits h where h.id = habit_completions.habit_id and h.user_id = auth.uid()::text)
  );

drop policy if exists "habit_completions_update_own" on habit_completions;
create policy "habit_completions_update_own" on habit_completions
  for update using (
    exists (select 1 from habits h where h.id = habit_completions.habit_id and h.user_id = auth.uid()::text)
  ) with check (
    exists (select 1 from habits h where h.id = habit_completions.habit_id and h.user_id = auth.uid()::text)
  );

drop policy if exists "habit_completions_delete_own" on habit_completions;
create policy "habit_completions_delete_own" on habit_completions
  for delete using (
    exists (select 1 from habits h where h.id = habit_completions.habit_id and h.user_id = auth.uid()::text)
  );

-- ─── USER FOCUS ────────────────────────────────────────────
drop policy if exists "user_focus_courses_select_own" on user_focus_courses;
create policy "user_focus_courses_select_own" on user_focus_courses
  for select using (auth.uid()::text = user_id);

drop policy if exists "user_focus_courses_insert_own" on user_focus_courses;
create policy "user_focus_courses_insert_own" on user_focus_courses
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "user_focus_courses_update_own" on user_focus_courses;
create policy "user_focus_courses_update_own" on user_focus_courses
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "user_focus_courses_delete_own" on user_focus_courses;
create policy "user_focus_courses_delete_own" on user_focus_courses
  for delete using (auth.uid()::text = user_id);

drop policy if exists "user_focus_tasks_select_own" on user_focus_tasks;
create policy "user_focus_tasks_select_own" on user_focus_tasks
  for select using (auth.uid()::text = user_id);

drop policy if exists "user_focus_tasks_insert_own" on user_focus_tasks;
create policy "user_focus_tasks_insert_own" on user_focus_tasks
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "user_focus_tasks_update_own" on user_focus_tasks;
create policy "user_focus_tasks_update_own" on user_focus_tasks
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "user_focus_tasks_delete_own" on user_focus_tasks;
create policy "user_focus_tasks_delete_own" on user_focus_tasks
  for delete using (auth.uid()::text = user_id);
