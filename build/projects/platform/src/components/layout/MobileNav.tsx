"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, LogOut, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { clearRuntimeCaches } from "@/lib/pwa-cache";
import { useTrackGroups } from "@/hooks/useTrackGroups";
import NavigationPanel from "./NavigationPanel";

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { groups, loaded } = useTrackGroups();
  const [open, setOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    firstFocusRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleLogout = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    await clearRuntimeCaches();
    setOpen(false);
    router.push("/login");
    router.refresh();
  }, [router]);

  return (
    <>
      <header className="md:hidden fixed top-0 inset-x-0 z-50 h-14 bg-hw-ghost/95 dark:bg-darkSurface/95 backdrop-blur border-b border-[color:var(--hw-border)] flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 min-h-[44px]">
          <img
            src="/favicon-32.png"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 rounded dark:block hidden"
          />
          <img
            src="/icon-light-512.png"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 rounded block dark:hidden"
          />
          <span className="font-bold text-sm">HeartWire OS</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 dark:text-hw-lavender/70"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 dark:text-hw-ghost"
            aria-label="Open navigation"
            aria-expanded={open}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-[60]" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute inset-y-0 left-0 w-[min(20rem,88vw)] bg-hw-ghost dark:bg-darkSurface border-r border-[color:var(--hw-border)] flex flex-col shadow-xl"
          >
            <div className="p-4 flex items-center justify-between border-b border-[color:var(--hw-border)]">
              <span className="font-bold text-sm">Menu</span>
              <button
                ref={firstFocusRef}
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <NavigationPanel
              pathname={pathname}
              groups={groups}
              loaded={loaded}
              onNavigate={() => setOpen(false)}
            />

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
                  <p className="text-slate-500 dark:text-hw-lavender/70">
                    {theme === "system" ? "System theme" : `${theme} mode`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
