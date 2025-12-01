'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './DashboardHeader.module.css';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Lazy load non-critical header components
const GlobalSearch = dynamic(() => import('./GlobalSearch').then(mod => ({ default: mod.GlobalSearch })), {
  ssr: false,
});

const UserMenu = dynamic(() => import('./UserMenu').then(mod => ({ default: mod.UserMenu })), {
  ssr: false,
});

const UserStats = dynamic(() => import('@/components/gamification/UserStats').then(mod => ({ default: mod.UserStats })), {
  ssr: false,
});

export function DashboardHeader() {
  const { locale } = useTranslations();
  const dashboardHref = buildLocalePath(locale, '/dashboard');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className={styles.dashboardHeaderMinimal} suppressHydrationWarning style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <div className={styles.dashboardHeaderContent}>
        <div className={styles.dashboardTitle}>
          <Link href="/" className={styles.dashboardBrand}>
            {isClient && (
              <Image
                src="/logos/tradelia-logo.svg"
                alt="Tradelia AI"
                width={140}
                height={35}
                className={styles.dashboardBrandLogo}
                priority
              />
            )}
          </Link>
          <span className={styles.dashboardTitleSeparator}>·</span>
          <span className={styles.dashboardTitleText}>Dashboard</span>
        </div>
        <div className={styles.dashboardActions}>
          <UserStats />
          <GlobalSearch />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
