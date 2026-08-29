import Link from "next/link";

export const metadata = {
  title: "Privacy — HeartWire OS",
  description: "How HeartWire OS handles your data during public beta.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen hw-glow-bg px-6 py-12 text-[color:var(--hw-text)]">
      <article className="max-w-2xl mx-auto space-y-6 text-sm leading-relaxed">
        <h1 className="text-2xl font-semibold">Privacy</h1>
        <p className="text-slate-500 dark:text-hw-lavender/70">Last updated: 28 August 2026</p>
        <p>
          HeartWire OS is a personal engineering study tracker in public beta.
          It is not a consumer product with a legal team behind it — this page
          is so you know what is stored before you create an account.
        </p>
        <h2 className="text-base font-semibold text-white pt-2">What we store</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-300">
          <li>Email and auth session (via Supabase Auth)</li>
          <li>
            Study data you enter: tracks, courses, tasks, notes/journal,
            habits, resources, calendar events, exam practice logs
          </li>
        </ul>
        <h2 className="text-base font-semibold text-white pt-2">Analytics</h2>
        <p>
          The production site uses Vercel Web Analytics for anonymous page-view
          counts. It is not used to sell ads or build a marketing profile.
        </p>
        <h2 className="text-base font-semibold text-white pt-2">Your control</h2>
        <p>
          You can delete your account from Settings. That removes workspace
          rows and the login. Backups may retain deleted data for a short
          period. Do not store secrets, PHI, or anything you cannot lose —
          this beta may be reset.
        </p>
        <p>
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Back to sign in
          </Link>
        </p>
      </article>
    </div>
  );
}
