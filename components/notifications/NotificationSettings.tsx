'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Mail, MessageSquare, Phone } from 'lucide-react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

interface NotificationPreferences {
  id?: string;
  notification_method: 'email' | 'sms' | 'whatsapp';
  phone_number: string | null;
  enabled: boolean;
}

/**
 * Componente per gestire le preferenze notifiche e la registrazione push
 */
export function NotificationSettings() {
  const {
    isSupported,
    isRegistered,
    subscription,
    requestPushPermission,
    unsubscribePush,
    error: swError,
  } = useServiceWorker();

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Carica preferences al mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const res = await fetch('/api/notifications?type=preferences');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore caricamento preferences');
      }

      setPreferences(
        data.preferences || {
          notification_method: 'email',
          phone_number: null,
          enabled: true,
        }
      );
    } catch (err) {
      console.error('Errore caricamento preferences:', err);
      setError(err instanceof Error ? err.message : 'Errore caricamento');
    } finally {
      setLoading(false);
    }
  };

  const handleEnablePush = async () => {
    try {
      setError(null);
      const sub = await requestPushPermission();

      if (!sub) {
        setError('Impossibile abilitare le notifiche push');
        return;
      }

      // Salva subscription nel database
      const subscriptionData = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(sub.getKey('p256dh')!),
          auth: arrayBufferToBase64(sub.getKey('auth')!),
        },
      };

      const res = await fetch('/api/notifications?action=subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscriptionData }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Errore salvataggio subscription');
      }

      setSuccess('Notifiche push abilitate');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Errore abilitazione push:', err);
      setError(err instanceof Error ? err.message : 'Errore abilitazione push');
    }
  };

  const handleDisablePush = async () => {
    try {
      setError(null);

      if (subscription?.endpoint) {
        const res = await fetch('/api/notifications?action=unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Errore rimozione subscription');
        }
      }

      await unsubscribePush();
      setSuccess('Notifiche push disabilitate');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Errore disabilitazione push:', err);
      setError(err instanceof Error ? err.message : 'Errore disabilitazione push');
    }
  };

  const handleUpdatePreferences = async (updates: Partial<NotificationPreferences>) => {
    try {
      setSaving(true);
      setError(null);

      const newPreferences = { ...preferences, ...updates } as NotificationPreferences;

      const res = await fetch('/api/notifications?action=update-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Errore aggiornamento preferences');
      }

      const data = await res.json();
      setPreferences(data.preferences);
      setSuccess('Preferenze aggiornate');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Errore aggiornamento preferences:', err);
      setError(err instanceof Error ? err.message : 'Errore aggiornamento');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-dash-surface rounded-lg border border-dash-border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-dash-surface-elev rounded w-1/3" />
          <div className="h-4 bg-dash-surface-elev rounded w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-dash-surface rounded-lg border border-dash-border space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-dash-text mb-2">Notifiche</h2>
        <p className="text-sm text-dash-text-muted">
          Gestisci come ricevere aggiornamenti e comunicazioni importanti
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-sm text-green-400">
          {success}
        </div>
      )}

      {swError && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-400">
          {swError}
        </div>
      )}

      {/* Push Notifications */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {subscription ? (
              <Bell className="w-5 h-5 text-green-400" />
            ) : (
              <BellOff className="w-5 h-5 text-dash-text-muted" />
            )}
            <div>
              <h3 className="font-medium text-dash-text">Notifiche Push</h3>
              <p className="text-sm text-dash-text-muted">
                Ricevi notifiche anche quando l'app è chiusa
              </p>
            </div>
          </div>
          {subscription ? (
            <button
              onClick={handleDisablePush}
              disabled={saving}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-sm text-red-400 transition-colors disabled:opacity-50"
            >
              Disabilita
            </button>
          ) : (
            <button
              onClick={handleEnablePush}
              disabled={!isSupported || !isRegistered || saving}
              className="px-4 py-2 bg-dash-accent hover:bg-dash-accent-hover rounded text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Abilita
            </button>
          )}
        </div>

        {!isSupported && (
          <p className="text-xs text-dash-text-muted">
            Il tuo browser non supporta le notifiche push
          </p>
        )}
      </section>

      {/* Notification Method */}
      <section className="space-y-4">
        <h3 className="font-medium text-dash-text">Metodo di notifica preferito</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['email', 'sms', 'whatsapp'] as const).map((method) => {
            const icons = {
              email: Mail,
              sms: Phone,
              whatsapp: MessageSquare,
            };
            const labels = {
              email: 'Email',
              sms: 'SMS',
              whatsapp: 'WhatsApp',
            };
            const Icon = icons[method];
            const isSelected = preferences?.notification_method === method;

            return (
              <button
                key={method}
                onClick={() => handleUpdatePreferences({ notification_method: method })}
                disabled={saving}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-dash-accent bg-dash-accent/10'
                    : 'border-dash-border hover:border-dash-border-strong'
                } disabled:opacity-50`}
              >
                <Icon
                  className={`w-6 h-6 mb-2 ${
                    isSelected ? 'text-dash-accent' : 'text-dash-text-muted'
                  }`}
                />
                <div className="text-sm font-medium text-dash-text">{labels[method]}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Phone Number (se SMS/WhatsApp) */}
      {(preferences?.notification_method === 'sms' ||
        preferences?.notification_method === 'whatsapp') && (
        <section className="space-y-2">
          <label className="block text-sm font-medium text-dash-text">
            Numero di telefono
          </label>
          <input
            type="tel"
            value={preferences.phone_number || ''}
            onChange={(e) =>
              setPreferences({ ...preferences, phone_number: e.target.value })
            }
            onBlur={() =>
              handleUpdatePreferences({ phone_number: preferences.phone_number || null })
            }
            placeholder="+39 123 456 7890"
            className="w-full px-4 py-2 bg-dash-surface-elev border border-dash-border rounded text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-2 focus:ring-dash-accent"
          />
          <p className="text-xs text-dash-text-muted">
            Formato internazionale richiesto (es. +39...)
          </p>
        </section>
      )}

      {/* Enable/Disable Toggle */}
      <section className="flex items-center justify-between pt-4 border-t border-dash-border">
        <div>
          <h3 className="font-medium text-dash-text">Abilita notifiche</h3>
          <p className="text-sm text-dash-text-muted">
            Ricevi comunicazioni importanti e aggiornamenti
          </p>
        </div>
        <button
          onClick={() =>
            handleUpdatePreferences({ enabled: !preferences?.enabled })
          }
          disabled={saving}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            preferences?.enabled ? 'bg-dash-accent' : 'bg-dash-border-strong'
          } disabled:opacity-50`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              preferences?.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </section>
    </div>
  );
}

/**
 * Converte ArrayBuffer in base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

