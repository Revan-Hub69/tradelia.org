'use client';

import { lazy, Suspense } from 'react';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { Building2, Info, AlertTriangle } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

// Lazy load per performance
const BrokersRecommender = lazy(() => 
  import('@/components/dashboard/utilities/BrokersRecommender').then(m => ({ default: m.BrokersRecommender }))
);

// Loading skeleton
const BrokersSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-bg-soft border-premium shadow-premium rounded-xl p-6 md:p-8 animate-pulse">
      <div className="h-8 bg-bg-surface rounded w-1/3 mb-4" />
      <div className="h-4 bg-bg-surface rounded w-2/3 mb-6" />
      <div className="space-y-4">
        <div className="h-12 bg-bg-surface rounded" />
        <div className="h-12 bg-bg-surface rounded" />
        <div className="h-12 bg-bg-surface rounded" />
      </div>
    </div>
  </div>
);

export default function BrokersPage() {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardTabs />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 container-mobile max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-lg flex-shrink-0">
              <Building2 className="w-7 h-7 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
                {t('dashboard.brokers.title') || 'Brokers Disponibili'}
              </h1>
              <p className="text-text-secondary text-lg">
                {t('dashboard.brokers.subtitle') || 'Strumento informativo per confrontare broker regolamentati'}
              </p>
            </div>
          </div>

          {/* Publisher Disclaimer - Prominente */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 md:p-6 mb-6 card-mobile">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-2 text-sm text-text-secondary">
                <p className="font-semibold text-text-primary">Disclaimer Publisher</p>
                <p>
                  <strong>Tradelia è un publisher informativo, non un consulente finanziario.</strong> Le informazioni fornite
                  in questo strumento sono a scopo educativo e informativo. Non costituiscono consulenza finanziaria, raccomandazione
                  di investimento o sollecitazione all'acquisto/vendita di strumenti finanziari.
                </p>
                <p>
                  La selezione di un broker è una decisione personale che richiede valutazione autonoma. Prima di aprire un account,
                  leggi attentamente i termini e condizioni, la Key Information Document (KID) quando disponibile, e consulta un
                  consulente finanziario autorizzato se necessario.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Brokers Recommender */}
        <Suspense fallback={<BrokersSkeleton />}>
          <BrokersRecommender />
        </Suspense>
      </div>
    </div>
  );
}
