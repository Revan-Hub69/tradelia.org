'use client';

// Importa il suppressor degli errori di hydration PRIMA di tutto
import '@/lib/utils/suppress-hydration-errors';

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { DashboardHero } from './DashboardHero';
import { OverviewStats } from './OverviewStats';
import { ModuleGrid } from './ModuleGrid';
import { AccountBanner } from './AccountBanner';
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
// WelcomeTour rimosso - causava problemi di posizionamento e bloccava l'interfaccia
import { useTranslations } from '@/lib/i18n/use-translations';
import { useDashboardPreferences } from '@/lib/hooks/useDashboardPreferences';
import { Eye, EyeOff, LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
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
  const [liveMessage, setLiveMessage] = useState('');
  const [unlockedAchievement, setUnlockedAchievement] = useState<any>(null);
  const [hasError, setHasError] = useState(false);
  const router = useSafeRouter();

  // Gestisci errori globali con logging migliorato
  // IMPORTANTE: Tutto questo codice viene eseguito SOLO sul client per evitare hydration mismatch
  useEffect(() => {
    // Verifica che siamo sul client prima di accedere a window/document
    if (typeof window === 'undefined') {
      return;
    }

    const { logError, logRedirect } = require('@/lib/monitoring/error-logger');

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
          console.warn('[DashboardShell] Redirect loop detected, preventing redirect to login');
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
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      if (window.location.pathname === '/login' && document.referrer.includes('/dashboard')) {
        // Usa setTimeout per evitare problemi durante l'hydration
        setTimeout(handleLocationChange, 0);
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
      keys: ['g', 'r'],
      handler: () => router.push('/dashboard/analysis'),
      description: 'Vai ai report',
    },
    {
      keys: ['g', 'c'],
      handler: () => router.push('/dashboard/education'),
      description: 'Vai ai corsi',
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

  // Welcome Tour rimosso - causava problemi di posizionamento e bloccava l'interfaccia

  return (
    <ErrorBoundary>
      <SkipLink href="#modules-view" />
      <ARIALiveRegion message={liveMessage} />
      
      {/* Welcome Tour rimosso - causava problemi di posizionamento e bloccava l'interfaccia */}

      <main 
        className={styles.dashboardMain} 
        role="main" 
        aria-label="Dashboard principale"
        suppressHydrationWarning
      >
        <div id="modules-view" className="modules-view active" role="region" aria-label="Contenuti dashboard">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleHero}
                className="text-text-secondary hover:text-text-primary"
                aria-label={preferences.hideHero ? 'Mostra Hero' : 'Nascondi Hero'}
                title={preferences.hideHero ? 'Mostra Hero' : 'Nascondi Hero'}
              >
                {preferences.hideHero ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Mostra Hero</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Nascondi Hero</span>
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCompactView}
                className="text-text-secondary hover:text-text-primary"
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
          
          {/* Hero Section - Best Practice UX: Prima impressione, welcome, CTA principale */}
          {/* Personalizzabile: può essere nascosta dall'utente per focus sui contenuti */}
          {isLoaded && !preferences.hideHero && (
            <ErrorBoundary>
              <DashboardHero />
            </ErrorBoundary>
          )}
          
          {/* Moduli unificati - Best Practice: organizzazione gerarchica - PRIMA PRIORITÀ */}
          {/* Mostra tutte le funzionalità principali in modo chiaro e accessibile */}
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

          {/* Statistiche chiave - Best Practice: 4-6 metriche essenziali - SECONDARIA */}
          {/* Fornisce overview rapida delle attività principali */}
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

          {/* Widgets Section rimossa - richiede API real-time non disponibili */}
          {/* Verrà riattivata quando le API saranno disponibili */}
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
