/**
 * ARIA Live Region Component
 * Announces dynamic content changes to screen readers
 * WCAG 2.1 AA requirement
 */

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

export type ARIALiveRegionPoliteness = 'off' | 'polite' | 'assertive';

export interface ARIALiveRegionProps {
  message: string;
  politeness?: ARIALiveRegionPoliteness;
  className?: string;
  id?: string;
}

/**
 * ARIA Live Region for announcing dynamic updates
 */
export function ARIALiveRegion({
  message,
  politeness = 'polite',
  className,
  id = 'aria-live-region',
}: ARIALiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (regionRef.current && message) {
      // Clear previous message to ensure announcement
      regionRef.current.textContent = '';
      // Force reflow
      void regionRef.current.offsetHeight;
      // Set new message
      regionRef.current.textContent = message;
    }
  }, [message]);

  return (
    <div
      ref={regionRef}
      id={id}
      className={cn('sr-only', className)}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
    />
  );
}

