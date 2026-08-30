"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  CheckSquare,
  Target,
  ClipboardCheck,
  Library,
  PenLine,
  Calendar as CalendarIcon,
  BookOpen,
  FolderKanban,
  Settings2,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import FetchErrorBanner from "@/components/ui/FetchErrorBanner";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";

type SessionStats = {
  totalSessions: number;
  totalHours: number;
  prevTotalHours: number;
  trendDeltaHours: number;
};
type Task = { id: string; title: string; status: string; priority: string };
type Habit = {
  id: string;
  name: string;
  completions?: { completedDate: string }[];
  targetDays?: number[];
};
type ExamStats = { totalSessions: number; accuracy: number };
type Resource = { id: string; title: string; createdAt: string; url: string | null };
type Note = {
  id: string;
  title: string;
  content: string;
  noteType: string | null;
  createdAt: string;
};
type CalendarEvent = {
  id: string;
  title: string;
  startTime: string | null;
  eventType: string;
};
type FocusCourse = {
  id: string;
  title: string;
  code: string | null;
  status: string;
  track: { title: string; color: string };
  studyHours7d: number;
  taskCount: number;
};
type FocusProject = {
  id: string;
  title: string;
  status: string;
  priority: string;
  course?: {
    title: string;
    code: string | null;
    track?: { title: string; color: string };
  } | null;
};

