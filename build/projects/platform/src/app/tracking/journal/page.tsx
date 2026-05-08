"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

type JournalNote = {
  id: string;
  title: string;
  content: string;
  noteType: string | null;
  journalDate: string | null;
  moodScore: number | null;
  energyScore: number | null;
  createdAt: string;
};

export default function JournalPage() {
  const [notes, setNotes] = useState<JournalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/notes");
    if (res.ok) {
      const all = (await res.json()) as JournalNote[];
      setNotes(all.filter((n) => n.noteType === "JOURNAL"));
    }
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || `Entry — ${new Date().toLocaleDateString()}`,
        content,
        noteType: "JOURNAL",
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setTitle("");
      setContent("");
      setShowForm(false);
      load();
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Journal
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Quick reflections and daily notes
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded hover:opacity-90 inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New entry
        </button>
      </header>

      {showForm && (
        <form
          onSubmit={submit}
          className="border border-gray-200 dark:border-gray-800 rounded-md p-4 space-y-3 bg-white dark:bg-darkSurface"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={5}
            className="w-full px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white"
            required
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="px-3 py-1.5 bg-primary text-white text-sm rounded hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save entry"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-gray-500">
          No journal entries yet. Start with one above.
        </p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li
              key={n.id}
              className="border border-gray-200 dark:border-gray-800 rounded-md p-3 bg-white dark:bg-darkSurface"
            >
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {n.title}
                </h3>
                <span className="text-[11px] text-gray-500">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {n.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
