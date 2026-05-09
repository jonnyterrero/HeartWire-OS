// Buckets the Library sidebar slices into. Every resource (curated or
// user-added) maps to exactly one bucket.
export type LibraryBucket = "github" | "youtube" | "pdf" | "website";

export const LIBRARY_BUCKETS: LibraryBucket[] = [
  "github",
  "youtube",
  "pdf",
  "website",
];

const PDF_HINTS = [
  "pdf",
  "textbook",
  "book",
  "lecture-notes",
  "lecture notes",
  "handbook",
  "reference",
];

/**
 * Classifies a resource into one of four library buckets. Pure: takes the URL
 * and an optional label/type tag and returns the bucket. URL signals win over
 * label hints when they conflict.
 */
export function classifyResourceType(
  url: string | null | undefined,
  label?: string | null
): LibraryBucket {
  const u = (url ?? "").toLowerCase().trim();
  const l = (label ?? "").toLowerCase().trim();

  if (u) {
    if (u.includes("github.com") || u.includes("github.io")) return "github";
    if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
    // Strip query/fragment for extension check.
    const path = u.split("?")[0].split("#")[0];
    if (path.endsWith(".pdf")) return "pdf";
  }

  if (l) {
    if (l.includes("github") || l === "repo") return "github";
    if (l.includes("youtube") || l.includes("video") || l.includes("playlist"))
      return "youtube";
    if (PDF_HINTS.some((h) => l.includes(h))) return "pdf";
  }

  return "website";
}

/**
 * Maps the four-bucket classification to the Prisma `ResourceType` enum,
 * for persistence on user-added resources.
 */
export function bucketToResourceTypeEnum(
  bucket: LibraryBucket
): "GITHUB_REPO" | "YOUTUBE_VIDEO" | "PDF" | "WEBSITE" {
  switch (bucket) {
    case "github":
      return "GITHUB_REPO";
    case "youtube":
      return "YOUTUBE_VIDEO";
    case "pdf":
      return "PDF";
    case "website":
      return "WEBSITE";
  }
}