export default function Dashboard() {
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [focusCourses, setFocusCourses] = useState<FocusCourse[]>([]);
  const [focusProjects, setFocusProjects] = useState<FocusProject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [examStats, setExamStats] = useState<ExamStats | null>(null);
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [lastJournal, setLastJournal] = useState<Note | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const horizon = new Date();
      horizon.setDate(horizon.getDate() + 14);

      const [
        sessionsRes,
        focusRes,
        tasksRes,
        habitsRes,
        examRes,
        resourcesRes,
        notesRes,
        eventsRes,
      ] = await Promise.all([
        fetch("/api/sessions?days=7"),
        fetch("/api/focus"),
        fetch("/api/tasks"),
        fetch("/api/habits"),
        fetch("/api/exam-practice"),
        fetch("/api/resources"),
        fetch("/api/notes"),
        fetch(
          `/api/calendar-events?from=${encodeURIComponent(now.toISOString())}&to=${encodeURIComponent(horizon.toISOString())}`
        ),
      ]);

      const failed = [
        sessionsRes,
        focusRes,
        tasksRes,
        habitsRes,
        examRes,
        resourcesRes,
        notesRes,
        eventsRes,
      ].filter((r) => !r.ok);
      if (failed.length === 8) {
        setError("Could not reach the server. Check your connection and sign in again.");
        return;
      }
      if (failed.length > 0) {
        setError("Some dashboard data could not be loaded. Showing partial results.");
      }

      if (sessionsRes.ok)
        setSessionStats((await sessionsRes.json()).stats);
      if (focusRes.ok) {
        const focus = await focusRes.json();
        setFocusCourses(focus.courses ?? []);
        setFocusProjects(focus.projects ?? []);
      }
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (habitsRes.ok) setHabits(await habitsRes.json());
      if (examRes.ok) setExamStats((await examRes.json()).stats);
      if (resourcesRes.ok) {
        const all: Resource[] = await resourcesRes.json();
        setRecentResources(all.slice(0, 5));
      }
      if (notesRes.ok) {
        const all: Note[] = await notesRes.json();
        const j = all.find((n) => n.noteType === "JOURNAL");
        setLastJournal(j ?? null);
      }
      if (eventsRes.ok) {
        const evs: CalendarEvent[] = await eventsRes.json();
        setUpcomingEvents(evs.slice(0, 3));
      }
    } catch {
      setError("Could not load dashboard. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    function onFocusChanged() {
      fetch("/api/focus")
        .then((r) => (r.ok ? r.json() : null))
        .then((focus) => {
          if (focus) {
            setFocusCourses(focus.courses ?? []);
            setFocusProjects(focus.projects ?? []);
          }
        })
        .catch(() => {});
    }
    window.addEventListener("heartwire:focus-changed", onFocusChanged);
    return () =>
      window.removeEventListener("heartwire:focus-changed", onFocusChanged);
  }, [load]);

  const openTasks = tasks.filter((t) => t.status !== "DONE").length;
  const dueToday = tasks.filter((t) => {
    if (t.status === "DONE") return false;
    const dueAny = (t as Task & { dueDate?: string | null }).dueDate;
    if (!dueAny) return false;
    const d = new Date(dueAny);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }).length;
  const habitCompletion = computeHabitWeekRate(habits);
  const isEmptyWorkspace =
    !loading &&
    !error &&
    (sessionStats?.totalSessions ?? 0) === 0 &&
    habits.length === 0 &&
    tasks.length === 0 &&
    focusCourses.length === 0;

  return (
    <div className="max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[color:var(--hw-text)]">
          Dashboard
        </h1>
        <p className="text-sm text-[color:var(--hw-muted)]">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      {error && (
        <FetchErrorBanner message={error} onRetry={load} />
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : error && (sessionStats === null && tasks.length === 0) ? null : (
        <>
          {isEmptyWorkspace && (
            <div className="border border-hw-sky/30 rounded-lg p-6 bg-hw-sky/5">
              <EmptyState
                icon={Clock}
                title="Welcome — let's get studying"
                description="Log your first session or add a habit to start building momentum."
                action={{ href: "/tracking/study-hours", label: "Start a study session" }}
              />
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <Link
                  href="/habits"
                  className="px-3 py-2 text-sm rounded-lg border border-[color:var(--hw-border)] hover:bg-hw-sky/5"
                >
                  Add a habit
                </Link>
                <Link
                  href="/settings"
                  className="px-3 py-2 text-sm rounded-lg border border-[color:var(--hw-border)] hover:bg-hw-sky/5"
                >
                  Pick focus courses
                </Link>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat
              label="Study (7d)"
              value={sessionStats ? `${sessionStats.totalHours}h` : "—"}
              hint={
                sessionStats
                  ? `${sessionStats.trendDeltaHours >= 0 ? "+" : ""}${sessionStats.trendDeltaHours}h vs prior`
                  : ""
              }
              icon={<Clock className="w-4 h-4" />}
            />
            <Stat
              label="Tasks open"
              value={String(openTasks)}
              hint={dueToday > 0 ? `${dueToday} due today` : "—"}
              icon={<CheckSquare className="w-4 h-4" />}
            />
            <Stat
              label="Habits this week"
              value={habits.length === 0 ? "—" : `${habitCompletion}%`}
              hint={habits.length === 0 ? "Add a habit" : undefined}
              icon={<Target className="w-4 h-4" />}
            />
            <Stat
              label="FE/PE accuracy"
              value={examStats ? `${examStats.accuracy}%` : "—"}
              hint={
                examStats ? `${examStats.totalSessions} sessions` : "no data"
              }
              icon={<ClipboardCheck className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Section
              title="Focus courses"
              icon={<BookOpen className="w-4 h-4" />}
              link={{ href: "/settings", label: "Edit focus" }}
            >
              {focusCourses.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No focus courses yet"
                  description="Highlight up to 5 courses on your dashboard."
                  action={{ href: "/settings", label: "Pick your focus" }}
                />
              ) : (
                <ul className="space-y-2">
                  {focusCourses.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/courses/${c.id}`}
                          className="text-gray-900 dark:text-white hover:text-primary truncate block"
                        >
                          {c.code && (
                            <span className="text-gray-400 mr-1">{c.code}</span>
                          )}
                          {c.title}
                        </Link>
                        <span className="text-[11px] text-gray-500">
                          {c.track.title} · {c.status.replace(/_/g, " ").toLowerCase()}
                        </span>
                      </div>
                      <span className="text-xs tabular-nums text-primary shrink-0">
                        {c.studyHours7d}h
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section
              title="Focus projects"
              icon={<FolderKanban className="w-4 h-4" />}
              link={{ href: "/projects", label: "All projects" }}
            >
              {focusProjects.length === 0 ? (
                <EmptyState
                  icon={FolderKanban}
                  title="No focus projects"
                  description="Pin active projects to track progress here."
                  action={{ href: "/settings", label: "Pick your focus" }}
                />
              ) : (
                <ul className="space-y-2">
                  {focusProjects.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <div className="min-w-0">
                        <Link
                          href="/projects"
                          className="text-gray-900 dark:text-white hover:text-primary truncate block"
                        >
                          {p.title}
                        </Link>
                        {p.course && (
                          <span className="text-[11px] text-gray-500">
                            {p.course.code || p.course.title}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                          p.status === "IN_PROGRESS"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : p.status === "DONE"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {p.status === "IN_PROGRESS"
                          ? "Active"
                          : p.status === "DONE"
                          ? "Done"
                          : "To do"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Section
              title="Recent resources"
              icon={<Library className="w-4 h-4" />}
              link={{ href: "/resources", label: "All resources" }}
            >
              {recentResources.length === 0 ? (
                <EmptyState
                  icon={Library}
                  title="No resources saved"
                  description="Bookmark repos, PDFs, and links as you study."
                  action={{ href: "/resources", label: "Browse resources" }}
                />
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentResources.map((r) => (
                    <li key={r.id} className="py-1.5">
                      {r.url ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-900 dark:text-white hover:text-primary truncate block"
                        >
                          {r.title}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-900 dark:text-white truncate block">
                          {r.title}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section
              title="Last journal"
              icon={<PenLine className="w-4 h-4" />}
              link={{ href: "/tracking/journal", label: "All entries" }}
            >
              {!lastJournal ? (
                <EmptyState
                  icon={PenLine}
                  title="No journal entries"
                  description="Reflect on what you learned today."
                  action={{ href: "/tracking/journal", label: "Write an entry" }}
                />
              ) : (
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {lastJournal.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(lastJournal.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-3">
                    {lastJournal.content}
                  </p>
                </div>
              )}
            </Section>

            <Section
              title="Upcoming"
              icon={<CalendarIcon className="w-4 h-4" />}
              link={{ href: "/calendar", label: "Open calendar" }}
            >
              {upcomingEvents.length === 0 ? (
                <EmptyState
                  icon={CalendarIcon}
                  title="Nothing scheduled"
                  description="Add exams, deadlines, and study blocks."
                  action={{ href: "/calendar", label: "Open calendar" }}
                />
              ) : (
                <ul className="space-y-1.5">
                  {upcomingEvents.map((e) => (
                    <li key={e.id} className="text-sm flex justify-between gap-2">
                      <span className="text-gray-900 dark:text-white truncate">
                        {e.title}
                      </span>
                      <span className="text-[11px] text-gray-500 tabular-nums shrink-0">
                        {e.startTime
                          ? new Date(e.startTime).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/tracking/study-hours"
              className="px-3 py-2 text-sm rounded-lg border border-[color:var(--hw-border)] hover:bg-hw-sky/5 min-h-[44px] inline-flex items-center"
            >
              Log study session
            </Link>
            <Link
              href="/tracking/study-hours?retro=1"
              className="px-3 py-2 text-sm rounded-lg border border-[color:var(--hw-border)] hover:bg-hw-sky/5 inline-flex items-center gap-1.5 min-h-[44px]"
            >
              <Settings2 className="w-3.5 h-3.5" aria-hidden />
              Log past session
            </Link>
            <Link
              href="/habits"
              className="px-3 py-2 text-sm rounded-lg border border-[color:var(--hw-border)] hover:bg-hw-sky/5 min-h-[44px] inline-flex items-center"
            >
              Add a habit
            </Link>
            <Link
              href="/tracking/fe-pe"
              className="px-3 py-2 text-sm rounded-lg border border-[color:var(--hw-border)] hover:bg-hw-sky/5 min-h-[44px] inline-flex items-center"
            >
              Log FE/PE practice
            </Link>
            <Link
              href="/tracking/journal"
              className="px-3 py-2 text-sm rounded-lg border border-[color:var(--hw-border)] hover:bg-hw-sky/5 min-h-[44px] inline-flex items-center"
            >
              New journal entry
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function computeHabitWeekRate(habits: Habit[]): number {
  if (habits.length === 0) return 0;
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  let target = 0;
  let done = 0;
  for (const h of habits) {
    const targetDays = new Set(h.targetDays ?? [0, 1, 2, 3, 4, 5, 6]);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      if (!targetDays.has(d.getDay())) continue;
      target += 1;
      const ymd = d.toISOString().slice(0, 10);
      if (h.completions?.some((c) => c.completedDate.slice(0, 10) === ymd)) {
        done += 1;
      }
    }
  }
  return target > 0 ? Math.round((done / target) * 100) : 0;
}

function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="border border-[color:var(--hw-border)] rounded-lg p-3 bg-[color:var(--hw-surface)]">
      <div className="flex items-center gap-2 text-xs text-[color:var(--hw-muted)] mb-1">
        {icon}
        {label}
      </div>
      <p className="text-xl font-bold text-[color:var(--hw-text)] tabular-nums">
        {value}
      </p>
      {hint && <p className="text-[11px] text-[color:var(--hw-muted)] mt-0.5">{hint}</p>}
    </div>
  );
}

function Section({
  title,
  icon,
  link,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  link?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="border border-[color:var(--hw-border)] rounded-lg p-3 bg-[color:var(--hw-surface)]">
      <header className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--hw-muted)]">
          {icon}
          {title}
        </div>
        {link && (
          <Link
            href={link.href}
            className="text-[11px] text-hw-sky hover:underline"
          >
            {link.label}
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}
