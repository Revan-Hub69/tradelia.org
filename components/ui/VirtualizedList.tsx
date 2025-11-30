/**
 * Virtualized List Component
 * Renders only visible items for performance
 * Use for lists with 50+ items
 */

import React, { useMemo } from 'react';
import { useVirtualization, VirtualizedItem } from '@/lib/hooks/useVirtualization';
import { cn } from '@/lib/utils/cn';

export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  renderItem: (item: T, index: number, virtualized: VirtualizedItem) => React.ReactNode;
  className?: string;
  enabled?: boolean;
  emptyState?: React.ReactNode;
}

export function VirtualizedList<T>({
  items,
  itemHeight = 60,
  containerHeight = 400,
  overscan = 3,
  renderItem,
  className,
  enabled = items.length > 50, // Auto-enable for 50+ items
  emptyState,
}: VirtualizedListProps<T>) {
  const {
    visibleItems,
    totalHeight,
    containerRef,
    handleScroll,
  } = useVirtualization(items, {
    itemHeight,
    containerHeight,
    overscan,
    enabled,
  });

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      role="list"
      aria-label={`Lista con ${items.length} elementi`}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, offset, height }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: offset,
              left: 0,
              right: 0,
              height,
            }}
            role="listitem"
            aria-posinset={index + 1}
            aria-setsize={items.length}
          >
            {renderItem(item, index, { index, offset, height })}
          </div>
        ))}
      </div>
    </div>
  );
}

