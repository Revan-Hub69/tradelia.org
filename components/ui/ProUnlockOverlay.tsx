'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ProUnlockOverlayProps {
  featureName: string;
  featureDescription: string;
  onUnlock?: () => void;
  className?: string;
}

/**
 * Pro Unlock Overlay
 * 
 * Standard Tradelia AI - Overlay per sbloccare feature Pro
 * Mostra nome, descrizione e pulsante per upgrade
 */
export function ProUnlockOverlay({
  featureName,
  featureDescription,
  onUnlock,
  className,
}: ProUnlockOverlayProps) {
  const { locale } = useTranslations();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'absolute inset-0 z-10 bg-black/60 backdrop-blur-sm rounded-lg',
        'flex flex-col items-center justify-center p-6',
        'transition-opacity duration-300',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          'bg-bg-surface border-2 border-accent rounded-xl p-6 max-w-md w-full',
          'transform transition-all duration-300',
          isHovered ? 'scale-105' : 'scale-100'
        )}
      >
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-text-primary text-center mb-2">
          {featureName}
        </h3>

        <p className="text-sm text-text-secondary text-center mb-6">
          {featureDescription}
        </p>

        <button
          onClick={onUnlock}
          className={cn(
            'w-full py-3 px-6 rounded-lg font-semibold transition-all',
            'bg-gradient-to-r from-accent to-accent-hover text-white',
            'hover:shadow-lg hover:shadow-accent/50',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
            'flex items-center justify-center gap-2'
          )}
        >
          <Sparkles className="w-5 h-5" />
          {locale === 'it' ? 'Sblocca Pro' : 'Unlock Pro'}
        </button>

        <p className="text-xs text-text-tertiary text-center mt-4">
          {locale === 'it'
            ? 'Accedi ad analisi avanzate, dati real-time e strumenti professionali'
            : 'Access advanced analysis, real-time data and professional tools'}
        </p>
      </div>
    </div>
  );
}
