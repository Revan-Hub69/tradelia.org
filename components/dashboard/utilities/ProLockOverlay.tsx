'use client';

import { ReactNode } from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { useTranslations } from '@/lib/i18n/use-translations';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface ProLockOverlayProps {
  children: ReactNode;
  showPreview?: boolean;
}

/**
 * ProLockOverlay - Shows utility preview to non-Pro users with upgrade CTA
 * Best Practice: Show value before asking for payment
 */
export function ProLockOverlay({ children, showPreview = true }: ProLockOverlayProps) {
  const isPro = useIsPro();
  const { t, locale } = useTranslations();

  // If Pro, show content normally
  if (isPro) {
    return <>{children}</>;
  }

  // If not Pro, show preview with lock overlay
  return (
    <div className="relative">
      {/* Preview content (blurred/disabled) */}
      <div className={cn(
        'relative',
        showPreview ? 'opacity-40 pointer-events-none blur-sm' : 'hidden'
      )}>
        {children}
      </div>

      {/* Lock Overlay - CRITICAL: High z-index to appear above all content */}
      <div className={cn(
        'absolute inset-0 z-[9999]',
        'bg-bg-base/95 backdrop-blur-sm',
        'flex flex-col items-center justify-center',
        'p-8 rounded-xl border border-accent/30',
        'text-center space-y-4'
      )}>
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-blue-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-text-primary">
            {locale === 'it' ? 'Funzionalità Pro' : 'Pro Feature'}
          </h3>
          <p className="text-sm text-text-secondary max-w-sm">
            {locale === 'it' 
              ? 'Questa utility è disponibile per utenti Pro. Aggiorna il tuo account per sbloccare tutte le funzionalità avanzate.'
              : 'This utility is available for Pro users. Upgrade your account to unlock all advanced features.'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>
            {locale === 'it' 
              ? 'Strumenti professionali per trader e investitori avanzati'
              : 'Professional tools for advanced traders and investors'}
          </span>
        </div>

        <Link
          href="/pricing"
          className={cn(
            'mt-4 inline-flex items-center gap-2',
            'px-6 py-3 rounded-lg',
            'bg-gradient-to-r from-accent to-accent-hover',
            'text-white font-semibold text-sm',
            'hover:shadow-lg hover:scale-105',
            'transition-all duration-200'
          )}
        >
          <span>{locale === 'it' ? 'Passa a Pro' : 'Upgrade to Pro'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
