import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const prisma = new PrismaClient();

/**
 * Loads the CSWA + FE + ML/Hardware master-plan seed into HeartWire OS.
 *
 *   SEED_USER_ID=<uuid> npm run db:seed:plan
 *   # or explicitly:
 *   SEED_USER_ID=<uuid> npx tsx scripts/seed-plan.ts [path/to/heartwire-plan-seed.json]
 *
 * Idempotent-ish: skips a milestone/study block if an event with the same
 * (userId, title, eventType) already exists, and a habit if the name exists.
 * Track titles in the JSON are resolved to this user's Track UUIDs. If a track
 * is missing, run /api/seed-defaults (or `npm run db:seed`) first.
 *
 * Timezone: JSON times are America/New_York wall-clock. Set PLAN_TZ_OFFSET to
 * the fixed offset you want applied (default "-05:00" = EST). For summer dates
 * (EDT) pass "-04:00", or just adjust after import — the app stores absolute
 * timestamps. Keeping it simple beats a full tz library for a one-shot seed.
 */
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`ERROR: ${name} is required. Get it from Supabase -> Auth -> Users.`);
    process.exit(1);
  }
  return v;
}

const USER_ID = requireEnv("SEED_USER_ID");
const TZ_OFFSET = process.env.PLAN_TZ_OFFSET ?? "-05:00";
const SEED_PATH = resolve(process.argv[2] ?? "scripts/heartwire-plan-seed.json");

type Milestone = {
  title: string; eventType: string; startTime: string; allDay?: boolean;
  color?: string; trackTitle?: string; reminderMinutesBefore?: number; description?: string;
};
type StudyBlock = Milestone & { endTime?: string; recurrenceRule?: string };
type HabitSeed = { name: string; color?: string; targetDays: number[] };
type ExamTarget = {
  examType: string; discipline?: string; topic?: string; source?: string;
  sessionDate?: string; durationMinutes?: number; questionsAttempted?: number | null;
  questionsCorrect?: number | null; trackTitle?: string; notes?: string;
};
type SeedFile = {
  milestones: Milestone[]; studyBlocks: StudyBlock[]; habits: HabitSeed[]; examTargets: ExamTarget[];
};

/** Turn a naive "YYYY-MM-DDTHH:mm:ss" into an absolute Date at TZ_OFFSET. */
function at(local: string): Date {
  const iso = /[zZ]|[+-]\d\d:\d\d$/.test(local) ? local : `${local}${TZ_OFFSET}`;
  return new Date(iso);
}
/** A date-only "YYYY-MM-DD" anchored to local noon so the calendar day never slips. */
function dateOnly(d: string): Date {
  return new Date(`${d}T12:00:00${TZ_OFFSET}`);
}

async function main() {
  const seed = JSON.parse(readFileSync(SEED_PATH, "utf8")) as SeedFile;

  // Resolve track titles -> ids for this user.
  const tracks = await prisma.track.findMany({
    where: { userId: USER_ID },
    select: { id: true, title: true },
  });
  const trackId = new Map(tracks.map((t) => [t.title, t.id]));
  const resolveTrack = (title?: string): string | null => {
    if (!title) return null;
    const id = trackId.get(title);
    if (!id) console.warn(`  ! track not found: "${title}" (leaving trackId null)`);
    return id ?? null;
  };

  let created = 0, skipped = 0;

  // 1) Milestones + 2) Study blocks -> CalendarEvent
  for (const ev of [...seed.milestones, ...seed.studyBlocks] as StudyBlock[]) {
    const exists = await prisma.calendarEvent.findFirst({
      where: { userId: USER_ID, title: ev.title, eventType: ev.eventType, deletedAt: null },
      select: { id: true },
    });
    if (exists) { skipped++; continue; }
    await prisma.calendarEvent.create({
      data: {
        userId: USER_ID,
        title: ev.title,
        eventType: ev.eventType,
        description: ev.description ?? null,
        startTime: ev.startTime ? at(ev.startTime) : null,
        endTime: ev.endTime ? at(ev.endTime) : null,
        allDay: ev.allDay === true,
        color: ev.color ?? null,
        trackId: resolveTrack(ev.trackTitle),
        recurrenceRule: ev.recurrenceRule ?? null,
        reminderMinutesBefore: ev.reminderMinutesBefore ?? null,
        status: "SCHEDULED",
      },
    });
    created++;
  }

  // 3) Habits
  for (const h of seed.habits) {
    const exists = await prisma.habit.findFirst({
      where: { userId: USER_ID, name: h.name },
      select: { id: true },
    });
    if (exists) { skipped++; continue; }
    await prisma.habit.create({
      data: {
        userId: USER_ID,
        name: h.name,
        color: h.color ?? "blue",
        targetDays: h.targetDays,
      },
    });
    created++;
  }

  // 4) Exam targets -> ExamPracticeSession
  for (const t of seed.examTargets) {
    const exists = await prisma.examPracticeSession.findFirst({
      where: { userId: USER_ID, topic: t.topic ?? undefined, examType: t.examType, deletedAt: null },
      select: { id: true },
    });
    if (exists) { skipped++; continue; }
    await prisma.examPracticeSession.create({
      data: {
        userId: USER_ID,
        examType: t.examType,
        discipline: t.discipline ?? null,
        topic: t.topic ?? null,
        source: t.source ?? null,
        questionsAttempted: t.questionsAttempted ?? null,
        questionsCorrect: t.questionsCorrect ?? null,
        durationMinutes: t.durationMinutes ?? null,
        notes: t.notes ?? null,
        sessionDate: t.sessionDate ? dateOnly(t.sessionDate) : null,
        trackId: resolveTrack(t.trackTitle),
      },
    });
    created++;
  }

  console.log(`\nSeed complete for user ${USER_ID}`);
  console.log(`  created: ${created}`);
  console.log(`  skipped (already existed): ${skipped}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
