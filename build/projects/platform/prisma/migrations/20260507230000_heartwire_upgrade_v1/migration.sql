-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('GITHUB_REPO', 'PDF', 'WEBSITE', 'YOUTUBE_VIDEO', 'YOUTUBE_PLAYLIST', 'BOOK', 'DOCUMENTATION', 'ARTICLE', 'COURSE', 'OTHER');

-- DropForeignKey
ALTER TABLE "habit_completions" DROP CONSTRAINT "habit_completions_habit_id_fkey";

-- DropForeignKey
ALTER TABLE "habits" DROP CONSTRAINT "habits_user_id_fkey";

-- DropForeignKey
ALTER TABLE "resources" DROP CONSTRAINT "resources_course_id_fkey";

-- DropIndex
DROP INDEX "idx_habit_completions_date";

-- DropIndex
DROP INDEX "idx_habit_completions_habit_id";

-- AlterTable
ALTER TABLE "habit_completions" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "habits" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "client_updated_at" TIMESTAMP(3),
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "energy_score" INTEGER,
ADD COLUMN     "journal_date" TIMESTAMP(3),
ADD COLUMN     "mood_score" INTEGER,
ADD COLUMN     "note_type" TEXT,
ADD COLUMN     "sync_version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "resources" ADD COLUMN     "client_updated_at" TIMESTAMP(3),
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "file_path" TEXT,
ADD COLUMN     "is_favorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resource_type" "ResourceType",
ADD COLUMN     "source_platform" TEXT,
ADD COLUMN     "sync_version" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "track_id" TEXT,
ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "type" SET DEFAULT 'ARTICLE',
ALTER COLUMN "course_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "study_sessions" ADD COLUMN     "client_updated_at" TIMESTAMP(3),
ADD COLUMN     "course_id" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "duration_minutes" INTEGER,
ADD COLUMN     "ended_at" TIMESTAMP(3),
ADD COLUMN     "energy_score" INTEGER,
ADD COLUMN     "focus_score" INTEGER,
ADD COLUMN     "session_type" TEXT,
ADD COLUMN     "started_at" TIMESTAMP(3),
ADD COLUMN     "sync_version" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "track_id" TEXT;

-- CreateTable
CREATE TABLE "exam_practice_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "track_id" TEXT,
    "exam_type" TEXT NOT NULL,
    "discipline" TEXT,
    "topic" TEXT,
    "source" TEXT,
    "questions_attempted" INTEGER,
    "questions_correct" INTEGER,
    "duration_minutes" INTEGER,
    "notes" TEXT,
    "session_date" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_practice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_tags" (
    "resource_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "resource_tags_pkey" PRIMARY KEY ("resource_id","tag_id")
);

-- CreateTable
CREATE TABLE "note_tags" (
    "note_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "note_tags_pkey" PRIMARY KEY ("note_id","tag_id")
);

