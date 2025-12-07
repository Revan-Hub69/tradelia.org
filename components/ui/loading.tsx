'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function Loading({ className, size = 'md', text, ...props }: LoadingProps) {
  const { t } = useTranslations();
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const loadingText = text || t('common.loading') || 'Loading...';
  const srText = t('common.loading') || 'Loading...';

  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3', className)}
      role="status"
      aria-label={loadingText}
      aria-live="polite"
      {...props}
    >
      <Loader2
        className={cn('animate-spin text-blue-400', sizeClasses[size])}
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm text-text-secondary" aria-live="polite">
          {text}
        </p>
      )}
      <span className="sr-only">{srText}</span>
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
      className={cn('animate-spin text-blue-400', sizeClasses[size], className)}
      aria-hidden="true"
    />
  );
}
