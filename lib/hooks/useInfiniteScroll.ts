/**
 * Custom hook for infinite scroll
 * Loads more items when user scrolls near bottom
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';

export interface UseInfiniteScrollOptions {
  hasMore: boolean;
  loading: boolean;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Hook for infinite scroll
 */
export function useInfiniteScroll<T>(
  loadMore: () => Promise<T[]>,
  options: UseInfiniteScrollOptions
) {
  const { hasMore, loading, threshold = 0.1, rootMargin = '100px' } = options;
  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const [sentinelRef, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin,
    enabled: hasMore && !loading,
  });

  const loadMoreItems = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setError(null);
      const newItems = await loadMore();
      setItems((prev) => [...prev, ...newItems]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [loadMore, loading, hasMore]);

  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      loadMoreItems();
    }
  }, [isIntersecting, hasMore, loading, loadMoreItems]);

  return {
    items,
    setItems,
    sentinelRef,
    error,
    loadMore: loadMoreItems,
  };
}

