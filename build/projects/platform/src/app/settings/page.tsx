"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { clearRuntimeCaches } from "@/lib/pwa-cache";
import FocusPicker from "@/components/focus/FocusPicker";
import ThemeToggle from "@/components/settings/ThemeToggle";
import FeedbackSection from "@/components/settings/FeedbackSection";

export default function SettingsPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
    await clearRuntimeCaches();
    router.push("/login");
    router.refresh();
  }

  async function deleteAccount() {
    const confirmed = window.prompt(
      'This permanently deletes your workspace and login. Type DELETE to confirm.'
    );
    if (confirmed !== "DELETE") return;
    setDeleting(true);
    const res = await fetch("/api/account", { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      let detail = "Could not delete account.";
      try {
        const data = await res.json();
        if (data?.error) detail = data.error;
      } catch {}
      setSeedResult(detail);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    await clearRuntimeCaches();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-[color:var(--hw-text)]">
          Settings
        </h1>
      </header>

      <section className="border border-[color:var(--hw-border)] rounded-lg p-4 bg-[color:var(--hw-surface)] space-y-3">
        <h2 className="text-sm font-semibold text-[color:var(--hw-text)]">
          Appearance
        </h2>
        <p className="text-xs text-[color:var(--hw-muted)]">
          Choose light, dark, or match your system.
        </p>
        <ThemeToggle />
      </section>

      <section className="border border-[color:var(--hw-border)] rounded-lg p-4 bg-[color:var(--hw-surface)] space-y-3">
        <h2 className="text-sm font-semibold text-[color:var(--hw-text)]">
          Account
        </h2>
        <div className="text-sm">
          <p className="text-[color:var(--hw-muted)]">Signed in as</p>
          <p className="text-[color:var(--hw-text)]">{email ?? "—"}</p>
        </div>
        <button
          onClick={signOut}
          className="px-3 py-2 text-sm rounded-lg border border-[color:var(--hw-border)] text-[color:var(--hw-text)] hover:bg-hw-sky/5 min-h-[44px]"
        >
          Sign out
        </button>
      </section>

      <FeedbackSection />

      <section className="border border-red-200 dark:border-red-900/50 rounded-lg p-4 bg-[color:var(--hw-surface)] space-y-3">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-400">
          Delete account
        </h2>
        <p className="text-xs text-[color:var(--hw-muted)]">
          Permanently removes your tracks, notes, journal, and login. This
          cannot be undone.
        </p>
        <button
          onClick={deleteAccount}
          disabled={deleting}
          className="px-3 py-2 text-sm rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50 min-h-[44px]"
        >
          {deleting ? "Deleting…" : "Delete my account"}
        </button>
      </section>

      <section className="border border-[color:var(--hw-border)] rounded-lg p-4 bg-[color:var(--hw-surface)] space-y-3">
        <h2 className="text-sm font-semibold text-[color:var(--hw-text)]">
          Current focus
        </h2>
        <p className="text-xs text-[color:var(--hw-muted)]">
          Pick up to 5 courses and 3 projects to highlight on your dashboard.
        </p>
        <FocusPicker />
      </section>

      <section className="border border-[color:var(--hw-border)] rounded-lg p-4 bg-[color:var(--hw-surface)] space-y-3">
        <h2 className="text-sm font-semibold text-[color:var(--hw-text)]">
          Default tracks
        </h2>
        <p className="text-xs text-[color:var(--hw-muted)]">
          Seeds the 6 HeartWire-OS default tracks (Math, Physics & Chemistry,
          Neuroscience, SE, Mech, EE) for your account. Skips ones you already
          have.
        </p>
        <button
          onClick={seedDefaults}
          disabled={seeding}
          className="px-3 py-2 bg-hw-sky text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50 min-h-[44px]"
        >
          {seeding ? "Seeding…" : "Seed default tracks"}
        </button>
        <button
          onClick={addTrack}
          className="ml-2 px-3 py-2 text-sm rounded-lg border border-[color:var(--hw-border)] text-[color:var(--hw-text)] hover:bg-hw-sky/5 min-h-[44px]"
        >
          Add custom track
        </button>
        {seedResult && (
          <p className="text-xs text-[color:var(--hw-muted)]">{seedResult}</p>
        )}
      </section>
    </div>
  );
}
