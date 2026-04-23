import {
  Code2,
  Calculator,
  Atom,
  Heart,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps the 12 DB tracks into 5 navigable sidebar groups.
 * The `dbTrackTitles` array must exactly match the `title` field
 * in the tracks table — that's the join key.
 */
export type TrackGroup = {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string; // tailwind text color for the icon
  dbTrackTitles: string[]; // exact matches against tracks.title
};

export const TRACK_GROUPS: TrackGroup[] = [
  {
    id: "software",
    name: "Software Engineering",
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
    id: "math",
    name: "Mathematics",
    icon: Calculator,
    color: "text-purple-500",
    dbTrackTitles: ["Mathematics"],
  },
  {
    id: "physics",
    name: "Physics & Chemistry",
    icon: Atom,
    color: "text-teal-500",
    dbTrackTitles: [
      "Physics & General",
      "Chemistry",
      "Engineering Mechanics",
    ],
  },
  {
    id: "biomedical",
    name: "Biomedical",
    icon: Heart,
    color: "text-blue-500",
    dbTrackTitles: [
      "Biomedical Engineering",
      "Neuroscience / Neural Engineering",
    ],
  },
  {
    id: "ee",
    name: "Electrical Engineering",
    icon: Zap,
    color: "text-yellow-500",
    dbTrackTitles: ["Electrical Engineering"],
  },
];
