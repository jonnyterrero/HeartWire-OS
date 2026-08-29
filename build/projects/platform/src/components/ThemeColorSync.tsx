"use client";

import { useEffect } from "react";

const LIGHT = "#F8F7FF";
const DARK = "#0a0a12";

export default function ThemeColorSync() {
  useEffect(() => {
    const meta =
      document.querySelector('meta[name="theme-color"]:not([media])') ??
      (() => {
        const el = document.createElement("meta");
        el.name = "theme-color";
        document.head.appendChild(el);
        return el;
      })();

    const sync = () => {
      meta.setAttribute(
        "content",
        document.documentElement.classList.contains("dark") ? DARK : LIGHT
      );
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return null;
}
