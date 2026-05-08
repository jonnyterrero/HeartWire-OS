"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ExternalLink, Star } from "lucide-react";

const SLUG_TO_TYPES: Record<string, string[]> = {
  github: ["GITHUB_REPO"],
  pdfs: ["PDF"],
  websites: ["WEBSITE"],
  youtube: ["YOUTUBE_VIDEO", "YOUTUBE_PLAYLIST"],
};
const SLUG_TO_TITLE: Record<string, string> = {
  github: "GitHub Repos",
  pdfs: "PDFs",
  websites: "Websites",
  youtube: "YouTube",
};

type Resource = {
  id: string;
  title: string;
  type: string;
  resourceType: string | null;
  url: string | null;
  description: string | null;
  isFavorite: boolean;
  createdAt: string;
};

export default function LibraryTypePage() {
  const params = useParams<{ type: string }>();
  const slug = params?.type ?? "";
  const types = SLUG_TO_TYPES[slug] ?? [];
  const title = SLUG_TO_TITLE[slug] ?? "Library";
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (types.length === 0) {
      setLoading(false);
      return;
    }
    fetch(`/api/resources?resourceType=${types.join(",")}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Resource[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (types.length === 0) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Library
        </h1>
        <p className="text-sm text-gray-500">Unknown library section: {slug}</p>
      </div>
    );
  }

  async function toggleFavorite(id: string, current: boolean) {
    setItems((arr) =>
      arr.map((i) => (i.id === id ? { ...i, isFavorite: !current } : i))
    );
    await fetch(`/api/resources/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !current }),
    });
  }

  return (
    <div className="max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {items.length} resource{items.length === 1 ? "" : "s"}
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">
          No resources yet. Add one from the Resources page.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-md">
          {items.map((r) => (
            <li
              key={r.id}
              className="px-3 py-2 flex items-center justify-between gap-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(r.id, r.isFavorite)}
                    className={
                      r.isFavorite
                        ? "text-amber-500"
                        : "text-gray-400 hover:text-amber-500"
                    }
                    aria-label="Toggle favorite"
                  >
                    <Star
                      className="w-3.5 h-3.5"
                      fill={r.isFavorite ? "currentColor" : "none"}
                    />
                  </button>
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {r.title}
                  </span>
                </div>
                {r.description && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {r.description}
                  </p>
                )}
              </div>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
