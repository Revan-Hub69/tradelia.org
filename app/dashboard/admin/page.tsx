'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FileText, Users, Settings, BarChart3, Bell, Share2, CreditCard, Database } from 'lucide-react';
import styles from './admin.module.css';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { NoSSR } from '@/components/common/NoSSR';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { useIsClient } from '@/lib/hooks/useIsClient';

// Dynamic imports con ssr: false per evitare hydration mismatch
const ReportsManagement = dynamic(() => import('@/components/admin/ReportsManagement').then(m => ({ default: m.ReportsManagement })), {
  ssr: false,
  loading: () => <div className="p-4 text-text-secondary">Caricamento...</div>,
});

const UsersManagement = dynamic(() => import('@/components/admin/UsersManagement').then(m => ({ default: m.UsersManagement })), {
  ssr: false,
  loading: () => <div className="p-4 text-text-secondary">Caricamento...</div>,
});

const NotificationManagement = dynamic(() => import('@/components/admin/NotificationManagement').then(m => ({ default: m.NotificationManagement })), {
  ssr: false,
  loading: () => <div className="p-4 text-text-secondary">Caricamento...</div>,
});

const SocialMediaManagement = dynamic(() => import('@/components/admin/SocialMediaManagement').then(m => ({ default: m.SocialMediaManagement })), {
  ssr: false,
  loading: () => <div className="p-4 text-text-secondary">Caricamento...</div>,
});

const PaymentsManagement = dynamic(() => import('@/components/admin/PaymentsManagement').then(m => ({ default: m.PaymentsManagement })), {
  ssr: false,
  loading: () => <div className="p-4 text-text-secondary">Caricamento...</div>,
});

const SupabaseManagement = dynamic(() => import('@/components/admin/SupabaseManagement').then(m => ({ default: m.SupabaseManagement })), {
  ssr: false,
  loading: () => <div className="p-4 text-text-secondary">Caricamento...</div>,
});

/**
 * Admin Dashboard Page
 * Manages reports creation and user management
 * COMPLETELY CLIENT-SIDE to prevent hydration mismatch
 */
