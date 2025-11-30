/**
 * Skip Link Component
 * Allows keyboard users to skip to main content
 * WCAG 2.1 AA requirement
 */

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export interface SkipLinkProps {
  href: string;
  label?: string;
  className?: string;
}

export function SkipLink({ href, label = 'Vai al contenuto principale', className }: SkipLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white',
        'focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent',
        'focus:ring-offset-2 focus:ring-offset-bg-surface',
        className
      )}
    >
      {label}
    </Link>
  );
}

