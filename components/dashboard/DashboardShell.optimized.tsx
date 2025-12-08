'use client';

// Importa il suppressor degli errori di hydration PRIMA di tutto
import '@/lib/utils/suppress-hydration-errors';

import React, { Suspense, lazy, useState, useEffect, useMemo, useCallback, memo } from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDashboardCustomization } from '@/lib/hooks/useDashboardCustomization';
import { useDashboardPreferences } from '@/lib/hooks/useDashboardPreferences';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './dashboard.module.css';

// Lazy load TUTTI i componenti dashboard - Best Practice: Code Splitting
const AccountBanner = lazy(() => import('./AccountBanner').then(m => ({ default: m.AccountBanner })));
const DashboardCustomization = lazy(() => import('./DashboardCustomization').then(m => ({ default: m.DashboardCustomization })));
const ModuleGrid = lazy(() => import('./ModuleGrid').then(m => ({ default: m.ModuleGrid })));
const MarketDashboardWidget = lazy(() => import('./MarketDashboardWidget').then(m => ({ default: m.MarketDashboardWidget })));
const MultiAssetCharts = lazy(() => import('./MultiAssetCharts').then(m => ({ default: m.MultiAssetCharts })));
const CorrelationHeatmap = lazy(() => import('./CorrelationHeatmap').then(m => ({ default: m.CorrelationHeatmap })));
const L400SupportResistance = lazy(() => import('./L400SupportResistance').then(m => ({ default: m.L400SupportResistance })));
const NewsFeed = lazy(() => import('./NewsFeed').then(m => ({ default: m.NewsFeed })));
const EconomicCalendar = lazy(() => import('./EconomicCalendar').then(m => ({ default: m.EconomicCalendar })));
const IPOCalendar = lazy(() => import('./IPOCalendar').then(m => ({ default: m.IPOCalendar })));
const CorporateEvents = lazy(() => import('./CorporateEvents').then(m => ({ default: m.CorporateEvents })));
const TrendingCoins = lazy(() => import('./TrendingCoins').then(m => ({ default: m.TrendingCoins })));
const MarketSentiment = lazy(() => import('./MarketSentiment').then(m => ({ default: m.MarketSentiment })));
const RedditSentiment = lazy(() => import('./RedditSentiment').then(m => ({ default: m.RedditSentiment })));
const DeveloperActivity = lazy(() => import('./DeveloperActivity').then(m => ({ default: m.DeveloperActivity })));
const OverviewStats = lazy(() => import('./OverviewStats').then(m => ({ default: m.OverviewStats })));
const KeyboardShortcuts = lazy(() => import('./KeyboardShortcuts').then(m => ({ default: m.KeyboardShortcuts })));
const HelpAssistant = lazy(() => import('./HelpAssistant').then(m => ({ default: m.HelpAssistant })));

// Skeleton component ottimizzato
const ComponentSkeleton = memo(() => (
  <div className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6">
    <Skeleton className="h-6 w-48 mb-4" />
    <Skeleton className="h-64 w-full" />
  </div>
));
ComponentSkeleton.displayName = 'ComponentSkeleton';

// Wrapper per componenti lazy con Intersection Observer
interface LazySectionProps {
  componentId: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel: string;
}

const LazySection = memo(({ componentId, children, className, ariaLabel }: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' } // Pre-carica 200px prima che sia visibile
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label={ariaLabel}
      className={cn(styles.dashboardSection, className)}
      suppressHydrationWarning
      id={componentId}
    >
      <ErrorBoundary>
        {isVisible ? (
          <Suspense fallback={<ComponentSkeleton />}>
            {children}
          </Suspense>
        ) : (
          <ComponentSkeleton />
        )}
      </ErrorBoundary>
    </section>
  );
});
LazySection.displayName = 'LazySection';

/**
 * DashboardShell - Ottimizzato per performance
 * Best Practices:
 * - Lazy loading di tutti i componenti
 * - Intersection Observer per caricare solo quando visibili
 * - Memoization per evitare re-render inutili
 * - Code splitting completo
 */
