/**
 * Custom hook for focus management
 * Manages focus trap for modals and drawers
 * Based on WAI-ARIA focus management patterns
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UseFocusManagementOptions {
  enabled?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  returnFocus?: boolean;
  returnFocusElement?: HTMLElement | null;
}

/**
 * Hook for focus management in modals/drawers
 */
export function useFocusManagement({
  enabled = true,
  initialFocus,
  returnFocus = true,
  returnFocusElement,
}: UseFocusManagementOptions = {}) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Save previous focus
  useEffect(() => {
    if (enabled) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [enabled]);

  // Focus initial element
  useEffect(() => {
    if (!enabled) return;

    if (initialFocus?.current) {
      initialFocus.current.focus();
    } else if (containerRef.current) {
      // Find first focusable element
      const focusable = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      if (focusable) {
        focusable.focus();
      }
    }
  }, [enabled, initialFocus]);

  // Focus trap
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTab);
    return () => {
      container.removeEventListener('keydown', handleTab);
    };
  }, [enabled]);

  // Return focus on unmount
  const returnFocusToPrevious = useCallback(() => {
    if (returnFocus && previousActiveElement.current) {
      previousActiveElement.current.focus();
    } else if (returnFocus && returnFocusElement) {
      returnFocusElement.focus();
    }
  }, [returnFocus, returnFocusElement]);

  useEffect(() => {
    return () => {
      if (enabled) {
        returnFocusToPrevious();
      }
    };
  }, [enabled, returnFocusToPrevious]);

  return {
    containerRef,
    returnFocusToPrevious,
  };
}