function AdminDashboardContent() {
  const isClient = useIsClient();
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'notifications' | 'social' | 'payments' | 'supabase' | 'settings'>('reports');
  const [mounted, setMounted] = useState(false);
  
  // useTranslations deve essere chiamato sempre (regole degli hooks)
  // ma non useremo il valore fino a quando non siamo montati
  const { locale } = useTranslations();
  const dashboardHref = mounted ? buildLocalePath(locale, '/dashboard') : '/dashboard';

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') {
      return;
    }
    
    // Doppio RAF + timeout ridotto per permettere il funzionamento
    const rafId1 = requestAnimationFrame(() => {
      const rafId2 = requestAnimationFrame(() => {
        setTimeout(() => {
          setMounted(true);
        }, 50); // Delay ridotto per permettere il funzionamento
      });
      return () => cancelAnimationFrame(rafId2);
    });
    
    return () => cancelAnimationFrame(rafId1);
  }, [isClient]);

  // Non renderizzare nulla fino a quando non siamo completamente montati
  if (!isClient || !mounted) {
    return (
      <div className={styles.adminContainer} suppressHydrationWarning>
        <div className="p-8 text-center text-text-secondary">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Caricamento area admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Admin Header */}
      <header className={styles.adminHeader}>
        <div className={styles.adminHeaderContent}>
          <h1 className={styles.adminTitle}>
            <BarChart3 className={styles.adminTitleIcon} aria-hidden="true" />
            Admin Dashboard
          </h1>
          <nav className={styles.adminNav} role="tablist" aria-label="Admin sections">
            <button
              role="tab"
              aria-selected={activeTab === 'reports'}
              aria-controls="reports-panel"
              className={`${styles.adminNavButton} ${activeTab === 'reports' ? styles.active : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <FileText className={styles.adminNavIcon} aria-hidden="true" />
              <span>Report</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'users'}
              aria-controls="users-panel"
              className={`${styles.adminNavButton} ${activeTab === 'users' ? styles.active : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users className={styles.adminNavIcon} aria-hidden="true" />
              <span>Utenti</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'notifications'}
              aria-controls="notifications-panel"
              className={`${styles.adminNavButton} ${activeTab === 'notifications' ? styles.active : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className={styles.adminNavIcon} aria-hidden="true" />
              <span>Notifiche</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'social'}
              aria-controls="social-panel"
              className={`${styles.adminNavButton} ${activeTab === 'social' ? styles.active : ''}`}
              onClick={() => setActiveTab('social')}
            >
              <Share2 className={styles.adminNavIcon} aria-hidden="true" />
              <span>Social</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'payments'}
              aria-controls="payments-panel"
              className={`${styles.adminNavButton} ${activeTab === 'payments' ? styles.active : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              <CreditCard className={styles.adminNavIcon} aria-hidden="true" />
              <span>Pagamenti</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'supabase'}
              aria-controls="supabase-panel"
              className={`${styles.adminNavButton} ${activeTab === 'supabase' ? styles.active : ''}`}
              onClick={() => setActiveTab('supabase')}
            >
              <Database className={styles.adminNavIcon} aria-hidden="true" />
              <span>Supabase</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'settings'}
              aria-controls="settings-panel"
              className={`${styles.adminNavButton} ${activeTab === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className={styles.adminNavIcon} aria-hidden="true" />
              <span>Impostazioni</span>
            </button>
          </nav>
        </div>
        <Link href={dashboardHref} className={styles.backToDashboard}>
          ← Torna alla Dashboard
        </Link>
      </header>

      {/* Admin Content */}
      <main className={styles.adminMain}>
        <div
          id="reports-panel"
          role="tabpanel"
          aria-labelledby="reports-tab"
          className={styles.adminPanel}
          hidden={activeTab !== 'reports'}
        >
          <ReportsManagement />
        </div>

        <div
          id="users-panel"
          role="tabpanel"
          aria-labelledby="users-tab"
          className={styles.adminPanel}
          hidden={activeTab !== 'users'}
        >
          <UsersManagement />
        </div>

        <div
          id="notifications-panel"
          role="tabpanel"
          aria-labelledby="notifications-tab"
          className={styles.adminPanel}
          hidden={activeTab !== 'notifications'}
        >
          <NotificationManagement />
        </div>

        <div
          id="social-panel"
          role="tabpanel"
          aria-labelledby="social-tab"
          className={styles.adminPanel}
          hidden={activeTab !== 'social'}
        >
          <SocialMediaManagement />
        </div>

        <div
          id="payments-panel"
          role="tabpanel"
          aria-labelledby="payments-tab"
          className={styles.adminPanel}
          hidden={activeTab !== 'payments'}
        >
          <PaymentsManagement />
        </div>

        <div
          id="supabase-panel"
          role="tabpanel"
          aria-labelledby="supabase-tab"
          className={styles.adminPanel}
          hidden={activeTab !== 'supabase'}
        >
          <SupabaseManagement />
        </div>

        <div
          id="settings-panel"
          role="tabpanel"
          aria-labelledby="settings-tab"
          className={styles.adminPanel}
          hidden={activeTab !== 'settings'}
        >
          <div className={styles.settingsPlaceholder}>
            <Settings className={styles.settingsIcon} aria-hidden="true" />
            <h2>Impostazioni Admin</h2>
            <p>Configurazioni admin disponibili a breve.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Admin Dashboard Page - COMPLETELY CLIENT-SIDE, NO HYDRATION
 * Usa NoSSR per prevenire completamente l'hydration mismatch
 */
export default function AdminDashboardPage() {
  return (
    <ErrorBoundary>
      <NoSSR fallback={
        <div className={styles.adminContainer} suppressHydrationWarning style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
          <div className="p-8 text-center text-text-secondary">
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Caricamento area admin...</p>
          </div>
        </div>
      }>
        <div suppressHydrationWarning style={{ width: '100%', overflowX: 'hidden', minHeight: '100vh' }}>
          <AdminDashboardContent />
        </div>
      </NoSSR>
    </ErrorBoundary>
  );
}
