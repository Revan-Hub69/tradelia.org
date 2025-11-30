'use client';

import { useEffect, useState, useTransition } from 'react';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from '@/lib/i18n/use-translations';
import { BookOpen, Bell, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useServiceWorker } from '@/hooks/useServiceWorker';

interface OnboardingGateProps {
  children: React.ReactNode;
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const { t } = useTranslations();
  const { requestPushPermission, isSupported: isPushSupported } = useServiceWorker();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({
    acceptsResearch: true,
    enablePush: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      const { data: role } = await supabase
        .from('user_roles')
        .select('role, onboarding_completed_at')
        .eq('user_id', session.user.id)
        .maybeSingle();

      const onboardingDone = Boolean(role?.onboarding_completed_at);
      setNeedsOnboarding(!onboardingDone);

      setLoading(false);
    }

    void loadProfile();
  }, []);

  const handleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.checked;
    setFormState((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const completeOnboarding = async (skip: boolean = false) => {
    setError(null);

    startTransition(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        setError(t('onboarding.errors.invalidSession'));
        return;
      }

      // Se push è abilitato, richiedi permesso e salva subscription
      if (!skip && formState.enablePush && isPushSupported) {
        try {
          const subscription = await requestPushPermission();
          if (subscription) {
            const subscriptionData = {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
                auth: arrayBufferToBase64(subscription.getKey('auth')!),
              },
            };

            const pushRes = await fetch('/api/notifications?action=subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscription: subscriptionData }),
            });

            if (!pushRes.ok) {
              console.warn('Errore salvataggio push subscription, continuo comunque');
            }
          }
        } catch (err) {
          console.warn('Errore abilitazione push durante onboarding:', err);
          // Non blocchiamo l'onboarding se le push falliscono
        }
      }

      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          country: null,
          role: 'trial',
          acceptsResearch: skip ? true : formState.acceptsResearch,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload.error ?? t('onboarding.errors.saveFailed'));
        return;
      }

      setNeedsOnboarding(false);
    });
  };

  const handleSubmit = () => {
    void completeOnboarding(false);
  };

  const handleSkip = () => {
    void completeOnboarding(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-text-tertiary text-sm uppercase tracking-[0.4em]">
          {t('onboarding.loading')}
        </div>
      </div>
    );
  }

  if (!needsOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full border border-border-subtle bg-bg-surface/90 rounded-3xl shadow-[0_40px_120px_rgba(8,10,18,0.65)] p-8 md:p-12 backdrop-blur"
      >
        {/* Header */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <p className="text-xs uppercase tracking-[0.4em] text-text-tertiary">
              {t('onboarding.badge')}
            </p>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            {t('onboarding.title')}
          </h2>
          <p className="text-base text-text-secondary leading-relaxed font-light">
            {t('onboarding.description')}
          </p>
        </div>

        {/* Form */}
        <form
          id="onboarding-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          noValidate
          className="space-y-6 mb-8"
        >
          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-bg-soft border border-border-subtle">
              <input
                id="accepts-research"
                type="checkbox"
                checked={formState.acceptsResearch}
                onChange={handleChange('acceptsResearch')}
                className="w-5 h-5 accent-accent mt-0.5 flex-shrink-0 min-h-[44px] min-w-[44px]"
                disabled={isPending}
                aria-describedby="accepts-research-label"
              />
              <label
                id="accepts-research-label"
                htmlFor="accepts-research"
                className="text-sm text-text-secondary leading-relaxed flex items-start gap-3 cursor-pointer flex-1"
              >
                <Bell className="w-5 h-5 mt-0.5 flex-shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <div className="font-semibold text-text-primary mb-1">
                    {t('onboarding.emailNotifications.title')}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {t('onboarding.emailNotifications.description')}
                  </div>
                </div>
              </label>
            </div>

            {/* Push Notifications */}
            {isPushSupported && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-bg-soft border border-border-subtle">
                <input
                  id="enable-push"
                  type="checkbox"
                  checked={formState.enablePush}
                  onChange={handleChange('enablePush')}
                  className="w-5 h-5 accent-accent mt-0.5 flex-shrink-0 min-h-[44px] min-w-[44px]"
                  disabled={isPending}
                  aria-describedby="enable-push-label"
                />
                <label
                  id="enable-push-label"
                  htmlFor="enable-push"
                  className="text-sm text-text-secondary leading-relaxed flex items-start gap-3 cursor-pointer flex-1"
                >
                  <Smartphone className="w-5 h-5 mt-0.5 flex-shrink-0 text-accent" aria-hidden="true" />
                  <div>
                    <div className="font-semibold text-text-primary mb-1">
                      {t('onboarding.pushNotifications.title')}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      {t('onboarding.pushNotifications.description')}
                    </div>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              aria-live="assertive"
              className="text-sm text-red-400 bg-red-400/10 border border-red-400/40 rounded-2xl px-4 py-3"
            >
              {error}
            </motion.div>
          )}

          {/* Submit button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isPending || Object.keys(validationErrors).length > 0}
              className={cn(
                'flex-1 rounded-2xl bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]',
                isPending && 'opacity-70'
              )}
              aria-label={t('onboarding.submit')}
            >
              {isPending ? (
                <>
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" aria-hidden="true" />
                  <span>{t('onboarding.saving')}</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  <span>{t('onboarding.submit')}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={isPending}
              className={cn(
                'flex-1 rounded-2xl border border-border-subtle bg-bg-soft hover:bg-bg-surface text-text-secondary font-semibold py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]',
                isPending && 'opacity-70'
              )}
              aria-label={t('onboarding.skip')}
            >
              {t('onboarding.skip')}
            </button>
          </div>
        </form>

        {/* Footer note */}
        <p className="text-xs text-text-tertiary text-center mt-6 leading-relaxed">
          {t('onboarding.footer')}
        </p>
      </motion.div>
    </div>
  );
}

// Helper per convertire ArrayBuffer a base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
