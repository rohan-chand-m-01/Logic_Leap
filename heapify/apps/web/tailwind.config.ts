import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#1E3A5F", light: "#2E4F7F", dark: "#142845" },
        blue: { DEFAULT: "#2E6DA4", light: "#3D8ECF", dark: "#1F5080" },
        teal: { DEFAULT: "#1A7A6E", light: "#23A394", dark: "#115248" },
        amber: { DEFAULT: "#E8A020", light: "#F0B840", dark: "#C07010" },
        risk: { red: "#C0392B", yellow: "#E8A020", green: "#1A7A4A" },
        surface: "#F4F6F9",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
