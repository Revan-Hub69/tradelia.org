'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './DashboardHeader.module.css';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import dynamic from 'next/dynamic';
import { useAuthState } from '@/lib/hooks/useAuthState';

// Lazy load non-critical header components
const GlobalSearch = dynamic(() => import('./GlobalSearch').then(mod => ({ default: mod.GlobalSearch })), {
  ssr: false,
  loading: () => <div className="w-8 h-8 bg-bg-soft rounded animate-pulse" />,
});

const UserMenu = dynamic(() => import('./UserMenu').then(mod => ({ default: mod.UserMenu })), {
  ssr: false,
  loading: () => <div className="w-8 h-8 bg-bg-soft rounded-full animate-pulse" />,
});

const UserStats = dynamic(() => import('@/components/gamification/UserStats').then(mod => ({ default: mod.UserStats })), {
  ssr: false,
  loading: () => <div className="w-16 h-6 bg-bg-soft rounded animate-pulse" />,
});

const CurrencySwitch = dynamic(() => import('@/components/ui/CurrencySwitch').then(mod => ({ default: mod.CurrencySwitch })), {
  ssr: false,
  loading: () => <div className="w-16 h-8 bg-bg-soft rounded animate-pulse" />,
});

const LanguageSwitch = dynamic(() => import('@/components/ui/LanguageSwitch').then(mod => ({ default: mod.LanguageSwitch })), {
  ssr: false,
  loading: () => <div className="w-8 h-8 bg-bg-soft rounded animate-pulse" />,
});

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
 */
function DashboardHeaderComponent() {
  const { locale, t } = useTranslations();
  const { isAuthenticated, isLoading } = useAuthState();

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
          <span className={styles.dashboardTitleText}>{t('header.dashboard') || 'Dashboard'}</span>
        </div>
        
        {/* Azioni - Sempre visibili, con loading states */}
        <nav className={styles.dashboardActions} aria-label="Dashboard actions" suppressHydrationWarning>
          {isLoading ? (
            // Loading state - mostra skeleton per tutti i componenti (accessibile)
            <>
              <div className={styles.dashboardActionsLeft} aria-label={t('common.loading') || 'Loading'}>
                <div className="w-8 h-8 bg-bg-soft rounded animate-pulse" aria-hidden="true" />
                <div className="w-16 h-8 bg-bg-soft rounded animate-pulse" aria-hidden="true" />
                <div className="w-16 h-6 bg-bg-soft rounded animate-pulse" aria-hidden="true" />
              </div>
              <div className={styles.dashboardActionsRight} aria-label={t('common.loading') || 'Loading'}>
                <div className="w-8 h-8 bg-bg-soft rounded animate-pulse" aria-hidden="true" />
                <div className="w-8 h-8 bg-bg-soft rounded-full animate-pulse" aria-hidden="true" />
              </div>
            </>
          ) : !isAuthenticated ? (
            // Quando non autenticato: mostra "Accedi" e LanguageSwitch
            <>
              <div className={styles.dashboardActionsLeft}>
                <LanguageSwitch size="sm" />
              </div>
              <div className={styles.dashboardActionsRight}>
                <Link
                  href={buildLocalePath(locale, '/login')}
                  className={styles.loginButton}
                  aria-label={t('dashboard.userMenu.login') || 'Accedi'}
                >
                  {t('dashboard.userMenu.login') || 'Accedi'}
                </Link>
              </div>
            </>
          ) : (
            // Quando autenticato: mostra tutte le azioni
            <>
              <div className={styles.dashboardActionsLeft}>
                <LanguageSwitch size="sm" />
                <CurrencySwitch size="sm" />
                <UserStats />
              </div>
              <div className={styles.dashboardActionsRight}>
                <GlobalSearch />
                <UserMenu />
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

// Memoize component to prevent unnecessary re-renders (Performance Best Practice 2025)
export const DashboardHeader = memo(DashboardHeaderComponent);
DashboardHeader.displayName = 'DashboardHeader';
