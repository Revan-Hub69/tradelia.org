'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './DashboardHeader.module.css';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { GlobalSearch } from './GlobalSearch';
import { UserMenu } from './UserMenu';

export function DashboardHeader() {
  const { locale } = useTranslations();
  const dashboardHref = buildLocalePath(locale, '/dashboard');

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
        <div className="flex items-center gap-2 md:gap-3">
          <GlobalSearch />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
