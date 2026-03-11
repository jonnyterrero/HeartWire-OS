"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Library,
  FileText,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);

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

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Planner", href: "/planner", icon: Calendar },
  ];

  const dbItems = [
    { name: "Courses", href: "/courses", icon: BookOpen },
    { name: "Resources", href: "/resources", icon: Library },
    { name: "Notes", href: "/notes", icon: FileText },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#F7F7F5] dark:bg-[#202020] border-r border-gray-200 dark:border-gray-800 flex flex-col z-40 transition-colors duration-300 hidden md:flex">
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

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        <p className="px-2 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                isActive
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}

        <p className="px-2 mt-6 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Databases
        </p>
        {dbItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                isActive
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
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
