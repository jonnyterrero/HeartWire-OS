"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { clearRuntimeCaches } from "@/lib/pwa-cache";
import { useTrackGroups } from "@/hooks/useTrackGroups";
import NavigationPanel from "./NavigationPanel";
import BrandLogo from "@/components/BrandLogo";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { groups, loaded } = useTrackGroups();
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

  const toggleDarkMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    await clearRuntimeCaches();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-hw-ghost dark:bg-darkSurface border-r border-[color:var(--hw-border)] flex flex-col z-40 transition-colors duration-300 hidden md:flex">
      <div className="p-4 flex justify-between items-center border-b border-[color:var(--hw-border)]">
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo size={24} className="h-6 w-6" />
          <span className="font-bold text-sm">HeartWire OS</span>
        </Link>
        <button
          onClick={toggleDarkMode}
          className="text-slate-500 hover:text-hw-sky dark:text-hw-lavender/70 dark:hover:text-hw-ghost transition-colors"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>

      <NavigationPanel pathname={pathname} groups={groups} loaded={loaded} />

      <div className="p-4 border-t border-[color:var(--hw-border)] space-y-3">
        {isOffline && (
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 p-2 rounded text-xs text-center">
            Offline — cached content remains available. Changes require a
            connection.
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="text-xs">
            <p className="font-medium">Signed in</p>
            <p className="text-slate-500 dark:text-hw-lavender/70">HeartWire OS</p>
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
