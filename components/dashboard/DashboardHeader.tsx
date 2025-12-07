'use client';

import { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './DashboardHeader.module.css';
import { useTranslations } from '@/lib/i18n/use-translations';
// buildLocalePath removed - system always uses Italian
import dynamic from 'next/dynamic';
import { useAuthState } from '@/lib/hooks/useAuthState';
import { Star, Layout } from 'lucide-react';

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

  // Force re-render when route changes (fixes header not updating on navigation)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleRouteChange = () => {
        // Force a re-render by updating state
        setIsMounted(false);
        setTimeout(() => setIsMounted(true), 0);
      };
      
      // Listen to route changes
      window.addEventListener('popstate', handleRouteChange);
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, []);

  // Force re-render when authentication state changes (fixes header not updating)
  useEffect(() => {
    // This ensures header updates when auth state changes
    if (isMounted) {
      // Trigger a re-render by updating a state if needed
      // The component will re-render automatically when isAuthenticated/isLoading changes
    }
  }, [isAuthenticated, isLoading, isMounted]);

  // Sempre mostra l'header, anche durante loading o stati intermedi
  // Fallback: se nessuna condizione è vera, mostra loading state
  const showLoading = !isMounted || isLoading;
  const showAuthenticated = isMounted && !isLoading && isAuthenticated === true;
  const showUnauthenticated = isMounted && !isLoading && isAuthenticated === false;

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
        
        {/* Azioni - Sempre visibili, con loading states */}
        <nav className={styles.dashboardActions} aria-label="Dashboard actions" suppressHydrationWarning>
          {showLoading ? (
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
          ) : showUnauthenticated ? (
            // Quando non autenticato: mostra "Accedi"
            <>
              <div className={styles.dashboardActionsLeft}>
                {/* LanguageSwitch removed - system always uses Italian */}
              </div>
              <div className={styles.dashboardActionsRight}>
                <Link
                  href="/login"
                  className={styles.loginButton}
                  aria-label={t('dashboard.userMenu.login') || 'Accedi'}
                >
                  {t('dashboard.userMenu.login') || 'Accedi'}
                </Link>
              </div>
            </>
          ) : showAuthenticated ? (
            // Quando autenticato: mostra tutte le azioni
            <>
              <div className={styles.dashboardActionsLeft}>
                {/* LanguageSwitch removed - system always uses Italian */}
                <CurrencySwitch size="sm" />
                <UserStats />
              </div>
              <div className={styles.dashboardActionsRight}>
                <Link
                  href="/dashboard/favorites"
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-bg-soft hover:bg-bg-elevated border border-border-subtle hover:border-accent/40 text-text-secondary hover:text-blue-400 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-accent min-w-[44px] min-h-[44px]"
                  aria-label={t('dashboard.favorites.title') || 'Preferiti'}
                  title={t('dashboard.favorites.title') || 'Preferiti'}
                  onKeyDown={(e) => {
                    // Best Practice: Enter e Space attivano il link (WCAG 2.1.1)
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      window.location.href = '/dashboard/favorites';
                    }
                  }}
                  onMouseEnter={() => {
                    // Prefetch favorites page on hover
                    if (typeof window !== 'undefined') {
                      const link = document.createElement('link');
                      link.rel = 'prefetch';
                      link.href = '/dashboard/favorites';
                      document.head.appendChild(link);
                    }
                  }}
                >
                  <Star className="w-5 h-5" aria-hidden="true" />
                </Link>
                <Link
                  href="/dashboard/widgets"
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-bg-soft hover:bg-bg-elevated border border-border-subtle hover:border-accent/40 text-text-secondary hover:text-blue-400 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-accent min-w-[44px] min-h-[44px]"
                  aria-label="Widget"
                  title="Widget"
                  onKeyDown={(e) => {
                    // Best Practice: Enter e Space attivano il link (WCAG 2.1.1)
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      window.location.href = '/dashboard/widgets';
                    }
                  }}
                  onMouseEnter={() => {
                    // Prefetch widgets page on hover
                    if (typeof window !== 'undefined') {
                      const link = document.createElement('link');
                      link.rel = 'prefetch';
                      link.href = '/dashboard/widgets';
                      document.head.appendChild(link);
                    }
                  }}
                >
                  <Layout className="w-5 h-5" aria-hidden="true" />
                </Link>
                <GlobalSearch />
                <UserMenu />
              </div>
            </>
          ) : (
            // Fallback: mostra loading state se nessuna condizione è vera (non dovrebbe mai accadere, ma sicurezza)
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
          )}
        </nav>
      </div>
    </header>
  );
}

// Memoize component to prevent unnecessary re-renders (Performance Best Practice 2025)
export const DashboardHeader = memo(DashboardHeaderComponent);
DashboardHeader.displayName = 'DashboardHeader';
