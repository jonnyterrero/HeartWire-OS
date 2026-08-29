"use client";

import Link from "next/link";
import clsx from "clsx";
import {
  DASHBOARD_ITEM,
  TRACKING_ITEMS,
  LIBRARY_ITEMS,
  MORE_ITEMS,
  ALL_RESOURCES_ITEM,
  type NavItem,
} from "@/lib/navigation";
import type { ResolvedGroup } from "@/hooks/useTrackGroups";

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
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = item.match ? item.match(pathname) : pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={clsx(
        "w-full flex items-center gap-2 px-2 py-2.5 min-h-[44px] rounded text-sm transition-colors",
        isActive
          ? "bg-hw-sky/10 dark:bg-hw-lavender/15 text-hw-sky dark:text-hw-ghost font-medium border border-hw-sky/20 dark:border-hw-lavender/20"
          : "text-slate-600 dark:text-hw-lavender/70 hover:bg-hw-sky/5 dark:hover:bg-hw-lavender/10"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {item.label}
    </Link>
  );
}

type NavigationPanelProps = {
  pathname: string;
  groups: ResolvedGroup[];
  loaded: boolean;
  onNavigate?: () => void;
};

export default function NavigationPanel({
  pathname,
  groups,
  loaded,
  onNavigate,
}: NavigationPanelProps) {
  return (
    <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
      <NavLink item={DASHBOARD_ITEM} pathname={pathname} onNavigate={onNavigate} />

      <SectionLabel className="mt-5">Tracking</SectionLabel>
      {TRACKING_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          pathname={pathname}
          onNavigate={onNavigate}
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
                      const isActive = pathname === `/tracks/${dbTrack.id}`;
                      return (
                        <Link
                          key={dbTrack.id}
                          href={`/tracks/${dbTrack.id}`}
                          onClick={onNavigate}
                          className={clsx(
                            "flex items-center justify-between px-3 py-2 min-h-[44px] rounded text-[13px] transition-colors",
                            isActive
                              ? "bg-hw-sky/10 dark:bg-hw-lavender/15 text-hw-sky dark:text-hw-ghost font-medium"
                              : "text-gray-600 dark:text-gray-300 hover:bg-hw-sky/5 dark:hover:bg-hw-lavender/10"
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
      {LIBRARY_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      ))}
      <NavLink
        item={ALL_RESOURCES_ITEM}
        pathname={pathname}
        onNavigate={onNavigate}
      />

      <SectionLabel className="mt-5">More</SectionLabel>
      {MORE_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}
