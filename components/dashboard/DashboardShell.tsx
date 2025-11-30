import { DashboardHero } from './DashboardHero';
import { OverviewStats } from './OverviewStats';
import { ModuleGrid } from './ModuleGrid';
import styles from './dashboard.module.css';

export function DashboardShell() {
  return (
    <div className={styles.dashboardMain}>
      <div id="account-banner-slot" />
      <div id="modules-view" className="modules-view active">
        <DashboardHero />
        <section aria-label="Academic overview" className={styles.dashboardSection}>
          <OverviewStats />
        </section>
        <section aria-label="Primary modules" className={styles.dashboardSection}>
          <ModuleGrid priority="primary" />
        </section>
        <section aria-label="Secondary modules" className={styles.dashboardSection}>
          <ModuleGrid priority="secondary" />
        </section>
      </div>
    </div>
  );
}
