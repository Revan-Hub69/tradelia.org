'use client';

import { useEffect, useState, useTransition } from 'react';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from '@/lib/i18n/use-translations';
import { BookOpen, MapPin, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingGateProps {
  children: React.ReactNode;
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const { t } = useTranslations();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({
    country: '',
    acceptsResearch: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [validationErrors, setValidationErrors] = useState<{
    country?: string;
  }>({});

  // Validazione formato paese ISO 2 lettere
  const validateCountry = (country: string): boolean => {
    return /^[A-Z]{2}$/.test(country.toUpperCase());
  };

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

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('country')
        .eq('user_id', session.user.id)
        .maybeSingle();

      const { data: role } = await supabase
        .from('user_roles')
        .select('role, onboarding_completed_at')
        .eq('user_id', session.user.id)
        .maybeSingle();

      const onboardingDone = Boolean(role?.onboarding_completed_at);
      setNeedsOnboarding(!onboardingDone);

      if (profile?.country) {
        setFormState((prev) => ({
          ...prev,
          country: profile.country || '',
        }));
      }

      setLoading(false);
    }

    void loadProfile();
  }, []);

  const handleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let value: string | boolean = event.target.type === 'checkbox' 
      ? (event.target as HTMLInputElement).checked 
      : event.target.value;

    // Converti il paese in maiuscolo e limita a 2 caratteri
    if (field === 'country' && typeof value === 'string') {
      value = value.toUpperCase().slice(0, 2);
      // Rimuovi errori di validazione quando l'utente inizia a digitare
      if (validationErrors.country) {
        setValidationErrors((prev) => ({ ...prev, country: undefined }));
      }
    }

    setFormState((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    const errors: { country?: string } = {};

    // Paese è opzionale, ma se inserito deve essere valido
    if (formState.country.trim() && !validateCountry(formState.country)) {
      errors.country = t('onboarding.errors.countryInvalid');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const completeOnboarding = async (skip: boolean = false) => {
    setError(null);
    setValidationErrors({});

    // Se non è skip, valida il form
    if (!skip && !validateForm()) {
      return;
    }

    startTransition(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        setError(t('onboarding.errors.invalidSession'));
        return;
      }

      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          country: skip ? null : (formState.country.trim() ? formState.country.toUpperCase().trim() : null),
          role: 'trial',
          acceptsResearch: skip ? true : formState.acceptsResearch, // Default true se skip
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
          <div className="flex flex-col gap-2">
            <label
              htmlFor="onboarding-country"
              className="text-xs uppercase tracking-[0.3em] text-text-tertiary flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" aria-hidden="true" />
              {t('onboarding.country')}
            </label>
            <input
              id="onboarding-country"
              type="text"
              value={formState.country}
              onChange={handleChange('country')}
              className={cn(
                'rounded-2xl bg-bg-soft border px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all min-h-[44px] uppercase',
                validationErrors.country
                  ? 'border-red-400/40 focus:border-red-400'
                  : 'border-border-subtle focus:border-accent'
              )}
              placeholder={t('onboarding.countryPlaceholder')}
              disabled={isPending}
              autoComplete="country-code"
              aria-required="false"
              aria-invalid={validationErrors.country ? 'true' : 'false'}
              aria-describedby="onboarding-country-hint onboarding-country-error"
              maxLength={2}
              pattern="[A-Z]{2}"
            />
            <p id="onboarding-country-hint" className="text-xs text-text-tertiary mt-1">
              {t('onboarding.countryHint')}
            </p>
            {validationErrors.country && (
              <p
                id="onboarding-country-error"
                role="alert"
                className="text-xs text-red-400 mt-1"
              >
                {validationErrors.country}
              </p>
            )}
          </div>

          <div className="flex items-start gap-3 pt-2">
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
              className="text-sm text-text-secondary leading-relaxed flex items-start gap-2 cursor-pointer"
            >
              <Bell className="w-4 h-4 mt-0.5 flex-shrink-0 text-text-tertiary" aria-hidden="true" />
              <span>{t('onboarding.notifications')}</span>
            </label>
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
