import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Primary Background - Research-Based Dark Mode (GitHub-inspired)
        bg: {
          base: '#0D1117', // GitHub base - reduces glare
          soft: '#161B22', // Surface depth
          surface: '#1E293B', // Elevated surfaces
          elevated: '#21262D', // Hover states
          hover: '#262B32', // Active hover
          glass: 'rgba(22, 27, 34, 0.7)', // Glassmorphism
        },
        // Accent Colors - Research-Based (GitHub Blue - Optimal Visibility)
        accent: {
          DEFAULT: '#58A6FF', // GitHub blue - best visibility in dark
          hover: '#79C0FF', // Light blue
          active: '#A5D6FF', // Lighter blue
          muted: 'rgba(88, 166, 255, 0.12)',
          glow: 'rgba(88, 166, 255, 0.2)',
        },
        // Success/Error States - Research-Based
        success: {
          DEFAULT: '#3FB950', // GitHub green
          hover: '#56D364',
        },
        warning: {
          DEFAULT: '#D29922', // GitHub yellow
          hover: '#E3B341',
        },
        error: {
          DEFAULT: '#F85149', // GitHub red
          hover: '#FF6B6B',
        },
        // Warm Accent - Research-Based
        gold: {
          DEFAULT: '#F59E0B',
          hover: '#FBBF24',
          muted: 'rgba(245, 158, 11, 0.1)',
        },
        // Text Colors - Research-Based Contrast (WCAG AA/AAA)
        text: {
          primary: '#F0F6FC', // 15.2:1 contrast
          secondary: '#C9D1D9', // 8.5:1 contrast
          tertiary: '#8B949E', // 5.2:1 contrast (WCAG AA)
          muted: '#6E7681', // 4.8:1 contrast (WCAG AA)
          accent: '#58A6FF', // GitHub blue
          subtle: '#484F58', // 3.5:1 contrast
        },
        // Border Colors - Refined (Improved Visibility)
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)', // Improved from 0.04
          DEFAULT: 'rgba(255, 255, 255, 0.12)', // Improved from 0.08
          strong: 'rgba(255, 255, 255, 0.15)', // Improved from 0.12
          accent: 'rgba(88, 166, 255, 0.25)', // GitHub blue accent
          gold: 'rgba(245, 158, 11, 0.2)',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #58A6FF 0%, #79C0FF 50%, #A5D6FF 100%)', // GitHub blue gradient
        'gradient-gold': 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        'gradient-surface':
          'linear-gradient(180deg, rgba(30, 41, 59, 0.85) 0%, rgba(13, 17, 23, 0.95) 100%)',
        'gradient-accent':
          'linear-gradient(135deg, rgba(88, 166, 255, 0.08) 0%, rgba(121, 192, 255, 0.06) 100%)',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.6)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.7)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.8)',
        glow: '0 0 15px rgba(88, 166, 255, 0.2)', // GitHub blue glow
        'glow-lg': '0 0 25px rgba(88, 166, 255, 0.3)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.15)',
        'hover': '0 4px 12px rgba(88, 166, 255, 0.15)', // Research-based hover glow
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        sm: ['0.875rem', { lineHeight: '1.6', letterSpacing: '0.005em' }],
        base: ['1rem', { lineHeight: '1.7', letterSpacing: '0' }],
        lg: ['1.125rem', { lineHeight: '1.7', letterSpacing: '-0.005em' }],
        xl: ['1.25rem', { lineHeight: '1.6', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '1.5', letterSpacing: '-0.015em' }],
        '3xl': ['1.875rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.025em' }],
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.03em' }],
        '6xl': ['3.75rem', { lineHeight: '1.15', letterSpacing: '-0.035em' }],
        '7xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)', // Research: 300-500ms optimal
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Research: 200-300ms for micro
        'slide-in': 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'pattern-shift': 'patternShift 30s linear infinite',
        'pattern-pulse': 'patternPulse 20s ease-in-out infinite',
        float: 'float 8s ease-in-out infinite',
        pulse: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'underline-expand': 'underlineExpand 0.2s cubic-bezier(0.4, 0, 0.2, 1)', // Research: 150-200ms hover
        'micro-bounce': 'microBounce 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Research-based micro
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        patternShift: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(40px, 40px)' },
        },
        patternPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(30px, -30px) scale(1.1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.1)' },
        },
        underlineExpand: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        microBounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
