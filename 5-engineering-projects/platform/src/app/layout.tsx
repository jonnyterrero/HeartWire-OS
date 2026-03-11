import { createSupabaseServerClient } from "@/lib/supabase-server";
import Sidebar from "@/components/layout/Sidebar";
import "./globals.css";

export const metadata = {
  title: "5amClub Platform",
  description: "Engineering study tracker and knowledge OS",
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
      <body className="flex h-screen overflow-hidden bg-slate-50 dark:bg-darkBg text-slate-900 dark:text-slate-100">
        {user ? (
          <>
            <Sidebar />
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
