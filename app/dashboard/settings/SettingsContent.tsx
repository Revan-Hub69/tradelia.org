'use client';

import { useState } from 'react';
import { Settings, User, Bell, Shield, CreditCard, Globe, Building2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { BusinessLogoSettings } from '@/components/settings/BusinessLogoSettings';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { PasswordForm } from '@/components/settings/PasswordForm';
import { PreferencesForm } from '@/components/settings/PreferencesForm';
import { useIsDesk } from '@/lib/hooks/useUserRole';
import Link from 'next/link';
// buildLocalePath removed - system always uses Italian

/**
 * Settings Content - Tab Impostazioni
 * Best Practice 2024-2025: Web App Design
 * Impostazioni utente
 * BASE: Profilo, notifiche, lingua
 * PRO: API keys, backup (futuro)
 */
export default function SettingsContent() {
  const { t, locale } = useTranslations();
  const isDesk = useIsDesk();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'billing' | 'preferences' | 'business'>('profile');

  const tabs = [
    {
      id: 'profile' as const,
      label: t('settings.tabs.profile') || 'Profilo',
      icon: User,
    },
    {
      id: 'notifications' as const,
      label: t('settings.tabs.notifications') || 'Notifiche',
      icon: Bell,
    },
    {
      id: 'security' as const,
      label: t('settings.tabs.security') || 'Sicurezza',
      icon: Shield,
    },
    {
      id: 'billing' as const,
      label: t('settings.tabs.billing') || 'Fatturazione',
      icon: CreditCard,
    },
    {
      id: 'preferences' as const,
      label: t('settings.tabs.preferences') || 'Preferenze',
      icon: Globe,
    },
    // Tab Business solo per Desk/Business
    ...(isDesk ? [{
      id: 'business' as const,
      label: t('settings.tabs.business') || 'Business',
      icon: Building2,
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-accent" />
            {t('settings.title') || 'Impostazioni'}
          </h1>
          <p className="text-text-secondary text-lg">
            {t('settings.description') || 'Gestisci le tue impostazioni e preferenze'}
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
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {t('settings.profile.title') || 'Profilo Utente'}
              </h2>
              <p className="text-text-secondary mb-6">
                {t('settings.profile.description') || 'Gestisci le informazioni del tuo profilo'}
              </p>
              <ProfileForm />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {t('settings.notifications.title') || 'Preferenze Notifiche'}
              </h2>
              <NotificationSettings />
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {t('settings.security.title') || 'Sicurezza'}
              </h2>
              <p className="text-text-secondary mb-6">
                {t('settings.security.description') || 'Gestisci password e sicurezza account'}
              </p>
              <PasswordForm />
            </div>
          )}

          {activeTab === 'billing' && (
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {t('settings.billing.title') || 'Fatturazione'}
              </h2>
              <p className="text-text-secondary mb-6">
                {t('settings.billing.description') || 'Monitora pagamenti e fatture. Il sistema crediti è stato rimosso.'}
              </p>
              <BillingSummary />
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {t('settings.preferences.title') || 'Preferenze'}
              </h2>
              <p className="text-text-secondary mb-6">
                {t('settings.preferences.description') || 'Lingua, tema e altre preferenze'}
              </p>
              <PreferencesForm />
            </div>
          )}

          {activeTab === 'business' && isDesk && (
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {t('settings.business.title') || 'Impostazioni Business'}
              </h2>
              <BusinessLogoSettings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
