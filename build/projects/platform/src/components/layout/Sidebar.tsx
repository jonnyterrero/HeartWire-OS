"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  BookOpen,
  Library,
  Github,
  FileText,
  Globe,
  Youtube,
  Target,
  Moon,
  Sun,
  LogOut,
  Clock,
  GraduationCap,
  ClipboardCheck,
  PenLine,
  Code2,
  Dna,
  BookMarked,
  Layers,
  Settings as SettingsIcon,
} from "lucide-react";
import clsx from "clsx";
import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { TRACK_GROUPS, type TrackGroup } from "@/lib/track-groups";

type DbTrack = {
  id: string;
  title: string;
  color: string;
  _count: { courses: number };
};
type ResolvedGroup = TrackGroup & {
  dbTracks: DbTrack[];
  totalCourses: number;
};

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [groups, setGroups] = useState<ResolvedGroup[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  useEffect(() => {
    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadTracks() {
      try {
        let dbTracks: DbTrack[] = await fetch("/api/tracks").then((r) =>
          r.ok ? r.json() : []
        );
        // First-run convenience: if the user has no tracks at all, seed the
        // defaults so the sidebar populates immediately. Idempotent on the
        // server side.
        if (Array.isArray(dbTracks) && dbTracks.length === 0) {
          const seed = await fetch("/api/seed-defaults", { method: "POST" });
          if (seed.ok) {
            dbTracks = await fetch("/api/tracks").then((r) =>
              r.ok ? r.json() : []
            );
          }
        }
        if (cancelled) return;
        const resolved = TRACK_GROUPS.map((group) => {
          const matching = (dbTracks ?? []).filter((t) =>
            group.dbTrackTitles.includes(t.title)
          );
          return {
            ...group,
            dbTracks: matching,
            totalCourses: matching.reduce(
              (sum, t) => sum + (t._count?.courses || 0),
              0
            ),
          };
        });
        setGroups(resolved);
        setLoaded(true);
      } catch {
        if (!cancelled) {
          // Fall back to the static group list so the sidebar still renders.
          setGroups(
            TRACK_GROUPS.map((g) => ({ ...g, dbTracks: [], totalCourses: 0 }))
          );
          setLoaded(true);
        }
      }
    }
    loadTracks();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const trackingItems = [
    { name: "Study Hours", href: "/tracking/study-hours", icon: Clock },
    { name: "Self-Study Courses", href: "/tracking/courses", icon: GraduationCap },
    { name: "FE/PE Practice", href: "/tracking/fe-pe", icon: ClipboardCheck },
    { name: "LeetCode", href: "/tracking/leetcode", icon: Code2 },
    { name: "Rosalind", href: "/tracking/rosalind", icon: Dna },
    { name: "Textbooks", href: "/tracking/textbooks", icon: BookMarked },
    { name: "Projects", href: "/tracking/projects", icon: Layers },
    { name: "Habits", href: "/tracking/habits", icon: Target },
    { name: "Journal", href: "/tracking/journal", icon: PenLine },
  ];
  const libraryItems = [
    { name: "GitHub Repos", href: "/library/github", icon: Github },
    { name: "PDFs", href: "/library/pdfs", icon: FileText },
    { name: "Websites", href: "/library/websites", icon: Globe },
    { name: "YouTube", href: "/library/youtube", icon: Youtube },
  ];

  const isCalendarActive =
    pathname === "/calendar" || pathname === "/planner";

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#F7F7F5] dark:bg-[#202020] border-r border-gray-200 dark:border-gray-800 flex flex-col z-40 transition-colors duration-300 hidden md:flex">
      <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black dark:bg-white text-white dark:text-black rounded flex items-center justify-center font-bold text-xs">
            H
          </div>
          <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
            HeartWire OS
          </span>
        </div>
        <button
          onClick={toggleDarkMode}
          className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <NavLink
          href="/"
          icon={LayoutDashboard}
          label="Dashboard"
          isActive={pathname === "/"}
        />

        <SectionLabel className="mt-5">Tracking</SectionLabel>
        {trackingItems.map((item) => (
          <NavLink
            key={item.name}
            href={item.href}
            icon={item.icon}
            label={item.name}
            isActive={pathname === item.href}
          />
        ))}

        <SectionLabel className="mt-5">Study Tracks</SectionLabel>
        {!loaded ? (
          <p className="px-2 py-2 text-xs text-gray-500">Loading…</p>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.id}>
                  <div className="flex items-center gap-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="flex-1 truncate">{group.name}</span>
                    {group.totalCourses > 0 && (
                      <span className="tabular-nums">{group.totalCourses}</span>
                    )}
                  </div>
                  {group.dbTracks.length === 0 ? (
                    <p className="text-[11px] text-gray-400 dark:text-gray-600 px-3 py-1 italic">
                      Empty — visit /settings to seed
                    </p>
                  ) : (
                    <div className="space-y-0.5">
                      {group.dbTracks.map((dbTrack) => {
                        const urlTrackId = searchParams.get("trackId");
                        const isActive =
                          pathname === "/courses" &&
                          urlTrackId === dbTrack.id;
                        return (
                          <Link
                            key={dbTrack.id}
                            href={`/courses?trackId=${dbTrack.id}`}
                            className={clsx(
                              "flex items-center justify-between px-3 py-1 rounded text-[13px] transition-colors",
                              isActive
                                ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                          >
                            <span className="truncate">{dbTrack.title}</span>
                            {(dbTrack._count?.courses ?? 0) > 0 && (
                              <span className="text-[10px] text-gray-400 ml-1 tabular-nums">
                                {dbTrack._count.courses}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <SectionLabel className="mt-5">Library</SectionLabel>
        {libraryItems.map((item) => (
          <NavLink
            key={item.name}
            href={item.href}
            icon={item.icon}
            label={item.name}
            isActive={pathname === item.href}
          />
        ))}
        <NavLink
          href="/resources"
          icon={Library}
          label="All Resources"
          isActive={pathname === "/resources"}
        />

        <SectionLabel className="mt-5">More</SectionLabel>
        <NavLink
          href="/calendar"
          icon={Calendar}
          label="Calendar"
          isActive={isCalendarActive}
        />
        <NavLink
          href="/planner"
          icon={CalendarDays}
          label="Planner"
          isActive={pathname === "/planner"}
        />
        <NavLink
          href="/notes"
          icon={BookOpen}
          label="Notes"
          isActive={pathname === "/notes"}
        />
        <NavLink
          href="/settings"
          icon={SettingsIcon}
          label="Settings"
          isActive={pathname === "/settings"}
        />
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
        {isOffline && (
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 p-2 rounded text-xs text-center">
            Offline — changes saved locally.
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="text-xs">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Signed in
            </p>
            <p className="text-gray-500 dark:text-gray-400">HeartWire OS</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={clsx(
        "px-2 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider",
        className
      )}
    >
      {children}
    </p>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
        isActive
          ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
