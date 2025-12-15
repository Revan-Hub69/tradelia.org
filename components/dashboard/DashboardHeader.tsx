'use client';

import { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './DashboardHeader.module.css';
import { useTranslations } from '@/lib/i18n/use-translations';
// buildLocalePath removed - system always uses Italian
import dynamic from 'next/dynamic';
import { useAuthState } from '@/lib/hooks/useAuthState';
import { Star } from 'lucide-react';

// Lazy load non-critical header components
const GlobalSearch = dynamic(() => import('./GlobalSearch').then(mod => ({ default: mod.GlobalSearch })), {
  ssr: false,
  loading: () => <div className="w-8 h-8 bg-bg-soft rounded animate-pulse" />,
});

const UserMenu = dynamic(() => import('./UserMenu').then(mod => ({ default: mod.UserMenu })), {
  ssr: false,
  loading: () => <div className="w-8 h-8 bg-bg-soft rounded-full animate-pulse" />,
});



// LanguageSwitch removed - system always uses Italian

/**
 * Dashboard Header Component
 * Clean, modern header with single logo and responsive design
 * Best practices 2025:
 * - Single logo (no fallback text to avoid duplication)
 * - Proper semantic HTML (header, nav, aria-labels)
 * - Accessible navigation (keyboard, screen readers)
 * - Responsive design (mobile-first)
 * - Always visible, even during loading
 * - Login button prominently displayed when not authenticated
 * - Performance optimized (React.memo, dynamic imports)
 * - Internationalized (translated text)
 * - NO HYDRATION MISMATCH: Uses client-only state to prevent SSR/client differences
 */
function DashboardHeaderComponent() {
  const { locale, t } = useTranslations();
  const { isAuthenticated, isLoading } = useAuthState();
  
  // CRITICAL: Prevent hydration mismatch by ensuring we only render after client mount
  // This ensures server and client render the same initial state
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted only on client, after hydration
    setIsMounted(true);
  }, []);

  // During SSR and initial hydration, always show loading state to prevent mismatch
  const shouldShowLoading = !isMounted || isLoading;
  const shouldShowAuthenticated = isMounted && !isLoading && isAuthenticated;
  const shouldShowUnauthenticated = isMounted && !isLoading && !isAuthenticated;

  return (
    <header 
      className={styles.dashboardHeaderMinimal} 
      suppressHydrationWarning 
      style={{ width: '100%', maxWidth: '100%' }}
      role="banner"
    >
      <div className={styles.dashboardHeaderContent}>
        {/* Logo e Titolo - Sempre visibile */}
        <div className={styles.dashboardTitle}>
          <Link 
            href="/" 
            className={styles.dashboardBrand}
            aria-label="Tradelia AI - Home"
          >
            <Image
              src="/logos/tradelia-logo.svg"
              alt="Tradelia AI"
              width={140}
              height={35}
              className={styles.dashboardBrandLogo}
              priority
              unoptimized={false}
            />
          </Link>
          <span className={styles.dashboardTitleSeparator} aria-hidden="true">·</span>
          <span className={styles.dashboardTitleText} suppressHydrationWarning>
            {t('header.dashboard') || 'Dashboard'}
          </span>
        </div>
        
        {/* Azioni - Mobile: solo essenziali, Desktop: tutto */}
        <nav className={styles.dashboardActions} aria-label="Dashboard actions" suppressHydrationWarning>
          {shouldShowLoading ? (
            <div className={styles.dashboardActionsRight} aria-label={t('common.loading') || 'Loading'}>
              <div className="w-8 h-8 bg-bg-soft rounded-full animate-pulse" aria-hidden="true" />
            </div>
          ) : shouldShowUnauthenticated ? (
            <div className={styles.dashboardActionsRight}>
              <Link
                href="/login"
                className={styles.loginButton}
                aria-label={t('dashboard.userMenu.login') || 'Accedi'}
              >
                <span className="hidden sm:inline">{t('dashboard.userMenu.login') || 'Accedi'}</span>
                <span className="sm:hidden">Accedi</span>
              </Link>
            </div>
          ) : shouldShowAuthenticated ? (
            <>
              <div className={styles.dashboardActionsLeft}>
              </div>
              <div className={styles.dashboardActionsRight}>
                <Link
                  href="/dashboard/favorites"
                  className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-bg-soft hover:bg-bg-elevated border border-border-subtle hover:border-accent/40 text-text-secondary hover:text-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px]"
                  aria-label={t('dashboard.favorites.title') || 'Preferiti'}
                  title={t('dashboard.favorites.title') || 'Preferiti'}
                >
                  <Star className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </Link>
                <GlobalSearch />
                <UserMenu />
              </div>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

// Memoize component to prevent unnecessary re-renders (Performance Best Practice 2025)
export const DashboardHeader = memo(DashboardHeaderComponent);
DashboardHeader.displayName = 'DashboardHeader';
