import * as React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from './button';

export interface ErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  onDismiss?: () => void;
  variant?: 'default' | 'destructive' | 'warning';
}

export function Error({
  className,
  title = 'Errore',
  message,
  onDismiss,
  variant = 'destructive',
  ...props
}: ErrorProps) {
  const variantClasses = {
    default: 'bg-bg-surface border-border-accent text-text-primary',
    destructive: 'bg-error/10 border-error/30 text-error',
    warning: 'bg-warning/10 border-warning/30 text-warning',
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-4 flex items-start gap-3',
        variantClasses[variant],
        className
      )}
      role="alert"
      aria-live="assertive"
      {...props}
    >
      <AlertCircle
        className={cn(
          'w-5 h-5 flex-shrink-0 mt-0.5',
          variant === 'destructive' && 'text-error',
          variant === 'warning' && 'text-warning'
        )}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold text-sm mb-1" id="error-title">
            {title}
          </h4>
        )}
        <p className="text-sm" id="error-message" aria-describedby={title ? 'error-title' : undefined}>
          {message}
        </p>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={onDismiss}
          aria-label="Chiudi messaggio di errore"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
