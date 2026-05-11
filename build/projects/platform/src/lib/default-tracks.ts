// Single source of truth for the default Tracks + Courses HeartWire seeds for
// new (or empty) accounts. Used by /api/seed-defaults and the Track Detail
// Page. Kept as 5 tracks that map 1:1 to the sidebar TRACK_GROUPS so the
// sidebar always renders the courses under the right group.

export type DefaultTrack = {
  title: string;
  color: string;
  courses: string[];
};

export const DEFAULT_TRACKS: readonly DefaultTrack[] = [
  {
    title: "Mathematics",
    color: "purple",
    courses: [
      "Math Foundations",
      "Discrete Mathematics",
      "Multivariable Calculus / Calculus III",
      "Intro to Probability",
      "Differential Equations",
      "Partial Differential Equations",
      "Numerical Analysis",
      "Linear Algebra",
    ],
  },
  {
    title: "Physics + Chemistry",
    color: "teal",
    courses: [
      "Organic Chemistry I & II",
      "Inorganic Chemistry",
      "Biochemistry",
      "Physical Chemistry",
      "Thermodynamics",
    ],
  },
  {
    title: "Electrical Engineering",
    color: "yellow",
    courses: [
      "Circuits & Electronics",
      "Circuits I & II",
      "AC Circuits",
      "DC Circuits",
      "Signals & Systems",
      "Signal Processing",
      "Digital Signal Processing",
      "Intro to Neuroscience",
      "Sensory Systems",
    ],
  },
  {
    title: "Biomedical + Mechanical Engineering",
    color: "blue",
    courses: [
      "Biomedical Instrumentation",
      "Biomedical Signal Processing",
      "Biomechanics",
      "Fluid Mechanics",
      "Biofluid Mechanics",
      "Bioperformance of Material",
      "Neural Engineering",
      "Neural Signal Acquisition",
      "Neural Data Analysis",
    ],
  },
  {
    title: "Software Engineering + Computer Science",
    color: "cyan",
    courses: [
      "Nand2Tetris",
      "Algorithms (MIT 6.006)",
      "Operating Systems",
      "Compilers",
      "Digital Systems & Architecture",
      "Computer Networks",
      "Computer Architecture",
      "Intro to CS (Python)",
      "Full Stack Open",
      "CS50 Web Programming",
      "DevOps with Docker",
      "Backend Engineering",
    ],
  },
] as const;
