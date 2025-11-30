/**
 * Custom hook for keyboard navigation
 * Implements arrow key navigation for lists
 * Based on WAI-ARIA keyboard navigation patterns
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseKeyboardNavigationOptions {
  itemCount: number;
  onSelect?: (index: number) => void;
  enabled?: boolean;
  loop?: boolean;
}

/**
 * Hook for keyboard navigation in lists
 */
export function useKeyboardNavigation({
  itemCount,
  onSelect,
  enabled = true,
  loop = true,
}: UseKeyboardNavigationOptions) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled || itemCount === 0) return;

    let newIndex = selectedIndex;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        newIndex = loop
          ? (selectedIndex + 1) % itemCount
          : Math.min(selectedIndex + 1, itemCount - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = loop
          ? (selectedIndex - 1 + itemCount) % itemCount
          : Math.max(selectedIndex - 1, 0);
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = itemCount - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onSelect) {
          onSelect(selectedIndex);
        }
        return;
      default:
        return;
    }

    setSelectedIndex(newIndex);

    // Scroll into view
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll('[data-keyboard-nav-item]');
      const item = items[newIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        item.focus();
      }
    }
  }, [enabled, itemCount, selectedIndex, loop, onSelect]);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  return {
    selectedIndex,
    setSelectedIndex,
    containerRef,
  };
}

