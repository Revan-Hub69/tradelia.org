'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { GlossaryDrawer } from './GlossaryDrawer';
import { cn } from '@/lib/utils/cn';

interface GlossaryTerm {
  title: string;
  what: string;
  how: string;
  source: string;
}

interface TooltipGlossaryProps {
  term: GlossaryTerm;
  children: React.ReactNode;
  className?: string;
  icon?: boolean;
}

/**
 * Tooltip Glossary Component
 * Tooltip che apre drawer con spiegazione completa del termine
 * Riferimento: WCAG 2.1 - Tooltips, Norman (2013) - Help Systems
 */
export function TooltipGlossary({
  term,
  children,
  className,
  icon = true,
}: TooltipGlossaryProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsDrawerOpen(true)}
        className={cn(
          'inline-flex items-center gap-1 text-accent hover:text-accent-hover transition-colors cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded',
          className
        )}
        aria-label={`Apri definizione di ${term.title}`}
        aria-describedby={`glossary-term-${term.title}`}
      >
        {children}
        {icon && (
          <Info className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
        )}
      </button>

      <GlossaryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        term={term}
      />
    </>
  );
}

