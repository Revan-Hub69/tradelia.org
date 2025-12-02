'use client';

import { useState } from 'react';
import { GlossaryDrawer } from './GlossaryDrawer';
import { GlossaryIcon } from './GlossaryIcon';
import { cn } from '@/lib/utils/cn';

import type { GlossaryTerm } from '@/lib/glossary/terms';

interface TooltipGlossaryProps {
  term: GlossaryTerm;
  children: React.ReactNode;
  className?: string;
  icon?: boolean;
  iconSize?: number;
  onTermClick?: (termKey: string) => void; // Callback per termini correlati
}

/**
 * Tooltip Glossary Component
 * Tooltip discreto che apre drawer con spiegazione completa del termine
 * Design non invasivo con icona (?) molto piccola
 * Riferimento: WCAG 2.1 - Tooltips, Norman (2013) - Help Systems
 */
export function TooltipGlossary({
  term,
  children,
  className,
  icon = true,
  iconSize = 10,
  onTermClick,
}: TooltipGlossaryProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentTerm, setCurrentTerm] = useState(term);

  const handleTermClick = (termKey: string) => {
    // Carica il nuovo termine e aggiorna il drawer
    import('@/lib/glossary/terms').then(({ getGlossaryTerm }) => {
      getGlossaryTerm(termKey).then((newTerm) => {
        if (newTerm) {
          setCurrentTerm(newTerm);
        }
      });
    });
    
    if (onTermClick) {
      onTermClick(termKey);
    }
  };

  return (
    <>
      <span className={cn('inline-flex items-baseline gap-0.5', className)}>
        {children}
        {icon && (
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={cn(
              'inline-flex items-center justify-center',
              'text-text-tertiary hover:text-accent transition-colors',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-1 rounded',
              'opacity-60 hover:opacity-100',
              'ml-0.5 align-text-bottom'
            )}
            aria-label={`Apri definizione di ${term.title}`}
            aria-describedby={`glossary-term-${term.title}`}
            type="button"
          >
            <GlossaryIcon size={iconSize} className="flex-shrink-0" />
          </button>
        )}
      </span>

      <GlossaryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        term={currentTerm}
        onTermClick={handleTermClick}
      />
    </>
  );
}

