'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ReportsManagement } from '@/components/admin/ReportsManagement';
import { UsersManagement } from '@/components/admin/UsersManagement';
import { NotificationManagement } from '@/components/admin/NotificationManagement';
import { SocialMediaManagement } from '@/components/admin/SocialMediaManagement';
import { FileText, Users, Settings, BarChart3, Bell, Share2 } from 'lucide-react';
import styles from './admin.module.css';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';

/**
 * Admin Dashboard Page
 * Manages reports creation and user management
 */
export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'notifications' | 'social' | 'settings'>('reports');
  const { locale } = useTranslations();
  const dashboardHref = buildLocalePath(locale, '/dashboard');

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
