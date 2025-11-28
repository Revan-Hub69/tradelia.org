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
        // Primary Background - Academic Professional
        bg: {
          base: '#0B1426',
          soft: '#0F1A2E',
          surface: '#141F35',
          elevated: '#1A253C',
          hover: '#1F2A42',
          glass: 'rgba(20, 31, 53, 0.7)',
        },
        // Accent Colors - Professional & Subtle
        accent: {
          DEFAULT: '#6366F1',
          hover: '#818CF8',
          active: '#A5B4FC',
          muted: 'rgba(99, 102, 241, 0.12)',
          glow: 'rgba(99, 102, 241, 0.2)',
        },
        // Academic Gold Accent
        gold: {
          DEFAULT: '#F59E0B',
          hover: '#FBBF24',
          muted: 'rgba(245, 158, 11, 0.1)',
        },
        // Text Colors - Academic Readability
        text: {
          primary: '#FAFAFA',
          secondary: '#E5E7EB',
          tertiary: '#9CA3AF',
          muted: '#6B7280',
          accent: '#6366F1',
          subtle: '#4B5563',
        },
        // Border Colors - Refined
        border: {
          subtle: 'rgba(255, 255, 255, 0.04)',
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          strong: 'rgba(255, 255, 255, 0.12)',
          accent: 'rgba(99, 102, 241, 0.25)',
          gold: 'rgba(245, 158, 11, 0.2)',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%)',
        'gradient-gold': 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        'gradient-surface':
          'linear-gradient(180deg, rgba(20, 31, 53, 0.85) 0%, rgba(11, 20, 38, 0.95) 100%)',
        'gradient-accent':
          'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.6)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.7)',
        glow: '0 0 15px rgba(99, 102, 241, 0.2)',
        'glow-lg': '0 0 25px rgba(99, 102, 241, 0.3)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.15)',
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
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-in': 'slideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        'pattern-shift': 'patternShift 30s linear infinite',
        'pattern-pulse': 'patternPulse 20s ease-in-out infinite',
        float: 'float 8s ease-in-out infinite',
        pulse: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'underline-expand': 'underlineExpand 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
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
