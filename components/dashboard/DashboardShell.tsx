'use client';

// Importa il suppressor degli errori di hydration PRIMA di tutto
import '@/lib/utils/suppress-hydration-errors';

import React, { Suspense, lazy, useState, useEffect } from 'react';
// DashboardHero rimosso - progetto vecchio
import { OverviewStats } from './OverviewStats';
import { MarketDashboardWidget } from './MarketDashboardWidget';
import { MultiAssetCharts } from './MultiAssetCharts';
import { L400SupportResistance } from './L400SupportResistance';
import { NewsFeed } from './NewsFeed';
import { EconomicCalendar } from './EconomicCalendar';
import { IPOCalendar } from './IPOCalendar';
import { CorporateEvents } from './CorporateEvents';
import { TrendingCoins } from './TrendingCoins';
import { CorrelationHeatmap } from './CorrelationHeatmap';
import { UserMenu } from './UserMenu';
import { MarketSentiment } from './MarketSentiment';
import { RedditSentiment } from './RedditSentiment';
import { DeveloperActivity } from './DeveloperActivity';
import { ModuleGrid } from './ModuleGrid';
import { AccountBanner } from './AccountBanner';
import { DashboardCustomization } from './DashboardCustomization';
import { useDashboardCustomization } from '@/lib/hooks/useDashboardCustomization';
// WidgetsSection rimossa - richiede API real-time non disponibili
// Breadcrumb rimosso - già presente in DashboardTabs per evitare duplicati
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Skeleton } from '@/components/ui/Skeleton';
import { SkipLink } from '@/components/ui/SkipLink';
import { ARIALiveRegion } from '@/components/ui/ARIALiveRegion';
import { AchievementNotification } from '@/components/gamification/AchievementNotification';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { useSafeRouter } from '@/lib/hooks/useSafeRouter';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useDashboardPreferences } from '@/lib/hooks/useDashboardPreferences';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { logError, logRedirect } from '@/lib/monitoring/error-logger';
import styles from './dashboard.module.css';

// Lazy load non-critical components
const HelpAssistant = lazy(() => 
  import('./HelpAssistant').then(module => ({ default: module.HelpAssistant }))
);

/**
 * DashboardShell - Main dashboard container
 * Best practices:
 * - Semantic HTML with proper ARIA labels
 * - Logical content hierarchy
 * - Accessible navigation structure
 * - Performance optimized with lazy loading
 */
