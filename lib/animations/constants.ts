/**
 * Animation Constants
 * Based on Material Design, Google Research, and Academic Studies
 */

/**
 * Duration constants (in seconds)
 * Research: 150-200ms perceived as instant, 200-300ms for micro, 300-500ms for page
 */
export const DURATION = {
  INSTANT: 0.15, // 150ms - perceived as instant
  FAST: 0.2, // 200ms - microinteractions
  NORMAL: 0.3, // 300ms - microinteractions
  MEDIUM: 0.5, // 500ms - page transitions
  SLOW: 0.8, // 800ms - complex animations
} as const;

/**
 * Easing functions
 * Based on Material Design and research
 */
export const EASING = {
  // Material Design standard easing
  STANDARD: [0.4, 0, 0.2, 1] as [number, number, number, number],
  // Ease-out-quad for microinteractions
  EASE_OUT_QUAD: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  // Spring-like easing
  SPRING: [0.22, 1, 0.36, 1] as [number, number, number, number],
  // Bounce/Spring for playful interactions
  BOUNCE: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
} as const;

/**
 * Stagger delays
 */
export const STAGGER = {
  FAST: 0.05,
  NORMAL: 0.1,
  SLOW: 0.15,
} as const;

/**
 * Transform values
 */
export const TRANSFORM = {
  LIFT: {
    SMALL: -1, // 1px
    MEDIUM: -2, // 2px - research optimal
    LARGE: -4, // 4px
  },
  SCALE: {
    MICRO: 1.01, // 1% - subtle
    SMALL: 1.02, // 2% - research optimal
    MEDIUM: 1.05, // 5%
    LARGE: 1.1, // 10%
  },
} as const;
