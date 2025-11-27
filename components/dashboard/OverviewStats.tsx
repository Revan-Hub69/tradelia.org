'use client';

import styles from '../../app/dashboard/dashboard.module.css';

export function OverviewStats() {
  // TODO: Caricare dati reali da API
  const stats = {
    totalReports: 0,
    lastUpdate: null as Date | null,
  };

  return (
    <section className={styles.overviewSection}>
      <h2 className={styles.sectionTitle}>Panoramica</h2>
      <div className={styles.overviewStatsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.totalReports}</div>
          <div className={styles.statLabel}>Report Totali</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {stats.lastUpdate
              ? new Date(stats.lastUpdate).toLocaleDateString('it-IT')
              : '—'}
          </div>
          <div className={styles.statLabel}>Ultimo Aggiornamento</div>
        </div>
      </div>
    </section>
  );
}
