import { DashboardHero } from './DashboardHero';
import { OverviewStats } from './OverviewStats';
import { ModuleGrid } from './ModuleGrid';
import { AccountBanner } from './AccountBanner';
import { QuickLinks } from './QuickLinks';
import { RecentActivity } from './RecentActivity';
import { QuickActions } from './QuickActions';
import { Favorites } from './Favorites';
import { ProgressTracking } from './ProgressTracking';
import { HelpSupport } from './HelpSupport';
import styles from './dashboard.module.css';

/**
 * DashboardShell - Main dashboard container
 * Best practices:
 * - Semantic HTML with proper ARIA labels
 * - Logical content hierarchy
 * - Accessible navigation structure
 * - Performance optimized with lazy loading
 */
export function DashboardShell() {
  return (
    <main className={styles.dashboardMain} role="main" aria-label="Dashboard principale">
      <div id="account-banner-slot" role="region" aria-label="Stato account">
        <AccountBanner />
      </div>
      <div id="modules-view" className="modules-view active" role="region" aria-label="Contenuti dashboard">
        <DashboardHero />
        <section 
          aria-label="Risorse rapide" 
          className={styles.dashboardSection}
          id="quick-links"
        >
          <QuickLinks />
        </section>
        <section 
          aria-label="Azioni rapide" 
          className={styles.dashboardSection}
          id="quick-actions"
        >
          <QuickActions />
        </section>
        <section 
          aria-label="Panoramica accademica" 
          className={styles.dashboardSection}
          id="overview"
        >
          <OverviewStats />
        </section>
        <section 
          aria-label="Attività recenti" 
          className={styles.dashboardSection}
          id="recent-activity"
        >
          <RecentActivity />
        </section>
        <section 
          aria-label="Preferiti" 
          className={styles.dashboardSection}
          id="favorites"
        >
          <Favorites />
        </section>
        <section 
          aria-label="Progresso" 
          className={styles.dashboardSection}
          id="progress"
        >
          <ProgressTracking />
        </section>
        <section 
          aria-label="Moduli principali" 
          className={styles.dashboardSection}
          id="primary-modules"
        >
          <ModuleGrid priority="primary" />
        </section>
        <section 
          aria-label="Moduli secondari" 
          className={styles.dashboardSection}
          id="secondary-modules"
        >
          <ModuleGrid priority="secondary" />
        </section>
      </div>
      <HelpSupport />
    </main>
  );
}
