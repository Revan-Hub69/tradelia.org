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
  const [liveMessage, setLiveMessage] = useState('');
  const [unlockedAchievement, setUnlockedAchievement] = useState<any>(null);
  const router = useRouter();

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

  return (
    <ErrorBoundary>
      <SkipLink href="#modules-view" />
      <ARIALiveRegion message={liveMessage} />
      <main className={styles.dashboardMain} role="main" aria-label="Dashboard principale">
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
