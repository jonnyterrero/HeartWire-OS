import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import Sidebar from "@/components/layout/Sidebar";
import PwaUpdater from "@/components/pwa/PwaUpdater";
import "./globals.css";

export const metadata = {
  title: "HeartWire OS",
  description: "Engineering study tracker and knowledge OS",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HeartWire",
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
        <link rel="apple-touch-icon" href="/icon.svg" />
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
      </body>
    </html>
  );
}
