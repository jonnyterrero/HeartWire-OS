"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

const ICONS = {
  light: {
    favicon: "/logo-mark.svg",
    apple: "/apple-touch-icon-light.png",
  },
  dark: {
    favicon: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
} as const;

function upsertLink(rel: string, href: string, sizes?: string) {
  const selector = sizes
    ? `link[rel="${rel}"][sizes="${sizes}"]`
    : `link[rel="${rel}"]:not([sizes])`;
  let link = document.querySelector<HTMLLinkElement>(selector);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    if (sizes) link.setAttribute("sizes", sizes);
    document.head.appendChild(link);
  }
  link.href = href;
}

export default function FaviconSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const mode = resolvedTheme === "dark" ? "dark" : "light";
    const set = ICONS[mode];
    upsertLink("icon", set.favicon, "32x32");
    upsertLink("apple-touch-icon", set.apple, "180x180");
  }, [resolvedTheme]);

  return null;
}
