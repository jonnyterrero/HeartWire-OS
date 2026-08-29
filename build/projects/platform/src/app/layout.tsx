import { Suspense } from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import Sidebar from "@/components/layout/Sidebar";
import PwaUpdater from "@/components/pwa/PwaUpdater";
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
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
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
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#2eaadc" />
      </head>
      <body className="flex h-screen overflow-hidden bg-slate-50 dark:bg-darkBg text-slate-900 dark:text-slate-100">
        <PwaUpdater />
        {user ? (
          <>
            <Suspense fallback={<aside className="w-64 hidden md:block" />}>
              <Sidebar />
            </Suspense>
            <main className="flex-1 overflow-y-auto md:ml-64 p-4 md:p-8">
              {children}
            </main>
          </>
        ) : (
          <main className="flex-1">{children}</main>
        )}
        <Analytics />
      </body>
    </html>
  );
}
