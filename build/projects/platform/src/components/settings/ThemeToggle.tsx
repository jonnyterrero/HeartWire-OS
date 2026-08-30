"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import clsx from "clsx";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Theme">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-pressed={theme === value}
          className={clsx(
            "inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors min-h-[44px]",
            theme === value
              ? "border-hw-sky bg-hw-sky/10 text-hw-sky"
              : "border-[color:var(--hw-border)] text-[color:var(--hw-muted)] hover:bg-hw-sky/5"
          )}
        >
          <Icon className="w-4 h-4" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
