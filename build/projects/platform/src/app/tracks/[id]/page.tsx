"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Layers,
  Library as LibraryIcon,
  Plus,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import { PROJECT_LADDERS, type ProjectGroup } from "@/lib/curated";
import { classifyResourceType } from "@/lib/classify-resource";

type Course = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  _count?: { resources: number; tasks: number };
};

type TrackDetail = {
  id: string;
  title: string;
  description: string | null;
  color: string;
  courses: Course[];
};

type Resource = {
  id: string;
  title: string;
  url: string | null;
  description: string | null;
  resourceType: string | null;
  type: string;
  isFavorite: boolean;
  trackId: string | null;
  courseId: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};
const STATUS_CLS: Record<string, string> = {
  NOT_STARTED:
    "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  IN_PROGRESS:
    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300/50 dark:border-blue-700/50",
  COMPLETED:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300/50 dark:border-emerald-700/50",
};

// Map a Track title to the curated ProjectGroup so we can show its project
// ladders on the detail page.
function trackTitleToProjectGroup(title: string): ProjectGroup | null {
  const t = title.toLowerCase();
  if (t.includes("software") || t.includes("computer science")) return "software-cs";
  if (t.includes("electrical")) return "ee";
  if (t.includes("math")) return "math";
  if (t.includes("physic") || t.includes("chem")) return "physics-chem";
  if (
    t.includes("biomedical") ||
    t.includes("mechanical") ||
    t.includes("neuro")
  )
    return "bme-mech";
  return null;
}

function notifyTracksChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("heartwire:tracks-changed"));
  }
}

