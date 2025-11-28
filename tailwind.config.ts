import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Primary Background - Institutional/Professional (Bloomberg-inspired)
        bg: {
          base: "#0A0E1A", // Navy dark - Elegant and professional
          soft: "#131720", // Slightly lighter navy
          surface: "#1A1F2E", // Card background - Refined
          elevated: "#1F2533", // Hover states
          hover: "#242A38", // Active hover
          glass: "rgba(26, 31, 46, 0.6)", // Glassmorphism
        },
        // Accent Colors - Professional Blue (Institutional)
        accent: {
          DEFAULT: "#3B82F6", // Blue 500 - Professional, not too vibrant
          hover: "#2563EB", // Blue 600 - Darker on hover
          active: "#1D4ED8", // Blue 700 - Active state
          muted: "rgba(59, 130, 246, 0.1)",
          glow: "rgba(59, 130, 246, 0.15)",
        },
        // Success/Error States - Professional
        success: {
          DEFAULT: "#10B981", // Green 500 - Professional
          hover: "#059669",
        },
        warning: {
          DEFAULT: "#F59E0B", // Amber 500 - Professional
          hover: "#D97706",
        },
        error: {
          DEFAULT: "#EF4444", // Red 500 - Professional
          hover: "#DC2626",
        },
        // Warm Accent - Professional
        gold: {
          DEFAULT: "#F59E0B",
          hover: "#D97706",
          muted: "rgba(245, 158, 11, 0.1)",
        },
        // Text Colors - Professional Contrast (WCAG AA/AAA)
        text: {
          primary: "#E8EDF3", // Warm white - Professional
          secondary: "#B8C5D1", // Elegant blue-gray
          tertiary: "#8B95A5", // Neutral gray
          muted: "#6B7480", // Dark gray
          accent: "#3B82F6", // Professional blue
          subtle: "#4B5563", // Subtle gray
        },
        // Border Colors - Professional and Subtle
        border: {
          subtle: "rgba(255, 255, 255, 0.05)",
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          strong: "rgba(255, 255, 255, 0.12)",
          accent: "rgba(59, 130, 246, 0.2)", // More discrete professional blue
          gold: "rgba(245, 158, 11, 0.2)",
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)", // Professional blue gradient (kept for compatibility)
        "gradient-gold": "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
        "gradient-surface":
          "linear-gradient(180deg, rgba(26, 31, 46, 0.85) 0%, rgba(10, 14, 26, 0.95) 100%)",
        "gradient-accent":
          "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.06) 100%)",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.5)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.6)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.7)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.8)",
        glow: "0 0 15px rgba(59, 130, 246, 0.15)", // Professional blue glow - more subtle
        "glow-lg": "0 0 25px rgba(59, 130, 246, 0.2)",
        "glow-gold": "0 0 20px rgba(245, 158, 11, 0.12)",
        hover: "0 2px 8px rgba(0, 0, 0, 0.15)", // Subtle professional shadow
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.75", letterSpacing: "0.01em" }], // Research: +0.15 for dark mode
        sm: ["0.875rem", { lineHeight: "1.75", letterSpacing: "0.005em" }],
        base: ["1rem", { lineHeight: "1.8", letterSpacing: "0" }], // Research: 1.75-1.8 optimal
        lg: ["1.125rem", { lineHeight: "1.8", letterSpacing: "-0.005em" }],
        xl: ["1.25rem", { lineHeight: "1.75", letterSpacing: "-0.01em" }],
        "2xl": ["1.5rem", { lineHeight: "1.6", letterSpacing: "-0.015em" }],
        "3xl": ["1.875rem", { lineHeight: "1.5", letterSpacing: "-0.02em" }],
        "4xl": ["2.25rem", { lineHeight: "1.4", letterSpacing: "-0.025em" }],
        "5xl": ["3rem", { lineHeight: "1.3", letterSpacing: "-0.03em" }],
        "6xl": ["3.75rem", { lineHeight: "1.25", letterSpacing: "-0.035em" }],
        "7xl": ["4.5rem", { lineHeight: "1.2", letterSpacing: "-0.04em" }],
      },
      letterSpacing: {
        tighter: "-0.03em",
        tight: "-0.025em",
        normal: "0",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.12em", // Research: 0.12-0.15em for uppercase in dark mode
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)", // Research: 300-500ms optimal
        "fade-in": "fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Research: 200-300ms for micro
        "slide-in": "slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "pattern-shift": "patternShift 30s linear infinite",
        "pattern-pulse": "patternPulse 20s ease-in-out infinite",
        float: "float 8s ease-in-out infinite",
        pulse: "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "underline-expand": "underlineExpand 0.2s cubic-bezier(0.4, 0, 0.2, 1)", // Research: 150-200ms hover
        "micro-bounce": "microBounce 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)", // Research-based micro
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
        microBounce: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
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