-- CreateTable
CREATE TABLE "task_tags" (
    "task_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "task_tags_pkey" PRIMARY KEY ("task_id","tag_id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_type" TEXT NOT NULL,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "linked_entity_type" TEXT,
    "linked_entity_id" TEXT,
    "track_id" TEXT,
    "course_id" TEXT,
    "task_id" TEXT,
    "habit_id" TEXT,
    "study_session_id" TEXT,
    "exam_practice_session_id" TEXT,
    "recurrence_rule" TEXT,
    "reminder_minutes_before" INTEGER,
    "color" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_practice_sessions_user_id_idx" ON "exam_practice_sessions"("user_id");

-- CreateIndex
CREATE INDEX "exam_practice_sessions_track_id_idx" ON "exam_practice_sessions"("track_id");

-- CreateIndex
CREATE INDEX "exam_practice_sessions_session_date_idx" ON "exam_practice_sessions"("session_date");

-- CreateIndex
CREATE INDEX "exam_practice_sessions_deleted_at_idx" ON "exam_practice_sessions"("deleted_at");

-- CreateIndex
CREATE INDEX "tags_user_id_idx" ON "tags"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_user_id_name_key" ON "tags"("user_id", "name");

-- CreateIndex
CREATE INDEX "resource_tags_tag_id_idx" ON "resource_tags"("tag_id");

-- CreateIndex
CREATE INDEX "note_tags_tag_id_idx" ON "note_tags"("tag_id");

-- CreateIndex
CREATE INDEX "task_tags_tag_id_idx" ON "task_tags"("tag_id");

-- CreateIndex
CREATE INDEX "calendar_events_user_id_idx" ON "calendar_events"("user_id");

-- CreateIndex
CREATE INDEX "calendar_events_track_id_idx" ON "calendar_events"("track_id");

-- CreateIndex
CREATE INDEX "calendar_events_start_time_idx" ON "calendar_events"("start_time");

-- CreateIndex
CREATE INDEX "calendar_events_event_type_idx" ON "calendar_events"("event_type");

-- CreateIndex
CREATE INDEX "calendar_events_deleted_at_idx" ON "calendar_events"("deleted_at");

-- CreateIndex
CREATE INDEX "notes_note_type_idx" ON "notes"("note_type");

-- CreateIndex
CREATE INDEX "notes_journal_date_idx" ON "notes"("journal_date");

-- CreateIndex
CREATE INDEX "notes_deleted_at_idx" ON "notes"("deleted_at");

-- CreateIndex
CREATE INDEX "resources_user_id_idx" ON "resources"("user_id");

-- CreateIndex
CREATE INDEX "resources_track_id_idx" ON "resources"("track_id");

-- CreateIndex
CREATE INDEX "resources_resource_type_idx" ON "resources"("resource_type");

-- CreateIndex
CREATE INDEX "resources_deleted_at_idx" ON "resources"("deleted_at");

-- CreateIndex
CREATE INDEX "resources_created_at_idx" ON "resources"("created_at");

-- CreateIndex
CREATE INDEX "study_sessions_track_id_idx" ON "study_sessions"("track_id");

-- CreateIndex
CREATE INDEX "study_sessions_started_at_idx" ON "study_sessions"("started_at");

-- CreateIndex
CREATE INDEX "study_sessions_deleted_at_idx" ON "study_sessions"("deleted_at");

-- CreateIndex
CREATE INDEX "tasks_due_date_idx" ON "tasks"("due_date");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_practice_sessions" ADD CONSTRAINT "exam_practice_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_practice_sessions" ADD CONSTRAINT "exam_practice_sessions_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_completions" ADD CONSTRAINT "habit_completions_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_tags" ADD CONSTRAINT "resource_tags_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_tags" ADD CONSTRAINT "resource_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_tags" ADD CONSTRAINT "note_tags_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_tags" ADD CONSTRAINT "note_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_tags" ADD CONSTRAINT "task_tags_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_tags" ADD CONSTRAINT "task_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_study_session_id_fkey" FOREIGN KEY ("study_session_id") REFERENCES "study_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_exam_practice_session_id_fkey" FOREIGN KEY ("exam_practice_session_id") REFERENCES "exam_practice_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_courses_track_id" RENAME TO "courses_track_id_idx";

-- RenameIndex
ALTER INDEX "habit_completions_unique" RENAME TO "habit_completions_habit_id_completed_date_key";

-- RenameIndex
ALTER INDEX "idx_habits_user_id" RENAME TO "habits_user_id_idx";

-- RenameIndex
ALTER INDEX "idx_notes_course_id" RENAME TO "notes_course_id_idx";

-- RenameIndex
ALTER INDEX "idx_notes_user_id" RENAME TO "notes_user_id_idx";

-- RenameIndex
ALTER INDEX "idx_resources_course_id" RENAME TO "resources_course_id_idx";

-- RenameIndex
ALTER INDEX "idx_study_sessions_user_id" RENAME TO "study_sessions_user_id_idx";

-- RenameIndex
ALTER INDEX "idx_tasks_course_id" RENAME TO "tasks_course_id_idx";

-- RenameIndex
ALTER INDEX "idx_tasks_user_id" RENAME TO "tasks_user_id_idx";

-- RenameIndex
ALTER INDEX "idx_tracks_user_id" RENAME TO "tracks_user_id_idx";

