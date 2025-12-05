'use client';

import { Clock, Info } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';

interface FeatureComingSoonProps {
  featureName: string;
  description?: string;
  estimatedDate?: string;
  reason?: string;
  className?: string;
  variant?: 'overlay' | 'banner' | 'card';
}

/**
 * Feature Coming Soon - Overlay discreto per feature non ancora disponibili
 * 
 * Best Practice: Cognitive Load Theory - Non interrompere workflow, informare discretamente
 * Design: Accademico, discreto, informativo
 */
export function FeatureComingSoon({
  featureName,
  description,
  estimatedDate,
  reason,
  className,
  variant = 'overlay',
}: FeatureComingSoonProps) {
  const { locale } = useTranslations();

  if (variant === 'overlay') {
    return (
      <div
        className={cn(
          'absolute inset-0 z-10',
          'bg-black/60 backdrop-blur-sm rounded-lg',
          'flex flex-col items-center justify-center p-6',
          'transition-opacity duration-300',
          className
        )}
      >
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {featureName}
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            {description ||
              (locale === 'it'
                ? 'Questa funzionalità sarà disponibile a breve'
                : 'This feature will be available soon')}
          </p>
          {estimatedDate && (
            <p className="text-xs text-text-tertiary mb-2">
              {locale === 'it' ? 'Data stimata' : 'Estimated date'}: {estimatedDate}
            </p>
          )}
          {reason && (
            <div className="mt-4 p-3 bg-bg-soft rounded-lg border border-border-subtle">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-tertiary text-left">{reason}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'bg-amber-500/10 border border-amber-500/30 rounded-lg p-4',
          'flex items-start gap-3',
          className
        )}
      >
        <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-text-primary mb-1">
            {featureName}
          </h4>
          <p className="text-sm text-text-secondary">
            {description ||
              (locale === 'it'
                ? 'Disponibile a breve'
                : 'Coming soon')}
          </p>
          {estimatedDate && (
            <p className="text-xs text-text-tertiary mt-2">
              {locale === 'it' ? 'Data stimata' : 'Estimated date'}: {estimatedDate}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Card variant
  return (
    <div
      className={cn(
        'bg-bg-surface border border-border-subtle rounded-xl p-6',
        'opacity-75',
        'relative',
        className
      )}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl" />
      <div className="relative z-10 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
          <Clock className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-2">
          {featureName}
        </h3>
        <p className="text-sm text-text-secondary mb-2">
          {description ||
            (locale === 'it'
              ? 'Disponibile a breve'
              : 'Coming soon')}
        </p>
        {estimatedDate && (
          <p className="text-xs text-text-tertiary">
            {locale === 'it' ? 'Data stimata' : 'Estimated date'}: {estimatedDate}
          </p>
        )}
      </div>
    </div>
  );
}
