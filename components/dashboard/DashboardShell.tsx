'use client';

// Importa il suppressor degli errori di hydration PRIMA di tutto
import '@/lib/utils/suppress-hydration-errors';

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { DashboardHero } from './DashboardHero';
import { OverviewStats } from './OverviewStats';
import { ModuleGrid } from './ModuleGrid';
import { AccountBanner } from './AccountBanner';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';
import { UserBenefits } from './UserBenefits';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Skeleton } from '@/components/ui/Skeleton';
import { SkipLink } from '@/components/ui/SkipLink';
import { ARIALiveRegion } from '@/components/ui/ARIALiveRegion';
import { AchievementNotification } from '@/components/gamification/AchievementNotification';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { useSafeRouter } from '@/lib/hooks/useSafeRouter';
import { WelcomeTour } from '@/components/onboarding/WelcomeTour';
import { useTranslations } from '@/lib/i18n/use-translations';
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

  // Welcome Tour steps
  const tourSteps = [
    {
      id: 'dashboard-overview',
      target: '#modules-view',
      title: t('onboarding.step1Title') || 'Dashboard Principale',
      content: t('onboarding.step1Content') || 'Qui puoi vedere tutte le tue attività, report, corsi e statistiche in un unico posto.',
      position: 'bottom' as const,
    },
    {
      id: 'reports',
      target: '[href*="/dashboard/analysis"], [href*="/dashboard/reports"]',
      title: t('onboarding.step2Title') || 'Report Ufficiali',
      content: t('onboarding.step2Content') || 'Accedi ai report verificabili e alle analisi conformi MiFID II.',
      position: 'bottom' as const,
      action: () => {
        // Scroll to reports section if exists
        const reportsSection = document.querySelector('[href*="/dashboard/analysis"], [href*="/dashboard/reports"]');
        if (reportsSection) {
          reportsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
    },
    {
      id: 'education',
      target: '[href*="/dashboard/education"]',
      title: t('onboarding.step3Title') || 'Corsi Formativi',
      content: t('onboarding.step3Content') || 'Esplora i percorsi formativi basati su framework AI verificabili.',
      position: 'bottom' as const,
    },
    {
      id: 'utilities',
      target: '[data-utility-trigger], [href*="utilities"]',
      title: t('onboarding.step4Title') || 'Utilities Pro',
      content: t('onboarding.step4Content') || 'Gestisci portafoglio, alert, trading journal e molto altro (richiede account Pro).',
      position: 'bottom' as const,
    },
    {
      id: 'settings',
      target: '[href*="/dashboard/settings"]',
      title: t('onboarding.step5Title') || 'Impostazioni',
      content: t('onboarding.step5Content') || 'Personalizza la tua esperienza: profilo, notifiche, preferenze e sicurezza.',
      position: 'bottom' as const,
    },
  ];

  return (
    <ErrorBoundary>
      <SkipLink href="#modules-view" />
      <ARIALiveRegion message={liveMessage} />
      
      {/* Welcome Tour */}
      <WelcomeTour
        steps={tourSteps}
        storageKey="tradelia-welcome-tour-completed"
        onComplete={() => {
          setLiveMessage(t('onboarding.welcome') || 'Tour completato!');
        }}
      />

      <main 
        className={styles.dashboardMain} 
        role="main" 
        aria-label="Dashboard principale"
        suppressHydrationWarning
      >
        <div id="account-banner-slot" role="region" aria-label="Stato account">
          <ErrorBoundary>
            <AccountBanner />
          </ErrorBoundary>
        </div>
        <div id="modules-view" className="modules-view active" role="region" aria-label="Contenuti dashboard">
          {/* Breadcrumb per navigazione */}
          <div className="mb-6 pb-4 border-b border-border-subtle">
            <ErrorBoundary>
              <Breadcrumb />
            </ErrorBoundary>
          </div>
          
          <ErrorBoundary>
            <DashboardHero />
          </ErrorBoundary>
          
          {/* Moduli unificati - Best Practice: organizzazione gerarchica - PRIMA PRIORITÀ */}
          <section 
            aria-label="Moduli e funzionalità" 
            className={styles.dashboardSection}
            id="modules"
          >
            <ErrorBoundary>
              <ModuleGrid />
            </ErrorBoundary>
          </section>

          {/* Statistiche chiave - Best Practice: 4-6 metriche essenziali - SECONDARIA */}
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
        </div>
        <ErrorBoundary>
          <Suspense fallback={null}>
            <HelpAssistant />
          </Suspense>
        </ErrorBoundary>
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
