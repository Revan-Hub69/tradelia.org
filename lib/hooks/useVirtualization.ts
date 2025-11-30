/**
 * Custom hook for virtualizing long lists
 * Only renders visible items for performance
 * Based on react-window pattern
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

export interface UseVirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Items to render outside visible area
  enabled?: boolean;
}

export interface VirtualizedItem {
  index: number;
  offset: number;
  height: number;
}

/**
 * Hook for virtualizing long lists
 */
export function useVirtualization<T>(
  items: T[],
  options: UseVirtualizationOptions
) {
  const {
    itemHeight,
    containerHeight,
    overscan = 3,
    enabled = true,
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!enabled || items.length === 0) {
      return { start: 0, end: items.length };
    }

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { start, end };
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length, enabled]);

  // Visible items
  const visibleItems = useMemo(() => {
    if (!enabled) {
      return items.map((item, index) => ({
        item,
        index,
        offset: index * itemHeight,
        height: itemHeight,
      }));
    }

    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      offset: (visibleRange.start + index) * itemHeight,
      height: itemHeight,
    }));
  }, [items, visibleRange, itemHeight, enabled]);

  // Total height
  const totalHeight = useMemo(() => {
    return items.length * itemHeight;
  }, [items.length, itemHeight]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Scroll to item
  const scrollToItem = useCallback((index: number) => {
    if (containerRef.current) {
      const offset = index * itemHeight;
      containerRef.current.scrollTop = offset;
      setScrollTop(offset);
    }
  }, [itemHeight]);

  // Update scroll position when container ref is set
  useEffect(() => {
    if (containerRef.current) {
      const handleScrollEvent = () => {
        setScrollTop(containerRef.current?.scrollTop || 0);
      };
      containerRef.current.addEventListener('scroll', handleScrollEvent);
      return () => {
        containerRef.current?.removeEventListener('scroll', handleScrollEvent);
      };
    }
  }, []);

  return {
    visibleItems,
    totalHeight,
    containerRef,
    handleScroll,
    scrollToItem,
    startIndex: visibleRange.start,
    endIndex: visibleRange.end,
  };
}

