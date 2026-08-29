"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

const LIGHT = "#F8F7FF";
const DARK = "#0a0a12";

export default function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const meta =
      document.querySelector('meta[name="theme-color"]:not([media])') ??
      (() => {
        const el = document.createElement("meta");
        el.name = "theme-color";
        document.head.appendChild(el);
        return el;
      })();

    meta.setAttribute("content", resolvedTheme === "dark" ? DARK : LIGHT);
  }, [resolvedTheme]);

  return null;
}
