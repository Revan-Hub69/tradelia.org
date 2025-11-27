'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './DashboardHeader.module.css';

export function DashboardHeader() {
  return (
    <header className={styles.dashboardHeaderModern}>
      <div className={styles.dashboardHeaderContent}>
        <h1 className={styles.dashboardTitle}>
          <Link href="/" className={styles.dashboardBrand}>
            <div className={styles.dashboardLogoWrapper}>
              <Image
                src="/logos/tradelia-logo.svg"
                alt="Tradelia AI"
                width={200}
                height={50}
                className={styles.dashboardBrandLogo}
                priority
              />
              {/* Linea blu 15% del logo - WOW effect */}
              <div className={styles.dashboardLogoBlueLine} />
            </div>
            <span className={styles.dashboardBrandTextFallback}>
              <span className={styles.dashboardBrandWord}>TRADELIA</span>
              <span className={styles.dashboardBrandDot} />
              <span className={styles.dashboardBrandSuffix}>AI</span>
            </span>
          </Link>
          <span className={styles.dashboardTitleSeparator}>·</span>
          <span className={styles.dashboardTitleText}>Dashboard</span>
        </h1>
      </div>
    </header>
  );
}
