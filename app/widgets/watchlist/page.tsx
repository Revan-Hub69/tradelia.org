'use client';

import { useTranslations } from '@/lib/i18n/use-translations';
import { Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

/**
 * Watchlist Widget - Coming Soon
 * API non ancora disponibili
 */
export default function WatchlistWidgetPage() {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-bg-base p-4 flex items-center justify-center">
      <div className="text-center max-w-md">
        <Clock className="w-16 h-16 mx-auto mb-4 text-accent opacity-50" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          {t('widgets.watchlist.title') || 'Watchlist Widget'}
        </h1>
        <p className="text-text-secondary mb-6">
          {t('widgets.watchlist.comingSoon') || 'Questo widget sarà disponibile a breve. Stiamo lavorando all\'integrazione delle API necessarie.'}
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/widgets"
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors inline-flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            {t('widgets.viewAll') || 'Vedi tutti i widget disponibili'}
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
          >
            {t('widgets.backToDashboard') || 'Torna alla Dashboard'}
          </Link>
        </div>
      </div>
    </div>
  );
}

