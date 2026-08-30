"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles, BookOpen, Target, CheckCircle2 } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import FocusPicker from "@/components/focus/FocusPicker";

const STORAGE_KEY = "heartwire-onboarding-v1";

type Step = "welcome" | "tracks" | "focus" | "done";

export function isOnboardingComplete(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) === "done";
}

export function markOnboardingComplete() {
  localStorage.setItem(STORAGE_KEY, "done");
}

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("welcome");
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const [trackCount, setTrackCount] = useState<number | null>(null);

  useEffect(() => {
    if (isOnboardingComplete()) return;
    setOpen(true);
    fetch("/api/tracks")
      .then((r) => (r.ok ? r.json() : []))
      .then((tracks: unknown[]) => setTrackCount(tracks.length))
      .catch(() => setTrackCount(0));
  }, []);

  const close = useCallback(() => {
    markOnboardingComplete();
    setOpen(false);
  }, []);

  async function seedTracks() {
    setSeeding(true);
    setSeedMsg(null);
    const res = await fetch("/api/seed-defaults", { method: "POST" });
    setSeeding(false);
    if (res.ok) {
      const data = await res.json();
      setSeedMsg(
        `Added ${data.tracksCreated ?? 0} tracks and ${data.coursesCreated ?? 0} courses.`
      );
      setTrackCount((c) => (c ?? 0) + (data.tracksCreated ?? 0));
      window.dispatchEvent(new Event("heartwire:tracks-changed"));
    } else {
      setSeedMsg("Could not seed tracks. Try again from Settings.");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-[color:var(--hw-border)] bg-[color:var(--hw-surface)] shadow-2xl p-6 space-y-5"
      >
        <div className="flex flex-col items-center text-center gap-2">
          <BrandLogo size={48} className="h-12 w-12" />
          <h2 id="onboarding-title" className="text-xl font-bold text-[color:var(--hw-text)]">
            {step === "welcome" && "Welcome to HeartWire OS"}
            {step === "tracks" && "Set up your tracks"}
            {step === "focus" && "Pick your focus"}
            {step === "done" && "You're all set"}
          </h2>
          <p className="text-sm text-[color:var(--hw-muted)]">
            {step === "welcome" &&
              "Your personal engineering study OS. Let's get your workspace ready."}
            {step === "tracks" &&
              "Default tracks cover Math, Physics, Neuro, SE, Mech, and EE."}
            {step === "focus" &&
              "Choose courses and projects to highlight on your dashboard."}
            {step === "done" &&
              "Start a study session or explore the library anytime."}
          </p>
        </div>

        {step === "welcome" && (
          <ul className="text-sm space-y-2 text-[color:var(--hw-muted)]">
            <li className="flex gap-2">
              <Sparkles className="w-4 h-4 text-hw-sky shrink-0 mt-0.5" aria-hidden />
              Track study hours, habits, and FE/PE practice
            </li>
            <li className="flex gap-2">
              <BookOpen className="w-4 h-4 text-hw-lavender shrink-0 mt-0.5" aria-hidden />
              Organize courses, resources, and notes by track
            </li>
            <li className="flex gap-2">
              <Target className="w-4 h-4 text-hw-fuchsia shrink-0 mt-0.5" aria-hidden />
              Focus dashboard on what matters this week
            </li>
          </ul>
        )}

        {step === "tracks" && (
          <div className="space-y-3">
            {trackCount !== null && trackCount > 0 ? (
              <p className="text-sm text-hw-sky bg-hw-sky/10 rounded-lg px-3 py-2">
                You already have {trackCount} track{trackCount === 1 ? "" : "s"}.
                You can add more anytime in Settings.
              </p>
            ) : (
              <p className="text-sm text-[color:var(--hw-muted)]">
                Seed starter tracks so your dashboard isn&apos;t empty.
              </p>
            )}
            <button
              type="button"
              onClick={seedTracks}
              disabled={seeding}
              className="w-full px-4 py-2.5 bg-hw-sky text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 min-h-[44px]"
            >
              {seeding ? "Seeding…" : trackCount && trackCount > 0 ? "Seed more defaults" : "Seed default tracks"}
            </button>
            {seedMsg && (
              <p className="text-xs text-[color:var(--hw-muted)]">{seedMsg}</p>
            )}
          </div>
        )}

        {step === "focus" && (
          <div className="max-h-[40vh] overflow-y-auto">
            <FocusPicker onSaved={() => window.dispatchEvent(new Event("heartwire:focus-changed"))} />
          </div>
        )}

        {step === "done" && (
          <div className="flex justify-center">
            <CheckCircle2 className="w-12 h-12 text-hw-sky" aria-hidden />
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {step !== "welcome" && step !== "done" && (
            <button
              type="button"
              onClick={() =>
                setStep(
                  step === "focus" ? "tracks" : "welcome"
                )
              }
              className="px-4 py-2.5 text-sm rounded-lg border border-[color:var(--hw-border)] text-[color:var(--hw-muted)] min-h-[44px]"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (step === "welcome") setStep("tracks");
              else if (step === "tracks") setStep("focus");
              else if (step === "focus") setStep("done");
              else close();
            }}
            className="flex-1 px-4 py-2.5 bg-hw-sky text-white rounded-lg text-sm font-medium hover:opacity-90 min-h-[44px]"
          >
            {step === "done" ? "Go to dashboard" : "Continue"}
          </button>
          {step !== "done" && (
            <button
              type="button"
              onClick={close}
              className="px-3 py-2.5 text-sm text-[color:var(--hw-muted)] hover:text-hw-sky min-h-[44px]"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
