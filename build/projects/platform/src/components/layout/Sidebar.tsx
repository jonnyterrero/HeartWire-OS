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
  ChevronRight,
  Clock,
  GraduationCap,
  ClipboardCheck,
  PenLine,
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
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
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
    fetch("/api/tracks")
      .then((r) => r.json())
      .then((dbTracks: DbTrack[]) => {
        const resolved = TRACK_GROUPS.map((group) => {
          const matching = dbTracks.filter((t) =>
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
      })
      .catch(() => setLoaded(true));
  }, []);

  const toggleGroup = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
        ) : groups.length === 0 ? (
          <p className="px-2 py-2 text-xs text-gray-500">No tracks yet</p>
        ) : (
          groups.map((group) => {
            const isOpen = expanded.has(group.id);
            const Icon = group.icon;
            return (
              <div key={group.id}>
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronRight
                    className={clsx(
                      "w-3 h-3 text-gray-400 transition-transform duration-150",
                      isOpen && "rotate-90"
                    )}
                  />
                  <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="flex-1 text-left font-medium truncate">
                    {group.name}
                  </span>
                  <span className="text-[10px] text-gray-400 tabular-nums">
                    {group.totalCourses}
                  </span>
                </button>
                {isOpen && (
                  <div className="ml-5 mt-0.5 mb-1 space-y-0.5 border-l border-gray-200 dark:border-gray-700/50 pl-2">
                    {group.dbTracks.length === 0 ? (
                      <p className="text-[11px] text-gray-500 py-1 px-1">
                        No tracks yet
                      </p>
                    ) : (
                      group.dbTracks.map((dbTrack) => {
                        const urlTrackId = searchParams.get("trackId");
                        const isActive =
                          pathname === "/courses" &&
                          urlTrackId === dbTrack.id;
                        return (
                          <Link
                            key={dbTrack.id}
                            href={`/courses?trackId=${dbTrack.id}`}
                            className={clsx(
                              "flex items-center justify-between px-2 py-1 rounded text-[12px] transition-colors",
                              isActive
                                ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                          >
                            <span className="truncate">{dbTrack.title}</span>
                            <span className="text-[10px] text-gray-400 ml-1 tabular-nums">
                              {dbTrack._count?.courses || 0}
                            </span>
                          </Link>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
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
