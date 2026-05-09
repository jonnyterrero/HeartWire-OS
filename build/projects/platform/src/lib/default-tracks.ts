// Single source of truth for the default Tracks + Courses HeartWire seeds for
// new (or empty) accounts. Used by /api/seed-defaults and the Track Detail
// Page's "Seed default courses" action.

export type DefaultTrack = {
  title: string;
  color: string;
  courses: string[];
};

export const DEFAULT_TRACKS: readonly DefaultTrack[] = [
  {
    title: "Software Engineering",
    color: "cyan",
    courses: [
      "Full Stack Open",
      "CS50 Web Programming",
      "Backend Engineering",
      "DevOps with Docker",
    ],
  },
  {
    title: "Computer Science",
    color: "cyan",
    courses: [
      "Intro to CS (Python)",
      "Nand2Tetris",
      "Algorithms (MIT 6.006)",
      "Operating Systems",
      "Compilers",
      "Digital Systems & Architecture",
      "Computer Networks",
      "Computer Architecture",
    ],
  },
  {
    title: "Electrical Engineering",
    color: "yellow",
    courses: [
      "Circuits & Electronics",
      "Signals & Systems",
      "Signal Processing",
      "Digital Signal Processing",
      "Intro to Neuroscience",
      "Sensory Systems",
      "Neural Engineering",
      "Neural Signal Acquisition",
      "Neural Data Analysis",
    ],
  },
  {
    title: "Mathematics",
    color: "purple",
    courses: [
      "Math Foundations",
      "Discrete Mathematics",
      "Linear Algebra",
      "Multivariable Calculus / Calculus III",
      "Intro to Probability",
      "Differential Equations",
      "Partial Differential Equations",
      "Numerical Analysis",
    ],
  },
  {
    title: "Physics & General",
    color: "teal",
    courses: ["Thermodynamics", "Physical Chemistry"],
  },
  {
    title: "Chemistry",
    color: "teal",
    courses: [
      "Organic Chemistry I & II",
      "Inorganic Chemistry",
      "Biochemistry",
    ],
  },
  {
    title: "Biomedical Engineering",
    color: "blue",
    courses: [
      "Biomedical Instrumentation",
      "Biomedical Signal Processing",
      "Biomechanics",
      "Biofluid Mechanics",
      "Bioperformance of Material",
    ],
  },
  {
    title: "Mechanical Engineering",
    color: "blue",
    courses: ["Fluid Mechanics"],
  },
] as const;
