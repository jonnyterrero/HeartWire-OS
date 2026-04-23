"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, [supabase]);

  if (!email) return null;

  return (
    <div className="text-xs text-slate-400 truncate">
      {email}
    </div>
  );
}
