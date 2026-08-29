import Link from "next/link";

export const metadata = {
  title: "Terms — HeartWire OS",
  description: "Acceptable use and beta terms for HeartWire OS.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#191919] text-gray-200 px-6 py-12">
      <article className="max-w-2xl mx-auto space-y-6 text-sm leading-relaxed">
        <h1 className="text-2xl font-semibold text-white">Terms of Use</h1>
        <p className="text-gray-400">Last updated: 29 August 2026</p>
        <p>
          HeartWire OS is a personal engineering study tracker offered as a
          public beta. By creating an account or using the site, you agree to
          these terms.
        </p>
        <h2 className="text-base font-semibold text-white pt-2">Beta / no warranty</h2>
        <p>
          The service is provided &quot;as is&quot; without warranties of any
          kind. Features may change, break, or be removed without notice. Data
          may be lost during resets or migrations.
        </p>
        <h2 className="text-base font-semibold text-white pt-2">Acceptable use</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-300">
          <li>Do not store PHI, credentials, or data you cannot afford to lose.</li>
          <li>Do not attempt to access other users&apos; data or abuse auth endpoints.</li>
          <li>Do not use the service for spam, harassment, or illegal activity.</li>
        </ul>
        <h2 className="text-base font-semibold text-white pt-2">Access</h2>
        <p>
          Accounts may be suspended or removed at any time, especially during
          beta. There is no SLA or guaranteed uptime on the free-tier stack.
        </p>
        <h2 className="text-base font-semibold text-white pt-2">Liability</h2>
        <p>
          To the fullest extent permitted by law, the operator is not liable
          for any damages arising from use of this beta service.
        </p>
        <p className="space-x-3">
          <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
            Privacy
          </Link>
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Back to sign in
          </Link>
        </p>
      </article>
    </div>
  );
}
