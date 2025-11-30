'use client';

import { ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
  'aria-label'?: string;
}

/**
 * Enhanced Error State Component
 * Best Practice: Fornisce recovery path chiaro (Norman, 2013)
 * 
 * WCAG 2.1 SC 3.3.1 - Error Identification
 * Identifica chiaramente errori e fornisce soluzioni
 */
export function ErrorState({
  title = 'Errore',
  message,
  onRetry,
  action,
  className,
  'aria-label': ariaLabel,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'p-6 bg-error/10 border border-error/30 rounded-xl',
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-label={ariaLabel || title}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-error mb-1">{title}</h3>
          <p className="text-sm text-text-secondary mb-4">{message}</p>
          <div className="flex items-center gap-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="border-error/40 text-error hover:bg-error/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Riprova
              </Button>
            )}
            {action}
          </div>
        </div>
      </div>
    </div>
  );
}

