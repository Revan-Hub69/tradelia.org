import { OverviewStats } from '@/components/dashboard/OverviewStats';
import { ModuleGrid } from '@/components/dashboard/ModuleGrid';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  return (
    <div className={styles.dashboardMain}>
      {/* Account Banner Slot */}
      <div id="account-banner-slot" />
      
      {/* Modules Grid View */}
      <div id="modules-view" className="modules-view active">
        <OverviewStats />
        <ModuleGrid />
      </div>
      </div>
  );
}
