"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function SettingsPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function seedDefaults() {
    setSeeding(true);
    setSeedResult(null);
    const res = await fetch("/api/seed-defaults", { method: "POST" });
    setSeeding(false);
    if (res.ok) {
      const data = await res.json();
      const failures: { stage: string; title: string; error: string }[] =
        data.failures ?? [];
      const base = `Created ${data.tracksCreated ?? 0} track${
        (data.tracksCreated ?? 0) === 1 ? "" : "s"
      } and ${data.coursesCreated ?? 0} course${
        (data.coursesCreated ?? 0) === 1 ? "" : "s"
      }.`;
      setSeedResult(
        failures.length === 0
          ? base
          : `${base} ${failures.length} failed: ${failures
              .map((f) => `${f.title} (${f.error})`)
              .join("; ")}`
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("heartwire:tracks-changed"));
      }
    } else {
      let detail = "";
      try {
        const data = await res.json();
        detail = data?.error ? ` (${data.error})` : "";
      } catch {}
      setSeedResult(`Failed to seed: HTTP ${res.status}${detail}`);
    }
  }

  async function addTrack() {
    const title = window.prompt("New track title");
    if (!title || !title.trim()) return;
    const res = await fetch("/api/tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    if (res.ok && typeof window !== "undefined") {
      window.dispatchEvent(new Event("heartwire:tracks-changed"));
      setSeedResult(`Added track "${title.trim()}".`);
    }
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
      </header>

      <section className="border border-gray-200 dark:border-gray-800 rounded-md p-4 bg-white dark:bg-darkSurface space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Account
        </h2>
        <div className="text-sm">
          <p className="text-gray-500">Signed in as</p>
          <p className="text-gray-900 dark:text-white">{email ?? "—"}</p>
        </div>
        <button
          onClick={signOut}
          className="px-3 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Sign out
        </button>
      </section>

      <section className="border border-gray-200 dark:border-gray-800 rounded-md p-4 bg-white dark:bg-darkSurface space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Default tracks
        </h2>
        <p className="text-xs text-gray-500">
          Seeds the 6 HeartWire-OS default tracks (Math, Physics & Chemistry,
          Neuroscience, SE, Mech, EE) for your account. Skips ones you already
          have.
        </p>
        <button
          onClick={seedDefaults}
          disabled={seeding}
          className="px-3 py-1.5 bg-primary text-white text-sm rounded hover:opacity-90 disabled:opacity-50"
        >
          {seeding ? "Seeding…" : "Seed default tracks"}
        </button>
        <button
          onClick={addTrack}
          className="ml-2 px-3 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Add custom track
        </button>
        {seedResult && (
          <p className="text-xs text-gray-500">{seedResult}</p>
        )}
      </section>
    </div>
  );
}
