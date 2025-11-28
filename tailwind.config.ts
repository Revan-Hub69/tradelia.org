import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Background
        bg: {
          base: "#0A0E27",
          soft: "#0F1429",
          surface: "#141B2D",
          elevated: "#1A2332",
          hover: "#1F2A3A",
        },
        // Accent Colors
        accent: {
          DEFAULT: "#00BCD4",
          hover: "#26C6DA",
          active: "#4DD0E1",
          blue: "#0073E6",
          "blue-hover": "#1A8CFF",
          muted: "rgba(0, 188, 212, 0.15)",
          glow: "rgba(0, 188, 212, 0.3)",
        },
        // Text Colors
        text: {
          primary: "#FFFFFF",
          secondary: "#E8E8E8",
          tertiary: "#B0B0B0",
          muted: "#6B7280",
          accent: "#00BCD4",
        },
        // Border Colors
        border: {
          subtle: "rgba(255, 255, 255, 0.05)",
          DEFAULT: "rgba(255, 255, 255, 0.1)",
          strong: "rgba(255, 255, 255, 0.15)",
          accent: "rgba(0, 188, 212, 0.3)",
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #0073E6 0%, #00BCD4 100%)",
        "gradient-surface": "linear-gradient(180deg, rgba(20, 27, 45, 0.8) 0%, rgba(10, 14, 39, 0.9) 100%)",
        "gradient-accent": "linear-gradient(135deg, rgba(0, 115, 230, 0.1) 0%, rgba(0, 188, 212, 0.1) 100%)",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.4)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.6)",
        glow: "0 0 20px rgba(0, 188, 212, 0.3)",
        "glow-lg": "0 0 30px rgba(0, 188, 212, 0.4)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.05em" }],
        sm: ["0.875rem", { lineHeight: "1.6" }],
        base: ["1rem", { lineHeight: "1.75" }],
        lg: ["1.125rem", { lineHeight: "1.75" }],
        xl: ["1.25rem", { lineHeight: "1.75" }],
        "2xl": ["1.5rem", { lineHeight: "1.3" }],
        "3xl": ["1.875rem", { lineHeight: "1.2" }],
        "4xl": ["2.25rem", { lineHeight: "1.1" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
        "7xl": ["4.5rem", { lineHeight: "1.1" }],
      },
      letterSpacing: {
        tighter: "-0.03em",
        tight: "-0.025em",
        normal: "0",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.8s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pattern-shift": "patternShift 20s linear infinite",
        "pattern-pulse": "patternPulse 15s ease-in-out infinite",
        float: "float 20s ease-in-out infinite",
        pulse: "pulse 2s ease-in-out infinite",
        "underline-expand": "underlineExpand 1s ease-out",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        patternShift: {
          "0%": { transform: "translate(0, 0)" },
          "100%": { transform: "translate(40px, 40px)" },
        },
        patternPulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(30px, -30px) scale(1.1)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.1)" },
        },
        underlineExpand: {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
