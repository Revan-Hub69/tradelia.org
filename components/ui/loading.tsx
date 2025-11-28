import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function Loading({ className, size = 'md', text, ...props }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3', className)}
      role="status"
      aria-label={text || 'Caricamento in corso'}
      aria-live="polite"
      {...props}
    >
      <Loader2
        className={cn('animate-spin text-accent', sizeClasses[size])}
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm text-text-secondary" aria-live="polite">
          {text}
        </p>
      )}
      <span className="sr-only">Caricamento in corso...</span>
    </div>
  );
}

export function LoadingSpinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2
      className={cn('animate-spin text-accent', sizeClasses[size], className)}
      aria-hidden="true"
    />
  );
}
