-- ============================================================
-- Row-Level Security + PostgREST lockdown (defense-in-depth)
-- ============================================================
-- The Next.js API uses Prisma with DATABASE_URL (the postgres role), which
-- BYPASSES RLS. These policies exist as a safety net because
-- NEXT_PUBLIC_SUPABASE_ANON_KEY is in the client bundle and PostgREST
-- exposes every public table at /rest/v1/* to anyone holding that key.
--
-- Applied automatically by the Prisma migration
-- `20260828000000_lock_postgrest_and_rls`. Safe to re-run (idempotent).
--
-- Manual apply (if you ever need it):
--   psql "$DIRECT_URL" -f supabase_rls.sql
-- ============================================================

-- ─── Enable RLS on every public table ───────────────────────
alter table if exists public.users                   enable row level security;
alter table if exists public.tracks                  enable row level security;
alter table if exists public.courses                 enable row level security;
alter table if exists public.resources               enable row level security;
alter table if exists public.tasks                   enable row level security;
alter table if exists public.notes                   enable row level security;
alter table if exists public.study_sessions          enable row level security;
alter table if exists public.user_focus_courses      enable row level security;
alter table if exists public.user_focus_tasks        enable row level security;
alter table if exists public.habits                  enable row level security;
alter table if exists public.habit_completions       enable row level security;
alter table if exists public.exam_practice_sessions  enable row level security;
alter table if exists public.tags                    enable row level security;
alter table if exists public.resource_tags           enable row level security;
alter table if exists public.note_tags               enable row level security;
alter table if exists public.task_tags               enable row level security;
alter table if exists public.calendar_events         enable row level security;
alter table if exists public._prisma_migrations      enable row level security;

-- ─── USERS ──────────────────────────────────────────────────
drop policy if exists "users_select_self" on public.users;
create policy "users_select_self" on public.users
  for select using (auth.uid()::text = id);

drop policy if exists "users_update_self" on public.users;
create policy "users_update_self" on public.users
  for update using (auth.uid()::text = id)
  with check (auth.uid()::text = id);

-- ─── TRACKS ─────────────────────────────────────────────────
drop policy if exists "tracks_select_own" on public.tracks;
create policy "tracks_select_own" on public.tracks
  for select using (auth.uid()::text = user_id);

drop policy if exists "tracks_insert_own" on public.tracks;
create policy "tracks_insert_own" on public.tracks
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "tracks_update_own" on public.tracks;
create policy "tracks_update_own" on public.tracks
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "tracks_delete_own" on public.tracks;
create policy "tracks_delete_own" on public.tracks
  for delete using (auth.uid()::text = user_id);

-- ─── COURSES (scoped via parent track) ─────────────────────
drop policy if exists "courses_select_own" on public.courses;
create policy "courses_select_own" on public.courses
  for select using (
    exists (select 1 from public.tracks t where t.id = courses.track_id and t.user_id = auth.uid()::text)
  );

drop policy if exists "courses_insert_own" on public.courses;
create policy "courses_insert_own" on public.courses
  for insert with check (
    exists (select 1 from public.tracks t where t.id = courses.track_id and t.user_id = auth.uid()::text)
  );

drop policy if exists "courses_update_own" on public.courses;
create policy "courses_update_own" on public.courses
  for update using (
    exists (select 1 from public.tracks t where t.id = courses.track_id and t.user_id = auth.uid()::text)
  ) with check (
    exists (select 1 from public.tracks t where t.id = courses.track_id and t.user_id = auth.uid()::text)
  );

drop policy if exists "courses_delete_own" on public.courses;
create policy "courses_delete_own" on public.courses
  for delete using (
    exists (select 1 from public.tracks t where t.id = courses.track_id and t.user_id = auth.uid()::text)
  );

-- ─── RESOURCES (user, track, or course → track) ────────────
-- Library-scoped rows have user_id and a nullable course_id. The old
-- policy only checked course → track, so library rows were uncovered.
drop policy if exists "resources_select_own" on public.resources;
create policy "resources_select_own" on public.resources
  for select using (
    user_id = auth.uid()::text
    or exists (
      select 1 from public.tracks t
      where t.id = resources.track_id and t.user_id = auth.uid()::text
    )
    or exists (
      select 1 from public.courses c
      join public.tracks t on t.id = c.track_id
      where c.id = resources.course_id and t.user_id = auth.uid()::text
    )
  );

drop policy if exists "resources_insert_own" on public.resources;
create policy "resources_insert_own" on public.resources
  for insert with check (
    user_id = auth.uid()::text
    or exists (
      select 1 from public.tracks t
      where t.id = resources.track_id and t.user_id = auth.uid()::text
    )
    or exists (
      select 1 from public.courses c
      join public.tracks t on t.id = c.track_id
      where c.id = resources.course_id and t.user_id = auth.uid()::text
    )
  );

drop policy if exists "resources_update_own" on public.resources;
create policy "resources_update_own" on public.resources
  for update using (
    user_id = auth.uid()::text
    or exists (
      select 1 from public.tracks t
      where t.id = resources.track_id and t.user_id = auth.uid()::text
    )
    or exists (
      select 1 from public.courses c
      join public.tracks t on t.id = c.track_id
      where c.id = resources.course_id and t.user_id = auth.uid()::text
    )
  ) with check (
    user_id = auth.uid()::text
    or exists (
      select 1 from public.tracks t
      where t.id = resources.track_id and t.user_id = auth.uid()::text
    )
    or exists (
      select 1 from public.courses c
      join public.tracks t on t.id = c.track_id
      where c.id = resources.course_id and t.user_id = auth.uid()::text
    )
  );

drop policy if exists "resources_delete_own" on public.resources;
create policy "resources_delete_own" on public.resources
  for delete using (
    user_id = auth.uid()::text
    or exists (
      select 1 from public.tracks t
      where t.id = resources.track_id and t.user_id = auth.uid()::text
    )
    or exists (
      select 1 from public.courses c
      join public.tracks t on t.id = c.track_id
      where c.id = resources.course_id and t.user_id = auth.uid()::text
    )
  );

-- ─── TASKS ──────────────────────────────────────────────────
drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own" on public.tasks
  for select using (auth.uid()::text = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own" on public.tasks
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid()::text = user_id);

-- ─── NOTES ──────────────────────────────────────────────────
drop policy if exists "notes_select_own" on public.notes;
create policy "notes_select_own" on public.notes
  for select using (auth.uid()::text = user_id);

drop policy if exists "notes_insert_own" on public.notes;
create policy "notes_insert_own" on public.notes
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "notes_update_own" on public.notes;
create policy "notes_update_own" on public.notes
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "notes_delete_own" on public.notes;
create policy "notes_delete_own" on public.notes
  for delete using (auth.uid()::text = user_id);

-- ─── STUDY SESSIONS ────────────────────────────────────────
drop policy if exists "study_sessions_select_own" on public.study_sessions;
create policy "study_sessions_select_own" on public.study_sessions
  for select using (auth.uid()::text = user_id);

drop policy if exists "study_sessions_insert_own" on public.study_sessions;
create policy "study_sessions_insert_own" on public.study_sessions
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "study_sessions_update_own" on public.study_sessions;
create policy "study_sessions_update_own" on public.study_sessions
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "study_sessions_delete_own" on public.study_sessions;
create policy "study_sessions_delete_own" on public.study_sessions
  for delete using (auth.uid()::text = user_id);

-- ─── HABITS ────────────────────────────────────────────────
drop policy if exists "habits_select_own" on public.habits;
create policy "habits_select_own" on public.habits
  for select using (auth.uid()::text = user_id);

drop policy if exists "habits_insert_own" on public.habits;
create policy "habits_insert_own" on public.habits
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "habits_update_own" on public.habits;
create policy "habits_update_own" on public.habits
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "habits_delete_own" on public.habits;
create policy "habits_delete_own" on public.habits
  for delete using (auth.uid()::text = user_id);

-- ─── HABIT COMPLETIONS (scoped via parent habit) ───────────
drop policy if exists "habit_completions_select_own" on public.habit_completions;
create policy "habit_completions_select_own" on public.habit_completions
  for select using (
    exists (select 1 from public.habits h where h.id = habit_completions.habit_id and h.user_id = auth.uid()::text)
  );

drop policy if exists "habit_completions_insert_own" on public.habit_completions;
create policy "habit_completions_insert_own" on public.habit_completions
  for insert with check (
    exists (select 1 from public.habits h where h.id = habit_completions.habit_id and h.user_id = auth.uid()::text)
  );

drop policy if exists "habit_completions_update_own" on public.habit_completions;
create policy "habit_completions_update_own" on public.habit_completions
  for update using (
    exists (select 1 from public.habits h where h.id = habit_completions.habit_id and h.user_id = auth.uid()::text)
  ) with check (
    exists (select 1 from public.habits h where h.id = habit_completions.habit_id and h.user_id = auth.uid()::text)
  );

drop policy if exists "habit_completions_delete_own" on public.habit_completions;
create policy "habit_completions_delete_own" on public.habit_completions
  for delete using (
    exists (select 1 from public.habits h where h.id = habit_completions.habit_id and h.user_id = auth.uid()::text)
  );

-- ─── USER FOCUS ────────────────────────────────────────────
drop policy if exists "user_focus_courses_select_own" on public.user_focus_courses;
create policy "user_focus_courses_select_own" on public.user_focus_courses
  for select using (auth.uid()::text = user_id);

drop policy if exists "user_focus_courses_insert_own" on public.user_focus_courses;
create policy "user_focus_courses_insert_own" on public.user_focus_courses
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "user_focus_courses_update_own" on public.user_focus_courses;
create policy "user_focus_courses_update_own" on public.user_focus_courses
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "user_focus_courses_delete_own" on public.user_focus_courses;
create policy "user_focus_courses_delete_own" on public.user_focus_courses
  for delete using (auth.uid()::text = user_id);

drop policy if exists "user_focus_tasks_select_own" on public.user_focus_tasks;
create policy "user_focus_tasks_select_own" on public.user_focus_tasks
  for select using (auth.uid()::text = user_id);

drop policy if exists "user_focus_tasks_insert_own" on public.user_focus_tasks;
create policy "user_focus_tasks_insert_own" on public.user_focus_tasks
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "user_focus_tasks_update_own" on public.user_focus_tasks;
create policy "user_focus_tasks_update_own" on public.user_focus_tasks
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "user_focus_tasks_delete_own" on public.user_focus_tasks;
create policy "user_focus_tasks_delete_own" on public.user_focus_tasks
  for delete using (auth.uid()::text = user_id);

-- ─── EXAM PRACTICE ─────────────────────────────────────────
drop policy if exists "exam_practice_sessions_select_own" on public.exam_practice_sessions;
create policy "exam_practice_sessions_select_own" on public.exam_practice_sessions
  for select using (auth.uid()::text = user_id);

drop policy if exists "exam_practice_sessions_insert_own" on public.exam_practice_sessions;
create policy "exam_practice_sessions_insert_own" on public.exam_practice_sessions
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "exam_practice_sessions_update_own" on public.exam_practice_sessions;
create policy "exam_practice_sessions_update_own" on public.exam_practice_sessions
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "exam_practice_sessions_delete_own" on public.exam_practice_sessions;
create policy "exam_practice_sessions_delete_own" on public.exam_practice_sessions
  for delete using (auth.uid()::text = user_id);

-- ─── TAGS ──────────────────────────────────────────────────
drop policy if exists "tags_select_own" on public.tags;
create policy "tags_select_own" on public.tags
  for select using (auth.uid()::text = user_id);

drop policy if exists "tags_insert_own" on public.tags;
create policy "tags_insert_own" on public.tags
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "tags_update_own" on public.tags;
create policy "tags_update_own" on public.tags
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "tags_delete_own" on public.tags;
create policy "tags_delete_own" on public.tags
  for delete using (auth.uid()::text = user_id);

-- ─── RESOURCE / NOTE / TASK TAGS (both sides owned) ────────
drop policy if exists "resource_tags_select_own" on public.resource_tags;
create policy "resource_tags_select_own" on public.resource_tags
  for select using (
    exists (select 1 from public.tags g where g.id = resource_tags.tag_id and g.user_id = auth.uid()::text)
    and exists (
      select 1 from public.resources r
      where r.id = resource_tags.resource_id
        and (
          r.user_id = auth.uid()::text
          or exists (
            select 1 from public.courses c
            join public.tracks t on t.id = c.track_id
            where c.id = r.course_id and t.user_id = auth.uid()::text
          )
        )
    )
  );

drop policy if exists "resource_tags_insert_own" on public.resource_tags;
create policy "resource_tags_insert_own" on public.resource_tags
  for insert with check (
    exists (select 1 from public.tags g where g.id = resource_tags.tag_id and g.user_id = auth.uid()::text)
    and exists (
      select 1 from public.resources r
      where r.id = resource_tags.resource_id
        and (
          r.user_id = auth.uid()::text
          or exists (
            select 1 from public.courses c
            join public.tracks t on t.id = c.track_id
            where c.id = r.course_id and t.user_id = auth.uid()::text
          )
        )
    )
  );

drop policy if exists "resource_tags_delete_own" on public.resource_tags;
create policy "resource_tags_delete_own" on public.resource_tags
  for delete using (
    exists (select 1 from public.tags g where g.id = resource_tags.tag_id and g.user_id = auth.uid()::text)
  );

drop policy if exists "note_tags_select_own" on public.note_tags;
create policy "note_tags_select_own" on public.note_tags
  for select using (
    exists (select 1 from public.tags g where g.id = note_tags.tag_id and g.user_id = auth.uid()::text)
    and exists (select 1 from public.notes n where n.id = note_tags.note_id and n.user_id = auth.uid()::text)
  );

drop policy if exists "note_tags_insert_own" on public.note_tags;
create policy "note_tags_insert_own" on public.note_tags
  for insert with check (
    exists (select 1 from public.tags g where g.id = note_tags.tag_id and g.user_id = auth.uid()::text)
    and exists (select 1 from public.notes n where n.id = note_tags.note_id and n.user_id = auth.uid()::text)
  );

drop policy if exists "note_tags_delete_own" on public.note_tags;
create policy "note_tags_delete_own" on public.note_tags
  for delete using (
    exists (select 1 from public.tags g where g.id = note_tags.tag_id and g.user_id = auth.uid()::text)
  );

drop policy if exists "task_tags_select_own" on public.task_tags;
create policy "task_tags_select_own" on public.task_tags
  for select using (
    exists (select 1 from public.tags g where g.id = task_tags.tag_id and g.user_id = auth.uid()::text)
    and exists (select 1 from public.tasks t where t.id = task_tags.task_id and t.user_id = auth.uid()::text)
  );

drop policy if exists "task_tags_insert_own" on public.task_tags;
create policy "task_tags_insert_own" on public.task_tags
  for insert with check (
    exists (select 1 from public.tags g where g.id = task_tags.tag_id and g.user_id = auth.uid()::text)
    and exists (select 1 from public.tasks t where t.id = task_tags.task_id and t.user_id = auth.uid()::text)
  );

drop policy if exists "task_tags_delete_own" on public.task_tags;
create policy "task_tags_delete_own" on public.task_tags
  for delete using (
    exists (select 1 from public.tags g where g.id = task_tags.tag_id and g.user_id = auth.uid()::text)
  );

-- ─── CALENDAR EVENTS ───────────────────────────────────────
drop policy if exists "calendar_events_select_own" on public.calendar_events;
create policy "calendar_events_select_own" on public.calendar_events
  for select using (auth.uid()::text = user_id);

drop policy if exists "calendar_events_insert_own" on public.calendar_events;
create policy "calendar_events_insert_own" on public.calendar_events
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "calendar_events_update_own" on public.calendar_events;
create policy "calendar_events_update_own" on public.calendar_events
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "calendar_events_delete_own" on public.calendar_events;
create policy "calendar_events_delete_own" on public.calendar_events
  for delete using (auth.uid()::text = user_id);

-- ─── Close the PostgREST door ──────────────────────────────
-- The app never queries tables via supabase-js (auth only). Revoke table
-- and RPC access from the anon/authenticated keys so a missing policy on a
-- future table fails closed. Prisma (postgres role) is unaffected.
revoke all on all tables in schema public from anon, authenticated, public;
revoke all on all sequences in schema public from anon, authenticated, public;
revoke all on all functions in schema public from anon, authenticated, public;

alter default privileges in schema public revoke all on tables from anon, authenticated, public;
alter default privileges in schema public revoke all on sequences from anon, authenticated, public;
alter default privileges in schema public revoke all on functions from anon, authenticated, public;

-- Leftover sync RPC: SECURITY DEFINER, executable by anon, and the
-- `user_id <> auth.uid()` guard is NULL-safe so unauthenticated calls skip
-- the ownership check. The Next.js app does not call it — drop it.
drop function if exists public.upsert_resource_guarded(public.resources);
