import {
  Code2,
  Calculator,
  Atom,
  HeartPulse,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps DB tracks into 5 navigable sidebar groups.
 * The `dbTrackTitles` array must exactly match the `title` field
 * in the tracks table — that's the join key.
 */
export type TrackGroup = {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  dbTrackTitles: string[];
};

export const TRACK_GROUPS: TrackGroup[] = [
  {
    id: "software",
    name: "Software Engineering + Computer Science",
    icon: Code2,
    color: "text-cyan-500",
    dbTrackTitles: [
      "Software Engineering",
      "Computer Science",
      "AI / Machine Learning",
      "Programming Languages",
      "Computational Science",
    ],
  },
  {
    id: "ee",
    name: "Electrical Engineering",
    icon: Zap,
    color: "text-yellow-500",
    dbTrackTitles: ["Electrical Engineering"],
  },
  {
    id: "math",
    name: "Mathematics",
    icon: Calculator,
    color: "text-purple-500",
    dbTrackTitles: ["Mathematics"],
  },
  {
    id: "physics",
    name: "Physics + Chemistry",
    icon: Atom,
    color: "text-teal-500",
    dbTrackTitles: [
      "Physics & General",
      "Chemistry",
      "Engineering Mechanics",
    ],
  },
  {
    id: "biomedical-mechanical",
    name: "Biomedical / Mechanical Engineering",
    icon: HeartPulse,
    color: "text-blue-500",
    dbTrackTitles: [
      "Biomedical Engineering",
      "Mechanical Engineering",
      "Neuroscience / Neural Engineering",
    ],
  },
];
