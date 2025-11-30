'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface LandmarkRegionProps {
  children: ReactNode;
  role?: 'banner' | 'navigation' | 'main' | 'complementary' | 'contentinfo' | 'search' | 'form' | 'region';
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
}

/**
 * Landmark Region Component
 * Best Practice: Migliora navigazione screen reader (WCAG 2.1 SC 1.3.1)
 * 
 * Fornisce landmark regions semantiche per:
 * - Navigazione più efficiente
 * - Comprensione struttura pagina
 * - Accessibilità migliorata
 */
export function LandmarkRegion({
  children,
  role = 'region',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  className,
}: LandmarkRegionProps) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={cn(className)}
    >
      {children}
    </div>
  );
}

