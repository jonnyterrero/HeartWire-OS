/** HeartWire brand palette — shared by Tailwind and runtime UI. */
export const brand = {
  sky: "#0EA5E9",
  lavender: "#A5B4FC",
  fuchsia: "#E879F9",
  coral: "#FCA5A5",
  ghost: "#F8F7FF",
  cyan: "#99E6FF",
  darkBg: "#0a0a12",
  darkSurface: "#14141f",
  darkElevated: "#1c1c28",
} as const;

export const brandGradient = `linear-gradient(90deg, ${brand.sky}, ${brand.lavender}, ${brand.fuchsia})`;
