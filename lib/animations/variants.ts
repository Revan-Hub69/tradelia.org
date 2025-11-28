/**
 * Centralized Animation Variants
 * Based on Material Design, Framer Motion Research, and Academic Studies
 * 
 * All animations respect prefers-reduced-motion
 */

import type { Variants } from 'framer-motion';

/**
 * Container variants for staggered animations
 */
export const createContainerVariants = (prefersReducedMotion: boolean): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: prefersReducedMotion
      ? {}
      : {
          staggerChildren: 0.1,
          delayChildren: 0.2,
        },
  },
});

/**
 * Item variants for fade-in-up animations
 */
export const createItemVariants = (prefersReducedMotion: boolean): Variants => ({
  hidden: prefersReducedMotion ? {} : { opacity: 0, y: 30 },
  visible: prefersReducedMotion
    ? {}
    : {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1], // Spring-like easing
        },
      },
});

/**
 * Slide-in variants (left to right)
 */
export const createSlideInVariants = (prefersReducedMotion: boolean): Variants => ({
  hidden: prefersReducedMotion ? {} : { opacity: 0, x: -30 },
  visible: prefersReducedMotion
    ? {}
    : {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1], // Material Design easing
        },
      },
});

/**
 * Scale variants for microinteractions
 */
export const createScaleVariants = (prefersReducedMotion: boolean): Variants => ({
  hidden: prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 },
  visible: prefersReducedMotion
    ? {}
    : {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94], // Ease-out-quad
        },
      },
});

/**
 * Float animation for decorative elements
 */
export const createFloatVariants = (prefersReducedMotion: boolean) => ({
  animate: prefersReducedMotion
    ? {}
    : {
        y: [0, -20, 0],
        transition: {
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
});

/**
 * Gradient pulse animation for backgrounds
 */
export const createGradientPulse = (prefersReducedMotion: boolean) => ({
  scale: prefersReducedMotion ? [1] : [1, 1.08, 1],
  opacity: prefersReducedMotion ? [0.4] : [0.4, 0.6, 0.4],
  transition: prefersReducedMotion
    ? {}
    : {
        duration: 25,
        repeat: Infinity,
        ease: 'easeInOut',
      },
});

/**
 * Hover variants for interactive elements
 */
export const createHoverVariants = (prefersReducedMotion: boolean) => ({
  rest: {},
  hover: prefersReducedMotion
    ? {}
    : {
        y: -2,
        scale: 1.02,
        transition: {
          duration: 0.15,
          ease: [0.4, 0, 0.2, 1],
        },
      },
  tap: prefersReducedMotion
    ? {}
    : {
        scale: 0.98,
        transition: {
          duration: 0.1,
        },
      },
});

/**
 * Page transition variants
 */
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};