export function DashboardShell() {
  const { t } = useTranslations();
  const { preferences, isLoaded, toggleHero, toggleCompactView } = useDashboardPreferences();
  const { components: dashboardComponents, isLoading: isLoadingCustomization } = useDashboardCustomization();
  const [liveMessage, setLiveMessage] = useState('');
  const [unlockedAchievement, setUnlockedAchievement] = useState<{ id: string; title: string; description: string; icon_type?: string } | null>(null);
  const [hasError, setHasError] = useState(false);
  const router = useSafeRouter();

  // Helper to check if component should be visible
  const isComponentVisible = (componentId: string): boolean => {
    if (isLoadingCustomization) return true; // Show all during loading
    const component = dashboardComponents.find(c => c.id === componentId);
    return component?.visible !== false;
  };

  // Gestisci errori globali con logging migliorato
  // IMPORTANTE: Tutto questo codice viene eseguito SOLO sul client per evitare hydration mismatch
  useEffect(() => {
    // Verifica che siamo sul client prima di accedere a window/document
    if (typeof window === 'undefined') {
      return;
    }

    const handleError = (event: ErrorEvent) => {
      logError('Global JavaScript error', event.error, {
        component: 'DashboardShell',
        path: typeof window !== 'undefined' ? window.location.pathname : '/',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      logError('Unhandled promise rejection', error, {
        component: 'DashboardShell',
        path: typeof window !== 'undefined' ? window.location.pathname : '/',
        metadata: {
          reason: event.reason,
        },
      });
      setHasError(true);
    };

    const handleLocationChange = () => {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
      }
      const currentPath = window.location.pathname;
      if (currentPath === '/login' && document.referrer.includes('/dashboard')) {
        const shouldRedirect = logRedirect(document.referrer, currentPath, 'Automatic redirect to login');
        if (!shouldRedirect) {
          logError('Redirect loop detected', undefined, {
            component: 'DashboardShell',
            path: currentPath,
            metadata: { referrer: document.referrer },
          });
          // Torna alla dashboard invece del login
          window.history.replaceState({}, '', '/dashboard');
          if (router && typeof router.refresh === 'function') {
            router.refresh();
          }
        }
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Controlla se siamo stati redirectati al login (solo sul client)
    // Defer non-critical redirect check to improve initial render
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      if (window.location.pathname === '/login' && document.referrer.includes('/dashboard')) {
        // Defer redirect check after hydration to avoid blocking initial render
        if ('requestIdleCallback' in window) {
          requestIdleCallback(handleLocationChange, { timeout: 100 });
        } else {
          setTimeout(handleLocationChange, 0);
        }
      }
    }

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [router]);

  // Keyboard shortcuts (WCAG 2.1 SC 2.1.1 - Keyboard)
  useKeyboardShortcuts([
    {
      keys: ['g', 'd'],
      handler: () => router.push('/dashboard'),
      description: 'Vai alla dashboard',
    },
    {
      keys: ['g', 'm'],
      handler: () => router.push('/dashboard/market-data'),
      description: 'Vai ai market data',
    },
    {
      keys: ['g', 'r'],
      handler: () => router.push('/dashboard/reports'),
      description: 'Vai ai report',
    },
    {
      keys: ['g', 's'],
      handler: () => router.push('/dashboard/settings'),
      description: 'Vai alle impostazioni',
    },
  ]);

  // Listen for achievement unlocked events
  useEffect(() => {
    const handleAchievementUnlocked = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        setUnlockedAchievement(customEvent.detail);
      }
    };

    window.addEventListener('achievement-unlocked', handleAchievementUnlocked);
    return () => {
      window.removeEventListener('achievement-unlocked', handleAchievementUnlocked);
    };
  }, []);

  return (
    <ErrorBoundary>
      <SkipLink href="#modules-view" />
      <ARIALiveRegion message={liveMessage} />

      <main 
        className={styles.dashboardMain} 
        role="main" 
        aria-label="Dashboard principale"
        suppressHydrationWarning
      >
        <div id="modules-view" className={cn(styles.modulesView, "active", isLoaded && preferences.compactView && styles.compactView)} role="region" aria-label="Contenuti dashboard" style={{ minHeight: '600px' }}>
          {/* Breadcrumb è già in DashboardTabs - non duplicare */}
          
          {/* Account Banner - Best Practice: Posizionato dopo Hero per non interferire con first impression */}
          <div id="account-banner-slot" role="region" aria-label="Stato account">
            <ErrorBoundary>
              <AccountBanner />
            </ErrorBoundary>
          </div>
          
          {/* Personalization Controls - Best Practice UX: User control improves engagement */}
          {isLoaded && (
            <div className="flex items-center justify-end gap-2 mb-4 px-4 sm:px-6 lg:px-8">
              <DashboardCustomization />
              {/* Hero toggle rimosso - progetto vecchio */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCompactView}
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
          
          {/* Hero Section rimosso - progetto vecchio */}
          
          {/* Moduli unificati - Best Practice: organizzazione gerarchica - PRIMA PRIORITÀ */}
          {/* Mostra tutte le funzionalità principali in modo chiaro e accessibile */}
          {isComponentVisible('module-grid') && (
            <section 
              aria-label="Moduli e funzionalità" 
              className={cn(
                styles.dashboardSection,
                isLoaded && preferences.compactView && 'compact-view'
              )}
              id="modules"
            >
              <ErrorBoundary>
                <ModuleGrid />
              </ErrorBoundary>
            </section>
          )}

          {/* Cruscotto Operativo - Best Practice: Widget di mercato in tempo reale - PRIORITÀ ALTA */}
          {/* Fornisce vista operativa immediata degli indicatori di mercato principali */}
          {isComponentVisible('market-dashboard') && (
            <section 
              aria-label="Cruscotto operativo mercati" 
              className={styles.dashboardSection}
              suppressHydrationWarning
              id="market-dashboard"
            >
              <ErrorBoundary>
                <MarketDashboardWidget />
              </ErrorBoundary>
            </section>
          )}

          {/* Multi-Asset Charts - Best Practice: Correlazioni cross-asset - PRIORITÀ ALTA */}
          {/* Mostra correlazioni tra Crypto, Stocks, Forex, Commodities */}
          {isComponentVisible('multi-asset-charts') && (
            <section 
              aria-label="Multi-asset charts with correlations" 
              className={styles.dashboardSection}
              suppressHydrationWarning
              id="multi-asset-charts"
            >
              <ErrorBoundary>
                <MultiAssetCharts />
              </ErrorBoundary>
            </section>
          )}

          {/* Correlation Heatmap - Visual correlation matrix */}
          {isComponentVisible('correlation-heatmap') && (
            <section 
              aria-label="Correlation Heatmap" 
              className={styles.dashboardSection}
              suppressHydrationWarning
              id="correlation-heatmap"
            >
              <ErrorBoundary>
                <CorrelationHeatmap />
              </ErrorBoundary>
            </section>
          )}

          {/* L400 Support/Resistance - KILLER FEATURE - PRIORITÀ ALTA */}
          {/* Supporti e resistenze reali basati su order book L400 */}
          {isComponentVisible('l400-support-resistance') && (
            <section 
              aria-label="L400 Support and Resistance" 
              className={styles.dashboardSection}
              suppressHydrationWarning
              id="l400-support-resistance"
            >
              <ErrorBoundary>
                <L400SupportResistance />
              </ErrorBoundary>
            </section>
          )}

          {/* News Feed - Aggregated News from Multiple Sources */}
          {isComponentVisible('news-feed') && (
            <section 
              aria-label="Market News Feed" 
              className={styles.dashboardSection}
              suppressHydrationWarning
              id="news-feed"
            >
              <ErrorBoundary>
                <NewsFeed />
              </ErrorBoundary>
            </section>
          )}

          {/* Economic Calendar - Upcoming Economic Events */}
          {isComponentVisible('economic-calendar') && (
            <section 
              aria-label="Economic Calendar" 
              className={styles.dashboardSection}
              suppressHydrationWarning
              id="economic-calendar"
            >
              <ErrorBoundary>
                <EconomicCalendar />
              </ErrorBoundary>
            </section>
          )}

          {/* IPO Calendar - Upcoming IPOs with Sentiment and Institutional Participation */}
          {isComponentVisible('ipo-calendar') && (
            <section 
              aria-label="IPO Calendar" 
              className={styles.dashboardSection}
              suppressHydrationWarning
              id="ipo-calendar"
            >
              <ErrorBoundary>
                <IPOCalendar />
              </ErrorBoundary>
            </section>
          )}

          {/* Corporate Events - Earnings, Dividends, Splits, Mergers */}
          {isComponentVisible('corporate-events') && (
            <section 
              aria-label="Corporate Events" 
              className={styles.dashboardSection}
              suppressHydrationWarning
              id="corporate-events"
            >
              <ErrorBoundary>
                <CorporateEvents />
              </ErrorBoundary>
            </section>
          )}

          {/* Trending Coins - Early Signals */}
          {isComponentVisible('trending-coins') && (
            <section 
              aria-label="Trending Coins" 
              className={styles.dashboardSection}
              suppressHydrationWarning
              id="trending-coins"
            >
              <ErrorBoundary>
                <TrendingCoins />
              </ErrorBoundary>
            </section>
          )}

          {/* Market Sentiment - Multi-Asset Sentiment (Crypto, Stocks, Forex, Commodities) */}
          {isComponentVisible('market-sentiment') && (
            <section 
              aria-label="Market Sentiment" 
              className={styles.dashboardSection}
              suppressHydrationWarning
              id="market-sentiment"
            >
              <ErrorBoundary>
                <MarketSentiment />
              </ErrorBoundary>
            </section>
          )}

          {/* Reddit Sentiment - Retail Sentiment */}
          {isComponentVisible('reddit-sentiment') && (
            <section 
              aria-label="Reddit Sentiment" 
              className={styles.dashboardSection}
              suppressHydrationWarning
              id="reddit-sentiment"
            >
              <ErrorBoundary>
                <RedditSentiment />
              </ErrorBoundary>
            </section>
          )}

          {/* Developer Activity - GitHub Metrics */}
          {isComponentVisible('developer-activity') && (
            <section 
              aria-label="Developer Activity" 
              className={styles.dashboardSection}
              suppressHydrationWarning
              id="developer-activity"
            >
              <ErrorBoundary>
                <DeveloperActivity />
              </ErrorBoundary>
            </section>
          )}

          {/* Statistiche chiave - Best Practice: 4-6 metriche essenziali - SECONDARIA */}
          {/* Fornisce overview rapida delle attività principali */}
          {isComponentVisible('overview') && (
            <section 
              aria-label="Panoramica accademica" 
              className={styles.dashboardSection}
              suppressHydrationWarning
              id="overview"
            >
              <ErrorBoundary>
                <OverviewStats />
              </ErrorBoundary>
            </section>
          )}
        </div>
        {/* Chat AI unificata - Disponibile tramite layout principale */}
      </main>
      {unlockedAchievement && (
        <AchievementNotification
          achievement={unlockedAchievement}
          onClose={() => setUnlockedAchievement(null)}
        />
      )}
      <KeyboardShortcuts />
    </ErrorBoundary>
  );
}
