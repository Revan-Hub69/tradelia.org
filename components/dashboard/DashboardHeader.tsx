'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './DashboardHeader.module.css';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import dynamic from 'next/dynamic';
import { useIsClient } from '@/lib/hooks/useIsClient';

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

/**
 * Dashboard Header Component
 * Clean, modern header with single logo and responsive design
 * Best practices:
 * - Single logo (no fallback text to avoid duplication)
 * - Proper semantic HTML
 * - Accessible navigation
 * - Responsive design
 * - Client-side only rendering to prevent hydration issues
 */
export function DashboardHeader() {
  const isClient = useIsClient();
  const { locale } = useTranslations();
  const dashboardHref = buildLocalePath(locale, '/dashboard');

  return (
    <header 
      className={styles.dashboardHeaderMinimal} 
      suppressHydrationWarning 
      style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}
      role="banner"
    >
      <div className={styles.dashboardHeaderContent}>
        <div className={styles.dashboardTitle}>
          <Link 
            href="/" 
            className={styles.dashboardBrand}
            aria-label="Tradelia AI - Home"
          >
            {isClient && (
              <Image
                src="/logos/tradelia-logo.svg"
                alt="Tradelia AI"
                width={140}
                height={35}
                className={styles.dashboardBrandLogo}
                priority
                unoptimized={false}
              />
            )}
          </Link>
          <span className={styles.dashboardTitleSeparator} aria-hidden="true">·</span>
          <span className={styles.dashboardTitleText}>Dashboard</span>
        </div>
        <nav className={styles.dashboardActions} aria-label="Dashboard actions">
          <UserStats />
          <GlobalSearch />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
