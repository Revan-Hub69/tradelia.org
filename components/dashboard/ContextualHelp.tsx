'use client';

import { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/cn';

interface ContextualHelpProps {
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  'aria-label'?: string;
}

/**
 * Contextual Help Component
 * Best Practice: Fornisce help inline senza disturbare (Nielsen, 1994)
 * 
 * WCAG 2.1 SC 3.3.2 - Labels or Instructions
 * Fornisce informazioni contestuali accessibili
 */
export function ContextualHelp({
  content,
  placement = 'top',
  className,
  'aria-label': ariaLabel,
}: ContextualHelpProps) {
  return (
    <Tooltip content={content} position={placement}>
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center w-4 h-4 rounded-full',
          'text-text-secondary hover:text-text-secondary',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
          className
        )}
        aria-label={ariaLabel || 'Informazioni aggiuntive'}
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    </Tooltip>
  );
}

