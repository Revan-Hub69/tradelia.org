'use client';

import { useTranslations } from '@/lib/i18n/use-translations';
import { FeatureComingSoon } from '@/components/ui/FeatureComingSoon';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

/**
 * Alerts Widget - Coming Soon
 * API non ancora disponibili
 * 
 * Best Practice: Usa FeatureComingSoon per design accademico coerente
 */
export default function AlertsWidgetPage() {
  const { locale } = useTranslations();

  return (
    <div className="min-h-screen bg-bg-base p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <FeatureComingSoon
          featureName={locale === 'it' ? 'Alerts Widget' : 'Alerts Widget'}
          description={locale === 'it' 
            ? 'Notifiche personalizzate per i tuoi asset'
            : 'Personalized notifications for your assets'}
          reason={locale === 'it'
            ? 'Richiede integrazione con API real-time per prezzi di mercato'
            : 'Requires integration with real-time APIs for market prices'}
          estimatedDate="Q2 2025"
          variant="card"
        />
        <div className="flex flex-col gap-3 mt-6 items-center">
          <Link
            href="/dashboard/widgets"
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors inline-flex items-center justify-center gap-2 text-sm leading-relaxed"
            aria-label={locale === 'it' ? 'Vedi tutti i widget disponibili' : 'View all available widgets'}
          >
            <ExternalLink className="w-4 h-4" />
            {locale === 'it' ? 'Vedi tutti i widget disponibili' : 'View all available widgets'}
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-text-tertiary hover:text-text-primary transition-colors leading-relaxed"
          >
            {locale === 'it' ? 'Torna alla Dashboard' : 'Back to Dashboard'}
          </Link>
        </div>
      </div>
    </div>
  );
}

