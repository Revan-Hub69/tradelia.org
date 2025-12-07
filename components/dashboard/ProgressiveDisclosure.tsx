'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressiveDisclosureProps {
  title: string;
  defaultExpanded?: boolean;
  summary?: string;
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
}

/**
 * Progressive Disclosure Component
 * Best Practice: Riduce cognitive load mostrando solo info essenziali (Norman, 2013)
 * 
 * Implementa pattern "Show More" per informazioni secondarie
 * Migliora scannability e riduce sovraccarico informativo
 */
export function ProgressiveDisclosure({
  title,
  defaultExpanded = false,
  summary,
  children,
  className,
  'aria-label': ariaLabel,
}: ProgressiveDisclosureProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={cn('border border-border-subtle rounded-xl overflow-hidden', className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-bg-soft hover:bg-bg-surface transition-colors text-left"
        aria-expanded={isExpanded}
        aria-label={ariaLabel || title}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
          {summary && !isExpanded && (
            <p className="text-sm text-text-secondary line-clamp-2">{summary}</p>
          )}
        </div>
        <div className="flex-shrink-0 ml-4">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-text-secondary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-secondary" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-border-subtle bg-bg-surface">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

