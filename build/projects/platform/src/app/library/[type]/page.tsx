"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ExternalLink, Star } from "lucide-react";
import { CURATED_RESOURCES } from "@/lib/curated";
import {
  classifyResourceType,
  type LibraryBucket,
} from "@/lib/classify-resource";

const SLUG_TO_BUCKET: Record<string, LibraryBucket> = {
  github: "github",
  pdfs: "pdf",
  websites: "website",
  youtube: "youtube",
};
const SLUG_TO_TITLE: Record<string, string> = {
  github: "GitHub Repos",
  pdfs: "PDFs",
  websites: "Websites",
  youtube: "YouTube",
};

type UserResource = {
  id: string;
  title: string;
  type: string;
  resourceType: string | null;
  url: string | null;
  description: string | null;
  isFavorite: boolean;
  createdAt: string;
};

type Row = {
  key: string;
  title: string;
  url: string | null;
  description: string | null;
  source: string;
  isCurated: boolean;
  // Only populated for user-added resources.
  userId?: string;
  isFavorite?: boolean;
};

export default function LibraryTypePage() {
  const params = useParams<{ type: string }>();
  const slug = params?.type ?? "";
  const bucket = SLUG_TO_BUCKET[slug];
  const title = SLUG_TO_TITLE[slug] ?? "Library";
  const [userResources, setUserResources] = useState<UserResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bucket) {
      setLoading(false);
      return;
    }
    fetch(`/api/resources`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: UserResource[]) => {
        setUserResources(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [bucket]);

  const rows = useMemo<Row[]>(() => {
    if (!bucket) return [];

    const curated: Row[] = CURATED_RESOURCES.filter(
      (r) => classifyResourceType(r.url, r.type) === bucket
    ).map((r) => ({
      key: `c-${r.id}`,
      title: r.title,
      url: r.url,
      description: r.description,
      source: r.source,
      isCurated: true,
    }));

    const user: Row[] = userResources
      .filter((r) => {
        // Trust persisted resourceType if it lines up with this bucket; else
        // fall back to URL classification.
        const persisted = (r.resourceType ?? "").toUpperCase();
        const persistedBucket =
          persisted === "GITHUB_REPO"
            ? "github"
            : persisted === "PDF"
            ? "pdf"
            : persisted === "WEBSITE"
            ? "website"
            : persisted === "YOUTUBE_VIDEO" || persisted === "YOUTUBE_PLAYLIST"
            ? "youtube"
            : null;
        const computed = classifyResourceType(r.url, r.type);
        return (persistedBucket ?? computed) === bucket;
      })
      .map((r) => ({
        key: `u-${r.id}`,
        title: r.title,
        url: r.url,
        description: r.description,
        source: r.type || "User",
        isCurated: false,
        userId: r.id,
        isFavorite: r.isFavorite,
      }));

    return [...user, ...curated];
  }, [bucket, userResources]);

  if (!bucket) {
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
    setUserResources((arr) =>
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
          {rows.length} resource{rows.length === 1 ? "" : "s"}
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">
          No resources yet. Add one from the Resources page.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-md">
          {rows.map((r) => (
            <li
              key={r.key}
              className="px-3 py-2 flex items-center justify-between gap-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {r.isCurated ? (
                    <Star
                      className="w-3.5 h-3.5 text-amber-500"
                      fill="currentColor"
                      aria-label="Curated"
                    />
                  ) : (
                    <button
                      onClick={() =>
                        r.userId && toggleFavorite(r.userId, !!r.isFavorite)
                      }
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
                  )}
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {r.title}
                  </span>
                  <span className="text-[10px] text-gray-400 shrink-0 truncate">
                    {r.source}
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
