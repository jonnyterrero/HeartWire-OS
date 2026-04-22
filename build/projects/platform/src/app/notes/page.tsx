"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, FileText, Search, ArrowLeft, X } from "lucide-react";

type Note = {
  id: string;
  title: string;
  content: string;
  courseId: string | null;
  course?: { title: string; code: string } | null;
  updatedAt: string;
};

type Course = {
  id: string;
  title: string;
  code: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCourseId, setEditCourseId] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCourseId, setNewCourseId] = useState("");

  const fetchNotes = async () => {
    const q = search ? `?q=${encodeURIComponent(search)}` : "";
    const res = await fetch(`/api/notes${q}`);
    if (res.ok) setNotes(await res.json());
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/notes").then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()),
    ])
      .then(([n, c]) => {
        setNotes(n);
        setCourses(c);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(fetchNotes, 300);
      return () => clearTimeout(timeout);
    }
  }, [search]);

  const createNote = async () => {
    if (!newTitle.trim()) return;
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        content: "",
        courseId: newCourseId || null,
      }),
    });
    if (res.ok) {
      const note = await res.json();
      setNotes((prev) => [note, ...prev]);
      setNewTitle("");
      setShowNew(false);
      openNote(note);
    }
  };

  const openNote = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCourseId(note.courseId || "");
    setEditing(true);
  };

  const saveNote = async () => {
    if (!selectedNote) return;
    const res = await fetch(`/api/notes/${selectedNote.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle.trim(),
        content: editContent,
        courseId: editCourseId || null,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)));
      setSelectedNote(null);
      setEditing(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setEditing(false);
      }
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  if (editing && selectedNote) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              setEditing(false);
              setSelectedNote(null);
            }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" /> Back to notes
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => deleteNote(selectedNote.id)}
              className="px-3 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={saveNote}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
            >
              Save
            </button>
          </div>
        </div>

        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full text-2xl font-bold bg-transparent border-0 outline-none text-gray-900 dark:text-white mb-2 placeholder-gray-400"
          placeholder="Note title"
        />

        <select
          value={editCourseId}
          onChange={(e) => setEditCourseId(e.target.value)}
          className="mb-4 px-3 py-1.5 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded text-sm dark:text-white"
        >
          <option value="">No course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code ? `${c.code} — ` : ""}{c.title}
            </option>
          ))}
        </select>

        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full h-[60vh] bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-sm text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notes</h1>
          <p className="text-gray-500 dark:text-gray-400">{notes.length} notes</p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
        >
          {showNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showNew ? "Cancel" : "New Note"}
        </button>
      </div>

      {showNew && (
        <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-6 flex gap-3">
          <input
            autoFocus
            type="text"
            placeholder="Note title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createNote()}
            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newCourseId}
            onChange={(e) => setNewCourseId(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-gray-700 rounded-md text-sm dark:text-white"
          >
            <option value="">No course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code ? `${c.code} — ` : ""}{c.title}
              </option>
            ))}
          </select>
          <button
            onClick={createNote}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
          >
            Create
          </button>
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No notes yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => openNote(note)}
              className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                    {note.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {note.content
                      ? note.content.slice(0, 120) + (note.content.length > 120 ? "..." : "")
                      : "Empty note"}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  {note.course && (
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                      {note.course.code || note.course.title}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400">{formatDate(note.updatedAt)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
