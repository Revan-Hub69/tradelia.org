'use client';

import { useEffect } from 'react';

interface Shortcut {
  keys: string[];
  handler: (e: KeyboardEvent) => void;
  description?: string;
}

/**
 * Keyboard Shortcuts Hook
 * Best Practice: Centralizza gestione scorciatoie (WCAG 2.1 SC 2.1.1)
 * 
 * Supporta:
 * - Multiple key combinations
 * - Modifier keys (Ctrl, Alt, Shift, Meta)
 * - Prevent default
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keys = shortcut.keys.map((k) => k.toLowerCase());
        const pressedKey = e.key.toLowerCase();
        
        // Check if all required keys are pressed
        const ctrlPressed = keys.includes('ctrl') ? e.ctrlKey : !e.ctrlKey;
        const altPressed = keys.includes('alt') ? e.altKey : !e.altKey;
        const shiftPressed = keys.includes('shift') ? e.shiftKey : !e.shiftKey;
        const metaPressed = keys.includes('meta') ? e.metaKey : !e.metaKey;
        
        const keyMatches = keys.includes(pressedKey) || 
          (e.ctrlKey && keys.includes('ctrl')) ||
          (e.altKey && keys.includes('alt')) ||
          (e.shiftKey && keys.includes('shift')) ||
          (e.metaKey && keys.includes('meta'));

        if (ctrlPressed && altPressed && shiftPressed && metaPressed && keyMatches) {
          e.preventDefault();
          shortcut.handler(e);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

