'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './DashboardHeader.module.css';

export function DashboardHeader() {
  return (
    <header className={styles.dashboardHeaderMinimal}>
      <div className={styles.dashboardHeaderContent}>
        <h1 className={styles.dashboardTitle}>
          <Link href="/" className={styles.dashboardBrand}>
            <Image
              src="/logos/tradelia-logo.svg"
              alt="Tradelia AI"
              width={200}
              height={50}
              className={styles.dashboardBrandLogo}
              priority
            />
            <span className={styles.dashboardBrandTextFallback}>
              <span className={styles.dashboardBrandWord}>TRADELIA</span>
              <span className={styles.dashboardBrandDot} />
              <span className={styles.dashboardBrandSuffix}>AI</span>
            </span>
          </Link>
          <span className={styles.dashboardTitleSeparator}>·</span>
          <span className={styles.dashboardTitleText}>Dashboard</span>
        </h1>
        <Link href="/dashboard" className={styles.dashboardLink}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          <span>Dashboard</span>
        </Link>
      </div>
    </header>
  );
}
