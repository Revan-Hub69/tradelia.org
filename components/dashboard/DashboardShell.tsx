'use client';

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { DashboardHero } from './DashboardHero';
import { OverviewStats } from './OverviewStats';
import { ModuleGrid } from './ModuleGrid';
import { AccountBanner } from './AccountBanner';
import { QuickLinks } from './QuickLinks';
import { RecentActivity } from './RecentActivity';
import { QuickActions } from './QuickActions';
import { Favorites } from './Favorites';
import { ProgressTracking } from './ProgressTracking';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Skeleton } from '@/components/ui/Skeleton';
import { SkipLink } from '@/components/ui/SkipLink';
import { ARIALiveRegion } from '@/components/ui/ARIALiveRegion';
import { AchievementNotification } from '@/components/gamification/AchievementNotification';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { useRouter } from 'next/navigation';
import { WelcomeTour } from '@/components/onboarding/WelcomeTour';
import { useTranslations } from '@/lib/i18n/use-translations';
import styles from './dashboard.module.css';

// Lazy load non-critical components
const HelpSupport = lazy(() => 
  import('./HelpSupport').then(module => ({ default: module.HelpSupport }))
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
  const router = useRouter();

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
          router.refresh();
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
      handler: () => router.push('/dashboard#reports'),
      description: 'Vai ai report',
    },
    {
      keys: ['g', 'c'],
      handler: () => router.push('/dashboard#education'),
      description: 'Vai ai corsi',
    },
    {
      keys: ['g', 's'],
      handler: () => router.push('/dashboard#settings'),
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
      target: '[href*="/dashboard/reports"], [href*="#reports"]',
      title: t('onboarding.step2Title') || 'Report Ufficiali',
      content: t('onboarding.step2Content') || 'Accedi ai report verificabili e alle analisi conformi MiFID II.',
      position: 'bottom' as const,
      action: () => {
        // Scroll to reports section if exists
        const reportsSection = document.querySelector('[href*="/dashboard/reports"], [href*="#reports"]');
        if (reportsSection) {
          reportsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
    },
    {
      id: 'education',
      target: '[href*="/dashboard/education"], [href*="#education"]',
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
      target: '[href*="/dashboard/settings"], [href*="#settings"]',
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
          <ErrorBoundary>
            <DashboardHero />
          </ErrorBoundary>
          <section 
            aria-label="Risorse rapide" 
            className={styles.dashboardSection}
            id="quick-links"
          >
            <ErrorBoundary>
              <QuickLinks />
            </ErrorBoundary>
          </section>
          <section 
            aria-label="Azioni rapide" 
            className={styles.dashboardSection}
            id="quick-actions"
          >
            <ErrorBoundary>
              <QuickActions />
            </ErrorBoundary>
          </section>
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
          <section 
            aria-label="Attività recenti" 
            className={styles.dashboardSection}
            id="recent-activity"
          >
            <ErrorBoundary>
              <RecentActivity />
            </ErrorBoundary>
          </section>
          <section 
            aria-label="Preferiti" 
            className={styles.dashboardSection}
            id="favorites"
          >
            <ErrorBoundary>
              <Favorites />
            </ErrorBoundary>
          </section>
          <section 
            aria-label="Progresso" 
            className={styles.dashboardSection}
            id="progress"
          >
            <ErrorBoundary>
              <ProgressTracking />
            </ErrorBoundary>
          </section>
          <section 
            aria-label="Moduli principali" 
            className={styles.dashboardSection}
            id="primary-modules"
          >
            <ErrorBoundary>
              <ModuleGrid priority="primary" />
            </ErrorBoundary>
          </section>
          <section 
            aria-label="Moduli secondari" 
            className={styles.dashboardSection}
            id="secondary-modules"
          >
            <ErrorBoundary>
              <ModuleGrid priority="secondary" />
            </ErrorBoundary>
          </section>
        </div>
        <ErrorBoundary>
          <Suspense fallback={null}>
            <HelpSupport />
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
