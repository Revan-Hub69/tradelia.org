'use client';

import { ProBadge } from '@/components/ui/ProBadge';

interface ProLockOverlayProps {
  children: React.ReactNode;
}

/**
 * Component that wraps Pro tools to show a locked preview for non-Pro users
 * Best practice: Show preview of what Pro users get, but lock functionality
 */
export function ProLockOverlay({ children }: ProLockOverlayProps) {
  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-bg-base/80 backdrop-blur-sm rounded-xl">
        <div className="text-center p-8 bg-bg-surface border-2 border-amber-500/40 rounded-xl shadow-2xl max-w-md">
          <div className="flex justify-center mb-4">
            <ProBadge size="lg" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mt-4 mb-2">
            Funzionalità Pro
          </h3>
          <p className="text-sm text-text-secondary mb-6">
            Questo strumento è disponibile solo per utenti Pro. Passa a Pro per accedere a strumenti avanzati, analisi approfondite e molto altro.
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-colors shadow-lg"
          >
            Passa a Pro
          </button>
        </div>
      </div>
    </div>
  );
}
