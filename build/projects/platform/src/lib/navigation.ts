import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  BookOpen,
  Library,
  Github,
  FileText,
  Globe,
  Youtube,
  Target,
  Clock,
  GraduationCap,
  ClipboardCheck,
  PenLine,
  Code2,
  Dna,
  BookMarked,
  Layers,
  Settings as SettingsIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
};

export const TRACKING_ITEMS: NavItem[] = [
  { label: "Study Hours", href: "/tracking/study-hours", icon: Clock },
  { label: "Self-Study Courses", href: "/tracking/courses", icon: GraduationCap },
  { label: "FE/PE Practice", href: "/tracking/fe-pe", icon: ClipboardCheck },
  { label: "LeetCode", href: "/tracking/leetcode", icon: Code2 },
  { label: "Rosalind", href: "/tracking/rosalind", icon: Dna },
  { label: "Textbooks", href: "/tracking/textbooks", icon: BookMarked },
  { label: "Projects", href: "/tracking/projects", icon: Layers },
  { label: "Habits", href: "/tracking/habits", icon: Target },
  { label: "Journal", href: "/tracking/journal", icon: PenLine },
];

export const LIBRARY_ITEMS: NavItem[] = [
  { label: "GitHub Repos", href: "/library/github", icon: Github },
  { label: "PDFs", href: "/library/pdfs", icon: FileText },
  { label: "Websites", href: "/library/websites", icon: Globe },
  { label: "YouTube", href: "/library/youtube", icon: Youtube },
];

export const MORE_ITEMS: NavItem[] = [
  {
    label: "Calendar",
    href: "/calendar",
    icon: Calendar,
    match: (p) => p === "/calendar",
  },
  { label: "Planner", href: "/planner", icon: CalendarDays },
  { label: "Notes", href: "/notes", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

export const DASHBOARD_ITEM: NavItem = {
  label: "Dashboard",
  href: "/",
  icon: LayoutDashboard,
};

export const ALL_RESOURCES_ITEM: NavItem = {
  label: "All Resources",
  href: "/resources",
  icon: Library,
};
