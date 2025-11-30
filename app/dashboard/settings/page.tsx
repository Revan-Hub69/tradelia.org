'use client';

import { useState } from 'react';
import { Settings, User, Bell, Shield, CreditCard, Globe } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import Link from 'next/link';
import { buildLocalePath } from '@/lib/i18n/paths';

/**
 * Settings Page
 * Impostazioni utente
 * BASE: Profilo, notifiche, lingua
 * PRO: API keys, backup (futuro)
 */
export default function SettingsPage() {
  const { t, locale } = useTranslations();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'billing' | 'preferences'>('profile');

  const tabs = [
    {
      id: 'profile' as const,
      label: t('dashboard.settings.tabs.profile') || 'Profilo',
      icon: User,
    },
    {
      id: 'notifications' as const,
      label: t('dashboard.settings.tabs.notifications') || 'Notifiche',
      icon: Bell,
    },
    {
      id: 'security' as const,
      label: t('dashboard.settings.tabs.security') || 'Sicurezza',
      icon: Shield,
    },
    {
      id: 'billing' as const,
      label: t('dashboard.settings.tabs.billing') || 'Fatturazione',
      icon: CreditCard,
    },
    {
      id: 'preferences' as const,
      label: t('dashboard.settings.tabs.preferences') || 'Preferenze',
      icon: Globe,
    },
  ];

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-accent" />
          {t('dashboard.settings.title') || 'Impostazioni'}
        </h1>
        <p className="text-text-secondary">
          {t('dashboard.settings.description') || 'Gestisci le tue impostazioni e preferenze'}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border-subtle">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              {t('dashboard.settings.profile.title') || 'Profilo Utente'}
            </h2>
            <p className="text-text-secondary">
              {t('dashboard.settings.profile.description') || 'Gestisci le informazioni del tuo profilo'}
            </p>
            {/* TODO: Implementare form profilo */}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              {t('dashboard.settings.notifications.title') || 'Preferenze Notifiche'}
            </h2>
            <NotificationSettings />
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              {t('dashboard.settings.security.title') || 'Sicurezza'}
            </h2>
            <p className="text-text-secondary">
              {t('dashboard.settings.security.description') || 'Gestisci password e sicurezza account'}
            </p>
            {/* TODO: Implementare gestione password */}
          </div>
        )}

        {activeTab === 'billing' && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              {t('dashboard.settings.billing.title') || 'Fatturazione'}
            </h2>
            <Link
              href={buildLocalePath(locale, '/dashboard/billing')}
              className="text-accent hover:text-accent-hover underline"
            >
              {t('dashboard.settings.billing.goToBilling') || 'Vai alla pagina fatturazione →'}
            </Link>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              {t('dashboard.settings.preferences.title') || 'Preferenze'}
            </h2>
            <p className="text-text-secondary">
              {t('dashboard.settings.preferences.description') || 'Lingua, tema e altre preferenze'}
            </p>
            {/* TODO: Implementare preferenze */}
          </div>
        )}
      </div>
    </div>
  );
}

