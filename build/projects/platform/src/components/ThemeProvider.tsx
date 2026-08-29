"use client";

import { ThemeProvider } from "next-themes";

export default function HeartWireThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      storageKey="heartwire-theme"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
