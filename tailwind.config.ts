import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.css",
    "./components/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        "dash-bg": "#1a1a1a",
        "dash-bg-soft": "#222222",
        "dash-surface": "#2a2a2a",
        "dash-surface-elev": "#333333",
        "dash-text": "#ffffff",
        "dash-text-soft": "#e8e8e8",
        "dash-text-muted": "#b0b0b0",
        "dash-accent": "#4a90e2",
        "dash-accent-hover": "#5ba0f2",
      },
    },
  },
  plugins: [],
};
export default config;
