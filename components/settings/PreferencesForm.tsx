'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Save, Loader2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useApi } from '@/lib/hooks/useApi';
import { toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { buildLocalePath } from '@/lib/i18n/paths';

interface PreferencesData {
  language: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
}

/**
 * Preferences Form Component
 * Form per modificare preferenze utente
 */
export function PreferencesForm() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PreferencesData>({
    language: locale || 'it', // Mantenuto per compatibilità ma non più modificabile
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    email_notifications: true,
    push_notifications: true,
  });

  // Fetch current preferences
  const { data: preferences, loading, retry } = useApi<PreferencesData>(
    '/api/settings',
    {
      cacheTime: 5 * 60 * 1000,
    }
  );

  useEffect(() => {
    if (preferences) {
      setFormData({
        language: preferences.language || locale || 'it',
        timezone: preferences.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        email_notifications: preferences.email_notifications !== false,
        push_notifications: preferences.push_notifications !== false,
      });
    }
  }, [preferences, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // language rimosso - gestito tramite URL
          timezone: formData.timezone,
          email_notifications: formData.email_notifications,
          push_notifications: formData.push_notifications,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore aggiornamento preferenze');
      }

      toast.success(t('dashboard.settings.preferences.success') || 'Preferenze aggiornate con successo');
      retry();

      // Lingua gestita tramite URL, non più tramite settings
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('dashboard.settings.preferences.error') || 'Errore durante l\'aggiornamento delle preferenze'
      );
    } finally {
      setSaving(false);
    }
  };

  // Timezones comuni
  const timezones = [
    { value: 'Europe/Rome', label: 'Europa/Roma (CET)' },
    { value: 'Europe/London', label: 'Europa/Londra (GMT)' },
    { value: 'America/New_York', label: 'America/New York (EST)' },
    { value: 'America/Los_Angeles', label: 'America/Los Angeles (PST)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="timezone">
          {t('dashboard.settings.preferences.timezone') || 'Fuso Orario'}
        </Label>
        <Select
          id="timezone"
          name="timezone"
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
          className="mt-1"
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </Select>
        <p className="text-xs text-text-tertiary mt-1">
          {t('dashboard.settings.preferences.timezoneHint') || 'Seleziona il tuo fuso orario per date e orari corretti'}
        </p>
      </div>

      <div className="space-y-4 pt-4 border-t border-border-subtle">
        <h3 className="text-sm font-semibold text-text-primary">
          {t('dashboard.settings.preferences.notifications') || 'Notifiche'}
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email_notifications" className="cursor-pointer">
              {t('dashboard.settings.preferences.emailNotifications') || 'Notifiche Email'}
            </Label>
            <p className="text-xs text-text-tertiary mt-1">
              {t('dashboard.settings.preferences.emailNotificationsHint') || 'Ricevi notifiche via email'}
            </p>
          </div>
          <input
            id="email_notifications"
            name="email_notifications"
            type="checkbox"
            checked={formData.email_notifications}
            onChange={(e) => setFormData({ ...formData, email_notifications: e.target.checked })}
            className="w-5 h-5 rounded border-border-subtle bg-bg-surface text-accent focus:ring-accent"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="push_notifications" className="cursor-pointer">
              {t('dashboard.settings.preferences.pushNotifications') || 'Notifiche Push'}
            </Label>
            <p className="text-xs text-text-tertiary mt-1">
              {t('dashboard.settings.preferences.pushNotificationsHint') || 'Ricevi notifiche push sul dispositivo'}
            </p>
          </div>
          <input
            id="push_notifications"
            name="push_notifications"
            type="checkbox"
            checked={formData.push_notifications}
            onChange={(e) => setFormData({ ...formData, push_notifications: e.target.checked })}
            className="w-5 h-5 rounded border-border-subtle bg-bg-surface text-accent focus:ring-accent"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
        <Button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('common.saving') || 'Salvataggio...'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{t('common.save') || 'Salva'}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

