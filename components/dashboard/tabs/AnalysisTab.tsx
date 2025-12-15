'use client';

import { Suspense, lazy, memo } from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Skeleton } from '@/components/ui/Skeleton';
import { SectionBanner } from '../SectionBanner';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';

// Lazy load components per performance
const MultiAssetCharts = lazy(() => import('../MultiAssetCharts').then(m => ({ default: m.MultiAssetCharts })));
const CorrelationHeatmap = lazy(() => import('../CorrelationHeatmap').then(m => ({ default: m.CorrelationHeatmap })));
const L400SupportResistance = lazy(() => import('../L400SupportResistance').then(m => ({ default: m.L400SupportResistance })));
const MarketSentiment = lazy(() => import('../MarketSentiment').then(m => ({ default: m.MarketSentiment })));
const RedditSentiment = lazy(() => import('../RedditSentiment').then(m => ({ default: m.RedditSentiment })));
const DeveloperActivity = lazy(() => import('../DeveloperActivity').then(m => ({ default: m.DeveloperActivity })));

const ComponentSkeleton = memo(() => (
  <div className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6">
    <Skeleton className="h-6 w-48 mb-4" />
    <Skeleton className="h-64 w-full" />
  </div>
));
ComponentSkeleton.displayName = 'ComponentSkeleton';

/**
 * Analysis Tab - Analisi avanzate e grafici
 * Multi-Asset Charts, Correlation Heatmap, L400 Support/Resistance, Sentiment Analysis
 */
export const AnalysisTab = memo(function AnalysisTab() {
  const { t, locale } = useTranslations();

  return (
    <ErrorBoundary>
      <div className="space-y-6 pb-8">
        {/* Multi-Asset Charts */}
        <section aria-label="Grafici multi-asset">
          <SectionBanner
            title="Correlazioni Multi-Asset"
            description="Analisi delle correlazioni tra i principali asset: S&P 500, Bitcoin, Gold, EUR/USD, e altri indici di mercato."
          />
          <div className="mt-4">
            <Suspense fallback={<ComponentSkeleton />}>
              <MultiAssetCharts />
            </Suspense>
          </div>
        </section>

        {/* Correlation Heatmap */}
        <section aria-label="Correlation heatmap">
          <SectionBanner
            title="Correlation Heatmap"
            description="Mappa di correlazione tra diversi asset per identificare pattern e dipendenze di mercato."
          />
          <div className="mt-4">
            <Suspense fallback={<ComponentSkeleton />}>
              <CorrelationHeatmap />
            </Suspense>
          </div>
        </section>

        {/* L400 Support/Resistance */}
        <section aria-label="L400 Support and Resistance">
          <SectionBanner
            title="L400 Support & Resistance"
            description="Supporti e resistenze reali basati su ordini L400 aggregati. Analisi avanzata per identificare livelli chiave di prezzo."
          />
          <div className="mt-4">
            <Suspense fallback={<ComponentSkeleton />}>
              <L400SupportResistance />
            </Suspense>
          </div>
        </section>

        {/* Market Sentiment */}
        <section aria-label="Market Sentiment">
          <SectionBanner
            title="Market Sentiment"
            description="Sentiment aggregato del mercato basato su multiple fonti e indicatori."
          />
          <div className="mt-4">
            <Suspense fallback={<ComponentSkeleton />}>
              <MarketSentiment />
            </Suspense>
          </div>
        </section>

        {/* Reddit Sentiment */}
        <section aria-label="Reddit Sentiment">
          <SectionBanner
            title="Reddit Sentiment"
            description="Analisi del sentiment da Reddit per crypto e stock, basata su discussioni e menzioni."
          />
          <div className="mt-4">
            <Suspense fallback={<ComponentSkeleton />}>
              <RedditSentiment />
            </Suspense>
          </div>
        </section>

        {/* Developer Activity */}
        <section aria-label="Developer Activity">
          <SectionBanner
            title="Developer Activity"
            description="Attività degli sviluppatori su progetti crypto, basata su commit GitHub e metriche di sviluppo."
          />
          <div className="mt-4">
            <Suspense fallback={<ComponentSkeleton />}>
              <DeveloperActivity />
            </Suspense>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
});
