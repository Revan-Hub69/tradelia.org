'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'aria-label'?: string;
}

/**
 * Enhanced Loading State Component
 * Best Practice: Fornisce feedback chiaro durante caricamento (Nielsen, 1994)
 * 
 * WCAG 2.1 SC 4.1.3 - Status Messages
 * Annuncia stato di caricamento agli screen reader
 */
export function LoadingState({
  message = 'Caricamento...',
  size = 'md',
  className,
  'aria-label': ariaLabel,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={cn('flex flex-col items-center justify-center p-8', className)}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel || message}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className={cn('text-accent', sizeClasses[size])} />
      </motion.div>
      {message && (
        <p className="mt-4 text-sm text-text-secondary">{message}</p>
      )}
    </div>
  );
}

