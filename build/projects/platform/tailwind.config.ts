import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0EA5E9",
        darkBg: "#0a0a12",
        darkSurface: "#14141f",
        darkElevated: "#1c1c28",
        notionGray: "#F8F7FF",
        hw: {
          sky: "#0EA5E9",
          lavender: "#A5B4FC",
          fuchsia: "#E879F9",
          coral: "#FCA5A5",
          ghost: "#F8F7FF",
          cyan: "#99E6FF",
        },
        blue: {
          300: "#99E6FF",
          400: "#38bdf8",
          500: "#0EA5E9",
          600: "#0EA5E9",
          700: "#0284C7",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
export default config;
