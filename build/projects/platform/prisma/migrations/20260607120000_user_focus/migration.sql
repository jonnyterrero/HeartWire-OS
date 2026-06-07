-- CreateTable
CREATE TABLE "user_focus_courses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_focus_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_focus_tasks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_focus_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_focus_courses_user_id_idx" ON "user_focus_courses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_focus_courses_user_id_course_id_key" ON "user_focus_courses"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "user_focus_tasks_user_id_idx" ON "user_focus_tasks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_focus_tasks_user_id_task_id_key" ON "user_focus_tasks"("user_id", "task_id");

-- AddForeignKey
ALTER TABLE "user_focus_courses" ADD CONSTRAINT "user_focus_courses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_focus_courses" ADD CONSTRAINT "user_focus_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_focus_tasks" ADD CONSTRAINT "user_focus_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_focus_tasks" ADD CONSTRAINT "user_focus_tasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
