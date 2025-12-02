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
import { useIsAdmin } from '@/lib/hooks/useIsAdmin';
import { useSafeRouter } from '@/lib/hooks/useSafeRouter';
import Link from 'next/link';

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
  const isAdmin = useIsAdmin();
  const router = useSafeRouter();
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'notifications' | 'social' | 'payments' | 'supabase' | 'settings'>('reports');
  const [mounted, setMounted] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  
  // useTranslations deve essere chiamato sempre (regole degli hooks)
  const { locale } = useTranslations();
  // Usa sempre il locale anche se non montato per evitare errori
  const dashboardHref = buildLocalePath(locale || 'it', '/dashboard');

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') {
      return;
    }
    
    // Verifica accesso admin
    const checkAccess = async () => {
      // Aspetta un po' per permettere a useIsAdmin di completare
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!isAdmin) {
        // Redirect se non è admin
        router.push('/dashboard');
        return;
      }
      
      setCheckingAccess(false);
      setMounted(true);
    };
    
    checkAccess();
  }, [isClient, isAdmin, router]);

  // Renderizza loading durante verifica accesso
  if (!isClient || checkingAccess) {
    return (
      <div className={styles.adminContainer} suppressHydrationWarning>
        <div className="p-8 text-center text-text-secondary">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Verifica accesso...</p>
        </div>
      </div>
    );
  }

  // Se non è admin, mostra messaggio (dovrebbe essere redirectato, ma per sicurezza)
  if (!isAdmin) {
    return (
      <div className={styles.adminContainer} suppressHydrationWarning>
        <div className="p-8 text-center text-text-secondary">
          <p className="text-lg font-semibold mb-2">Accesso Negato</p>
          <p>Non hai i permessi per accedere a questa sezione.</p>
          <Link href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-accent text-white rounded-lg">
            Torna alla Dashboard
          </Link>
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
 * Best Practices:
 * - Error boundary per catturare errori client-side
 * - NoSSR per prevenire hydration mismatch
 * - Proper error handling
 */
export default function AdminDashboardPage() {
  return (
    <ErrorBoundary
      fallback={
        <div className={styles.adminContainer} style={{ minHeight: '100vh', padding: '2rem' }}>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">Errore nel caricamento</h2>
            <p className="text-text-secondary mb-4">
              Si è verificato un errore nel caricamento dell'area admin.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
            >
              Ricarica la pagina
            </button>
          </div>
        </div>
      }
    >
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
