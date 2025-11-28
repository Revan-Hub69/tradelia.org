import { OverviewStats } from '@/components/dashboard/OverviewStats';
import { ModuleGrid } from '@/components/dashboard/ModuleGrid';
import styles from '@/components/dashboard/dashboard.module.css';

/**
 * Dashboard Page - Premium Academic Design
 * Based on Cognitive Load Theory, Information Architecture, and WCAG 2.1
 * 
 * Structure:
 * - Overview Section (At-a-glance metrics)
 * - Primary Modules (4-5 main modules)
 * - Secondary Modules (3-4 secondary modules)
 */
export default function DashboardPage() {
  return (
    <div className={styles.dashboardMain}>
        {/* Account Banner Slot */}
        <div id="account-banner-slot" />
        
        {/* Overview Section - At-a-glance metrics (Cognitive Load Theory) */}
        <section 
          aria-label="Panoramica statistiche"
          className={styles.dashboardSection}
        >
          <OverviewStats />
        </section>
        
        {/* Primary Modules - Hub & Spoke Pattern (Information Architecture) */}
        <section 
          aria-label="Moduli principali"
          className={styles.dashboardSection}
        >
          <ModuleGrid priority="primary" />
        </section>
        
        {/* Secondary Modules - Progressive Disclosure */}
        <section 
          aria-label="Moduli secondari"
          className={styles.dashboardSection}
        >
          <ModuleGrid priority="secondary" />
        </section>
    </div>
  );
}