export default function TrackDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const trackId = params?.id;

  const [track, setTrack] = useState<TrackDetail | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);

  const reload = useCallback(async () => {
    if (!trackId) return;
    setLoading(true);
    try {
      const [trackRes, resourcesRes] = await Promise.all([
        fetch(`/api/tracks/${trackId}`).then((r) => (r.ok ? r.json() : null)),
        fetch(`/api/resources?trackId=${trackId}`).then((r) =>
          r.ok ? r.json() : []
        ),
      ]);
      setTrack(trackRes);
      setResources(Array.isArray(resourcesRes) ? resourcesRes : []);
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const projectGroup = useMemo(
    () => (track ? trackTitleToProjectGroup(track.title) : null),
    [track]
  );
  const ladders = useMemo(
    () =>
      projectGroup
        ? PROJECT_LADDERS.filter((l) => l.trackGroup === projectGroup)
        : [],
    [projectGroup]
  );
  if (!trackId) return null;

  async function deleteTrack() {
    if (!track) return;
    if (
      !window.confirm(
        `Delete "${track.title}" and all of its courses, tasks, and resources? This cannot be undone.`
      )
    )
      return;
    const res = await fetch(`/api/tracks/${track.id}`, { method: "DELETE" });
    if (res.ok) {
      notifyTracksChanged();
      router.push("/");
    }
  }

  async function deleteCourse(courseId: string, title: string) {
    if (!window.confirm(`Delete course "${title}"? This cannot be undone.`))
      return;
    const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
    if (res.ok) {
      notifyTracksChanged();
      reload();
    }
  }

  async function deleteResource(id: string, title: string) {
    if (!window.confirm(`Delete resource "${title}"?`)) return;
    const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
    if (res.ok) reload();
  }

  return (
    <div className="max-w-6xl space-y-8">
      <header className="space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-3 h-3" /> Back
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {track?.title ?? (loading ? "Loading…" : "Track")}
            </h1>
            {track?.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
                {track.description}
              </p>
            )}
          </div>
          {track && (
            <button
              onClick={deleteTrack}
              className="text-xs text-red-500 hover:text-red-600 inline-flex items-center gap-1 border border-red-200 dark:border-red-900/40 rounded px-2 py-1 min-h-[44px] sm:min-h-0"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete track
            </button>
          )}
        </div>
      </header>

      {/* Courses */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Courses
          </h2>
          <button
            onClick={() => setShowAddCourse(true)}
            className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 min-h-[44px] sm:min-h-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add course
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : !track || track.courses.length === 0 ? (
          <p className="text-sm text-gray-500">No courses yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {track.courses.map((c) => (
              <div
                key={c.id}
                className="border border-gray-200 dark:border-gray-800 rounded-md p-3 bg-white dark:bg-darkSurface flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/courses/${c.id}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-primary text-sm leading-snug"
                  >
                    {c.title}
                  </Link>
                  <button
                    onClick={() => deleteCourse(c.id, c.title)}
                    className="text-gray-400 hover:text-red-500 shrink-0"
                    aria-label="Delete course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={clsx(
                      "px-1.5 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wide",
                      STATUS_CLS[c.status] ?? STATUS_CLS.NOT_STARTED
                    )}
                  >
                    {STATUS_LABEL[c.status] ?? c.status}
                  </span>
                  {c._count && (
                    <span className="text-gray-400 tabular-nums">
                      {c._count.resources}r · {c._count.tasks}t
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Projects (curated ladders, by track group) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-2">
          <Layers className="w-4 h-4" /> Projects
        </h2>
        {ladders.length === 0 ? (
          <p className="text-sm text-gray-500">
            No project ladders mapped to this track.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {ladders.map((l) => (
              <div
                key={l.id}
                className="border border-gray-200 dark:border-gray-800 rounded-md p-3 bg-white dark:bg-darkSurface"
              >
                <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                  {l.category}
                </h3>
                <ul className="space-y-1.5">
                  {l.levels.map((lv) => (
                    <li
                      key={lv.level}
                      className="text-xs text-gray-600 dark:text-gray-300"
                    >
                      <span className="font-semibold mr-1">L{lv.level}:</span>
                      {lv.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Resources */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-2">
            <LibraryIcon className="w-4 h-4" /> Resources
          </h2>
          <button
            onClick={() => setShowAddResource(true)}
            className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 min-h-[44px] sm:min-h-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add resource
          </button>
        </div>
        {resources.length === 0 ? (
          <p className="text-sm text-gray-500">
            No resources for this track yet. Library curated resources are
            available under <Link href="/resources" className="underline">All Resources</Link>.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-md">
            {resources.map((r) => (
              <li
                key={r.id}
                className="px-3 py-2 flex items-center justify-between gap-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {r.title}
                  </span>
                  <span className="ml-2 text-[10px] text-gray-400 uppercase tracking-wide">
                    {r.resourceType ?? classifyResourceType(r.url, r.type)}
                  </span>
                  {r.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {r.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-primary inline-flex items-center gap-1 text-xs"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => deleteResource(r.id, r.title)}
                    className="text-gray-400 hover:text-red-500"
                    aria-label="Delete resource"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showAddCourse && track && (
        <AddCourseModal
          trackId={track.id}
          onClose={() => setShowAddCourse(false)}
          onCreated={() => {
            setShowAddCourse(false);
            notifyTracksChanged();
            reload();
          }}
        />
      )}
      {showAddResource && track && (
        <AddResourceModal
          trackId={track.id}
          courses={track.courses}
          onClose={() => setShowAddResource(false)}
          onCreated={() => {
            setShowAddResource(false);
            reload();
          }}
        />
      )}
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-darkSurface w-full max-w-md rounded-md border border-gray-200 dark:border-gray-800 p-4 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

function AddCourseModal({
  trackId,
  onClose,
  onCreated,
}: {
  trackId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        trackId,
        description: description.trim() || undefined,
      }),
    });
    setBusy(false);
    if (res.ok) onCreated();
  }

  return (
    <ModalShell title="Add course" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Course name"
          className="w-full px-2 py-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-sm min-h-[44px]"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={3}
          className="w-full px-2 py-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs rounded border border-gray-200 dark:border-gray-700 min-h-[44px] sm:min-h-0"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !title.trim()}
            className="px-3 py-2 text-xs rounded bg-primary text-white disabled:opacity-50 min-h-[44px] sm:min-h-0"
          >
            {busy ? "Adding…" : "Add"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function AddResourceModal({
  trackId,
  courses,
  onClose,
  onCreated,
}: {
  trackId: string;
  courses: Course[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [resourceType, setResourceType] = useState<
    "GITHUB_REPO" | "YOUTUBE_VIDEO" | "PDF" | "WEBSITE" | "AUTO"
  >("AUTO");
  const [courseId, setCourseId] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    const body: Record<string, unknown> = {
      title: title.trim(),
      url: url.trim() || undefined,
      trackId,
      courseId: courseId || undefined,
    };
    if (resourceType !== "AUTO") body.resourceType = resourceType;
    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) onCreated();
  }

  return (
    <ModalShell title="Add resource" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full px-2 py-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-sm min-h-[44px]"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className="w-full px-2 py-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-sm min-h-[44px]"
        />
        <select
          value={resourceType}
          onChange={(e) =>
            setResourceType(e.target.value as typeof resourceType)
          }
          className="w-full px-2 py-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-sm min-h-[44px]"
        >
          <option value="AUTO">Auto-detect type</option>
          <option value="GITHUB_REPO">GitHub Repo</option>
          <option value="YOUTUBE_VIDEO">YouTube Video</option>
          <option value="PDF">PDF</option>
          <option value="WEBSITE">Website</option>
        </select>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full px-2 py-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-sm min-h-[44px]"
        >
          <option value="">Track-level (no course)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs rounded border border-gray-200 dark:border-gray-700 min-h-[44px] sm:min-h-0"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !title.trim()}
            className="px-3 py-2 text-xs rounded bg-primary text-white disabled:opacity-50 min-h-[44px] sm:min-h-0"
          >
            {busy ? "Adding…" : "Add"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
