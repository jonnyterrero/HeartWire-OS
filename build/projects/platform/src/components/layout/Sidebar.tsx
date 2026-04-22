"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Library,
  FileText,
  Hammer,
  Target,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import clsx from "clsx";
import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { TRACK_GROUPS, type TrackGroup } from "@/lib/track-groups";

// ─── Types ─────────────────────────────────────────────────
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

// ─── Component ─────────────────────────────────────────────
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

  // Fetch tracks and resolve into groups
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

  // ─── Workspace Links ────────────────────────────
  const workspaceItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Planner", href: "/planner", icon: Calendar },
  ];

  // ─── Databases (matches 5amClub OS v6 layout) ───
  const dbItems = [
    { name: "Projects", href: "/projects", icon: Hammer },
    { name: "Courses", href: "/courses", icon: BookOpen },
    { name: "Resources", href: "/resources", icon: Library },
    { name: "Notes", href: "/notes", icon: FileText },
    { name: "Habits", href: "/habits", icon: Target },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#F7F7F5] dark:bg-[#202020] border-r border-gray-200 dark:border-gray-800 flex flex-col z-40 transition-colors duration-300 hidden md:flex">
      {/* ── Header ─────────────────────────────────── */}
      <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black dark:bg-white text-white dark:text-black rounded flex items-center justify-center font-bold text-xs">
            5
          </div>
          <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
            5amClub
          </span>
        </div>
        <button
          onClick={toggleDarkMode}
          className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Scrollable Nav ─────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {/* Workspace */}
        <SectionLabel>Workspace</SectionLabel>
        {workspaceItems.map((item) => (
          <NavLink
            key={item.name}
            href={item.href}
            icon={item.icon}
            label={item.name}
            isActive={pathname === item.href}
          />
        ))}

        {/* Databases (matches 5amClub OS order) */}
        <SectionLabel className="mt-6">Databases</SectionLabel>
        {dbItems.map((item) => (
          <NavLink
            key={item.name}
            href={item.href}
            icon={item.icon}
            label={item.name}
            isActive={pathname === item.href}
          />
        ))}

        {/* Track Groups */}
        <SectionLabel className="mt-6">Tracks</SectionLabel>

        {!loaded ? (
          <p className="px-2 py-2 text-xs text-gray-500">Loading...</p>
        ) : (
          groups.map((group) => {
            const isOpen = expanded.has(group.id);
            const Icon = group.icon;

            return (
              <div key={group.id}>
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 group"
                >
                  <ChevronRight
                    className={clsx(
                      "w-3 h-3 text-gray-400 transition-transform duration-150",
                      isOpen && "rotate-90"
                    )}
                  />
                  <Icon className={clsx("w-4 h-4", group.color)} />
                  <span className="flex-1 text-left font-medium truncate">
                    {group.name}
                  </span>
                  <span className="text-[10px] text-gray-400 tabular-nums">
                    {group.totalCourses}
                  </span>
                </button>

                {/* Expanded: DB Tracks within group */}
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
                          pathname === "/courses" && urlTrackId === dbTrack.id;
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
      </nav>

      {/* ── Footer (matches 5amClub OS v6) ─────────────────── */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
        {isOffline && (
          <div className="bg-yellow-600 dark:bg-yellow-500 text-white p-2 rounded text-xs text-center">
            ⚠️ You&apos;re offline. Changes are saved locally.
          </div>
        )}
        {/* Check for Updates / Restore DB - like old app */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => window.location.reload()}
            className="w-full text-xs text-blue-500 hover:text-blue-700 flex items-center justify-center gap-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
          >
            <RefreshCw className="w-3 h-3" />
            Check for Updates
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full text-xs text-red-500 hover:text-red-700 flex items-center justify-center gap-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
          >
            <RefreshCw className="w-3 h-3" />
            Restore DB
          </button>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
            <div className="text-xs">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Jonny Terrero
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Engineering Student
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Reusable Sub-Components ───────────────────────────────

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
