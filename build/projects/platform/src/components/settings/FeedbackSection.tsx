"use client";

import { useState } from "react";
import { ExternalLink, MessageSquare } from "lucide-react";

const GITHUB_ISSUES =
  "https://github.com/jonnyterrero/HeartWire-OS/issues/new?template=bug_report.md&title=HeartWire%20OS%20Beta%20Feedback";

export default function FeedbackSection() {
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("feedback");

  function openGitHubIssue() {
    const title = encodeURIComponent(
      `Beta ${category}: ${message.slice(0, 60) || "Feedback"}`
    );
    const body = encodeURIComponent(
      `**Category:** ${category}\n\n**Message:**\n${message || "(no message)"}\n\n---\n*Sent from HeartWire OS Settings*`
    );
    const url = `https://github.com/jonnyterrero/HeartWire-OS/issues/new?title=${title}&body=${body}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="border border-[color:var(--hw-border)] rounded-lg p-4 bg-[color:var(--hw-surface)] space-y-3">
      <h2 className="text-sm font-semibold text-[color:var(--hw-text)] flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-hw-sky" aria-hidden />
        Feedback
      </h2>
      <p className="text-xs text-[color:var(--hw-muted)]">
        Public beta — report bugs or suggest features. Opens a GitHub issue
        (requires a GitHub account).
      </p>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-[color:var(--hw-border)] bg-hw-ghost dark:bg-darkBg"
        aria-label="Feedback category"
      >
        <option value="feedback">General feedback</option>
        <option value="bug">Bug report</option>
        <option value="feature">Feature request</option>
      </select>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What happened? What would you like to see?"
        rows={3}
        className="w-full px-3 py-2 text-sm rounded-lg border border-[color:var(--hw-border)] bg-hw-ghost dark:bg-darkBg resize-y"
        aria-label="Feedback message"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openGitHubIssue}
          className="px-3 py-2 text-sm rounded-lg bg-hw-sky text-white hover:opacity-90 min-h-[44px]"
        >
          Submit on GitHub
        </button>
        <a
          href={GITHUB_ISSUES}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-[color:var(--hw-border)] text-[color:var(--hw-muted)] hover:bg-hw-sky/5 min-h-[44px]"
        >
          Browse issues
          <ExternalLink className="w-3.5 h-3.5" aria-hidden />
        </a>
      </div>
    </section>
  );
}
