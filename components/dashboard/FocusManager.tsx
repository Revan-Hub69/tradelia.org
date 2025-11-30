'use client';

import { useEffect, useRef } from 'react';

interface FocusManagerProps {
  children: React.ReactNode;
  trapFocus?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  returnFocus?: boolean;
  onEscape?: () => void;
}

/**
 * Focus Management Component
 * Best Practice: Gestisce focus per accessibilità (WCAG 2.1 SC 2.4.3, 2.4.7)
 * 
 * Implementa:
 * - Focus trap per modali
 * - Return focus dopo chiusura
 * - Keyboard navigation migliorata
 */
export function FocusManager({
  children,
  trapFocus = false,
  initialFocus,
  returnFocus = true,
  onEscape,
}: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Salva elemento attivo prima
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus iniziale
    if (initialFocus?.current) {
      initialFocus.current.focus();
    } else if (containerRef.current) {
      const firstFocusable = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }

    // Focus trap
    if (trapFocus && containerRef.current) {
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        const focusableElements = containerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    }

    // Return focus on unmount
    return () => {
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [trapFocus, initialFocus, returnFocus]);

  useEffect(() => {
    if (!onEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onEscape]);

  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  );
}

