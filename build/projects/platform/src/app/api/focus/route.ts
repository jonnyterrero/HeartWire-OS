import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError, BadRequestError, parseJsonBody } from "@/lib/api";

const MAX_FOCUS_COURSES = 5;
const MAX_FOCUS_TASKS = 3;
const STATS_DAYS = 7;

function parseIdList(value: unknown, field: string, max: number): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new BadRequestError(`${field} must be an array of ids`);
  }
  if (value.length > max) {
    throw new BadRequestError(`${field} may contain at most ${max} items`);
  }
  const ids: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !item.trim()) {
      throw new BadRequestError(`${field} must contain non-empty string ids`);
    }
    ids.push(item.trim());
  }
  if (new Set(ids).size !== ids.length) {
    throw new BadRequestError(`${field} must not contain duplicate ids`);
  }
  return ids;
}

export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const since = new Date();
    since.setDate(since.getDate() - STATS_DAYS);

    const [focusCourses, focusTasks, courseSessions] = await Promise.all([
      prisma.userFocusCourse.findMany({
        where: { userId: user!.id },
        orderBy: { sortOrder: "asc" },
        include: {
          course: {
            include: {
              track: { select: { title: true, color: true } },
              _count: { select: { tasks: true, resources: true } },
            },
          },
        },
      }),
      prisma.userFocusTask.findMany({
        where: { userId: user!.id },
        orderBy: { sortOrder: "asc" },
        include: {
          task: {
            include: {
              course: {
                select: {
                  title: true,
                  code: true,
                  track: { select: { title: true, color: true } },
                },
              },
            },
          },
        },
      }),
      prisma.studySession.findMany({
        where: {
          userId: user!.id,
          deletedAt: null,
          date: { gte: since },
          courseId: { not: null },
        },
        select: { courseId: true, duration: true, durationMinutes: true },
      }),
    ]);

    const minutesByCourse = new Map<string, number>();
    for (const s of courseSessions) {
      if (!s.courseId) continue;
      const mins = s.durationMinutes ?? s.duration ?? 0;
      minutesByCourse.set(
        s.courseId,
        (minutesByCourse.get(s.courseId) ?? 0) + mins
      );
    }

    const courses = focusCourses.map((fc) => ({
      id: fc.course.id,
      title: fc.course.title,
      code: fc.course.code,
      status: fc.course.status,
      track: fc.course.track,
      taskCount: fc.course._count.tasks,
      resourceCount: fc.course._count.resources,
      studyMinutes7d: minutesByCourse.get(fc.course.id) ?? 0,
      studyHours7d: +((minutesByCourse.get(fc.course.id) ?? 0) / 60).toFixed(1),
    }));

    const projects = focusTasks.map((ft) => ({
      id: ft.task.id,
      title: ft.task.title,
      status: ft.task.status,
      priority: ft.task.priority,
      course: ft.task.course,
    }));

    return NextResponse.json({
      courses,
      projects,
      limits: { maxCourses: MAX_FOCUS_COURSES, maxProjects: MAX_FOCUS_TASKS },
    });
  } catch (err) {
    return apiError(err, "focus.get");
  }
}

export async function PUT(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;
  try {
    const body = await parseJsonBody(request);
    const courseIds = parseIdList(body.courseIds, "courseIds", MAX_FOCUS_COURSES);
    const taskIds = parseIdList(body.taskIds, "taskIds", MAX_FOCUS_TASKS);

    if (courseIds.length > 0) {
      const owned = await prisma.course.findMany({
        where: { id: { in: courseIds }, track: { userId: user!.id } },
        select: { id: true },
      });
      if (owned.length !== courseIds.length) {
        throw new BadRequestError("One or more courses were not found");
      }
    }

    if (taskIds.length > 0) {
      const owned = await prisma.task.findMany({
        where: { id: { in: taskIds }, userId: user!.id },
        select: { id: true },
      });
      if (owned.length !== taskIds.length) {
        throw new BadRequestError("One or more projects were not found");
      }
    }

    await prisma.$transaction([
      prisma.userFocusCourse.deleteMany({ where: { userId: user!.id } }),
      prisma.userFocusTask.deleteMany({ where: { userId: user!.id } }),
      ...(courseIds.length > 0
        ? [
            prisma.userFocusCourse.createMany({
              data: courseIds.map((courseId, i) => ({
                userId: user!.id,
                courseId,
                sortOrder: i,
              })),
            }),
          ]
        : []),
      ...(taskIds.length > 0
        ? [
            prisma.userFocusTask.createMany({
              data: taskIds.map((taskId, i) => ({
                userId: user!.id,
                taskId,
                sortOrder: i,
              })),
            }),
          ]
        : []),
    ]);

    return GET();
  } catch (err) {
    return apiError(err, "focus.put");
  }
}