export function DashboardShell() {
  const { preferences, isLoaded, toggleCompactView } = useDashboardPreferences();
  const { components: dashboardComponents, isLoading: isLoadingCustomization } = useDashboardCustomization();
  const { t } = useTranslations();

  // Memoize visibility check per evitare re-calcoli
  const isComponentVisible = useCallback((componentId: string): boolean => {
    if (isLoadingCustomization) return true;
    const component = dashboardComponents.find(c => c.id === componentId);
    return component?.visible !== false;
  }, [dashboardComponents, isLoadingCustomization]);

  // Memoize toggle handler
  const handleToggleCompactView = useCallback(() => {
    toggleCompactView();
  }, [toggleCompactView]);

  return (
    <ErrorBoundary>
      <main
        id="dashboard-main"
        className={styles.dashboardMain}
        role="main"
        aria-label="Dashboard principale"
        suppressHydrationWarning
      >
        <div
          id="modules-view"
          className={cn(
            styles.modulesView,
            "active",
            isLoaded && preferences.compactView && styles.compactView
          )}
          role="region"
          aria-label="Contenuti dashboard"
          style={{ minHeight: '600px' }}
        >
          {/* Account Banner - Caricato immediatamente (critico) */}
          <div id="account-banner-slot" role="region" aria-label="Stato account">
            <ErrorBoundary>
              <Suspense fallback={<Skeleton className="h-16 w-full mb-4" />}>
                <AccountBanner />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Personalization Controls */}
          {isLoaded && (
            <div className="flex items-center justify-end gap-2 mb-4 px-4 sm:px-6 lg:px-8">
              <Suspense fallback={<Skeleton className="h-9 w-32" />}>
                <DashboardCustomization />
              </Suspense>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleCompactView}
                className="text-text-secondary hover:text-text-primary h-9 sm:h-10"
                aria-label={preferences.compactView ? 'Vista Espansa' : 'Vista Compatta'}
                title={preferences.compactView ? 'Vista Espansa' : 'Vista Compatta'}
              >
                {preferences.compactView ? (
                  <>
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Vista Espansa</span>
                  </>
                ) : (
                  <>
                    <LayoutList className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Vista Compatta</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Moduli - Caricato immediatamente (critico) */}
          {isComponentVisible('module-grid') && (
            <LazySection componentId="modules" ariaLabel="Moduli e funzionalità">
              <ModuleGrid />
            </LazySection>
          )}

          {/* Componenti dashboard - Lazy loaded con Intersection Observer */}
          {isComponentVisible('market-dashboard') && (
            <LazySection componentId="market-dashboard" ariaLabel="Cruscotto operativo mercati">
              <MarketDashboardWidget />
            </LazySection>
          )}

          {isComponentVisible('multi-asset-charts') && (
            <LazySection componentId="multi-asset-charts" ariaLabel="Multi-asset charts with correlations">
              <MultiAssetCharts />
            </LazySection>
          )}

          {isComponentVisible('correlation-heatmap') && (
            <LazySection componentId="correlation-heatmap" ariaLabel="Correlation Heatmap">
              <CorrelationHeatmap />
            </LazySection>
          )}

          {isComponentVisible('l400-support-resistance') && (
            <LazySection componentId="l400-support-resistance" ariaLabel="L400 Support and Resistance">
              <L400SupportResistance />
            </LazySection>
          )}

          {isComponentVisible('news-feed') && (
            <LazySection componentId="news-feed" ariaLabel="Market News Feed">
              <NewsFeed />
            </LazySection>
          )}

          {isComponentVisible('economic-calendar') && (
            <LazySection componentId="economic-calendar" ariaLabel="Economic Calendar">
              <EconomicCalendar />
            </LazySection>
          )}

          {isComponentVisible('ipo-calendar') && (
            <LazySection componentId="ipo-calendar" ariaLabel="IPO Calendar">
              <IPOCalendar />
            </LazySection>
          )}

          {isComponentVisible('corporate-events') && (
            <LazySection componentId="corporate-events" ariaLabel="Corporate Events">
              <CorporateEvents />
            </LazySection>
          )}

          {isComponentVisible('trending-coins') && (
            <LazySection componentId="trending-coins" ariaLabel="Trending Coins">
              <TrendingCoins />
            </LazySection>
          )}

          {isComponentVisible('market-sentiment') && (
            <LazySection componentId="market-sentiment" ariaLabel="Market Sentiment">
              <MarketSentiment />
            </LazySection>
          )}

          {isComponentVisible('reddit-sentiment') && (
            <LazySection componentId="reddit-sentiment" ariaLabel="Reddit Sentiment">
              <RedditSentiment />
            </LazySection>
          )}

          {isComponentVisible('developer-activity') && (
            <LazySection componentId="developer-activity" ariaLabel="Developer Activity">
              <DeveloperActivity />
            </LazySection>
          )}

          {isComponentVisible('overview') && (
            <LazySection componentId="overview" ariaLabel="Panoramica accademica">
              <OverviewStats />
            </LazySection>
          )}
        </div>
      </main>
      <Suspense fallback={null}>
        <KeyboardShortcuts />
      </Suspense>
    </ErrorBoundary>
  );
}
