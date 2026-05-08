// Curated reference content sourced from the Prep Atlas mini-app.
// This is static reference data (like a textbook bibliography) — it ships with
// the app, doesn't change per user, and lives in code, not the database.
// User-specific progress on these items lives in localStorage today; if/when
// HeartWire grows a real `UserProgress` table, the storage layer in
// `useCuratedProgress` is the only thing that needs to change.

export type TrackId =
  | "fe-electrical"
  | "fe-mechanical"
  | "fe-other"
  | "pe"
  | "biomedical-interview"
  | "bioinformatics"
  | "dsa";

export const TRACK_LABELS: Record<TrackId, string> = {
  "fe-electrical": "FE Electrical",
  "fe-mechanical": "FE Mechanical",
  "fe-other": "FE Other / Civil",
  pe: "PE (Professional)",
  "biomedical-interview": "Biomedical Interview",
  bioinformatics: "Bioinformatics",
  dsa: "DSA / Coding Interviews",
};

export { CURATED_TOPICS } from "./topics";
export { CURATED_RESOURCES } from "./resources";
export { LEETCODE_PROBLEMS } from "./leetcode";
export { ROSALIND_PROBLEMS } from "./rosalind";
export { PROJECT_LADDERS, PROJECT_GROUP_LABELS } from "./projects";
export type { CuratedTopic } from "./topics";
export type { CuratedResource } from "./resources";
export type { LeetCodeProblem } from "./leetcode";
export type { RosalindProblem } from "./rosalind";
export type { ProjectLadder, ProjectGroup } from "./projects";
