import { Suspense } from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import PwaUpdater from "@/components/pwa/PwaUpdater";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import ThemeColorSync from "@/components/ThemeColorSync";
import FaviconSync from "@/components/FaviconSync";
import HeartWireThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

function resolveAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  const productionDefault = "https://heart-wire-os.vercel.app";
  if (process.env.VERCEL_ENV === "production") {
    if (!configured || configured.includes("localhost")) {
      return productionDefault;
    }
    return configured;
  }
  return configured || "http://localhost:3000";
}

const appUrl = resolveAppUrl();
const description =
  "Personal engineering study OS — tracks, courses, a timer, and a library. Public beta.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "HeartWire OS",
  description,
  manifest: "/manifest.json",
  applicationName: "HeartWire OS",
  icons: {
    icon: [
      { url: "/logo-mark.svg", type: "image/svg+xml" },
      { url: "/favicon-light-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon-light-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: [
      { url: "/apple-touch-icon-light.png", sizes: "180x180" },
      { url: "/apple-touch-icon.png", sizes: "180x180", media: "(prefers-color-scheme: dark)" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HeartWire",
  },
  openGraph: {
    title: "HeartWire OS",
    description,
    url: "/",
    siteName: "HeartWire OS",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "HeartWire OS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HeartWire OS",
    description,
    images: ["/og.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#F8F7FF" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a12" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="flex h-screen overflow-hidden hw-glow-bg text-[color:var(--hw-text)]">
        <HeartWireThemeProvider>
          <ThemeColorSync />
          <FaviconSync />
          <PwaUpdater />
          <InstallPrompt />
          {user ? (
            <>
              <OnboardingModal />
              <MobileNav />
              <Suspense fallback={<aside className="w-64 hidden md:block" />}>
                <Sidebar />
              </Suspense>
              <main className="flex-1 overflow-y-auto pt-14 md:pt-0 md:ml-64 p-4 md:p-8">
                {children}
              </main>
            </>
          ) : (
            <main className="flex-1">{children}</main>
          )}
          <Analytics />
        </HeartWireThemeProvider>
      </body>
    </html>
  );
}
