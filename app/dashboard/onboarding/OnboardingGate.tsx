'use client';

import { useEffect, useState, useTransition } from 'react';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from '@/lib/i18n/use-translations';
import { BookOpen, User, MapPin, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingGateProps {
  children: React.ReactNode;
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const { t } = useTranslations();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({
    company: '',
    country: '',
    role: 'trial',
    acceptsResearch: true,
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

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company, country')
        .eq('user_id', session.user.id)
        .maybeSingle();

      const { data: role } = await supabase
        .from('user_roles')
        .select('role, onboarding_completed_at')
        .eq('user_id', session.user.id)
        .maybeSingle();

      const onboardingDone = Boolean(role?.onboarding_completed_at);
      setNeedsOnboarding(!onboardingDone);

      if (profile) {
        setFormState((prev) => ({
          ...prev,
          company: profile.company || '',
          country: profile.country || '',
          role: role?.role || 'trial',
        }));
      }

      setLoading(false);
    }

    void loadProfile();
  }, []);

  const handleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        setError('Sessione non valida.');
        return;
      }

      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          ...formState,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload.error ?? 'Impossibile completare l’onboarding');
        return;
      }

      setNeedsOnboarding(false);
    });
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
        <div className="space-y-6 mb-8">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.3em] text-text-tertiary flex items-center gap-2">
              <User className="w-4 h-4" />
              {t('onboarding.affiliation')}
            </label>
            <input
              type="text"
              value={formState.company}
              onChange={handleChange('company')}
              className="rounded-2xl bg-bg-soft border border-border-subtle px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all"
              placeholder={t('onboarding.affiliationPlaceholder')}
              disabled={isPending}
            />
            <p className="text-xs text-text-tertiary mt-1">
              {t('onboarding.affiliationHint')}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.3em] text-text-tertiary flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {t('onboarding.country')}
            </label>
            <input
              type="text"
              value={formState.country}
              onChange={handleChange('country')}
              className="rounded-2xl bg-bg-soft border border-border-subtle px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all"
              placeholder={t('onboarding.countryPlaceholder')}
              disabled={isPending}
              maxLength={2}
            />
            <p className="text-xs text-text-tertiary mt-1">
              {t('onboarding.countryHint')}
            </p>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <input
              id="accepts-research"
              type="checkbox"
              checked={formState.acceptsResearch}
              onChange={handleChange('acceptsResearch')}
              className="w-5 h-5 accent-accent mt-0.5 flex-shrink-0"
              disabled={isPending}
            />
            <label htmlFor="accepts-research" className="text-sm text-text-secondary leading-relaxed flex items-start gap-2">
              <Bell className="w-4 h-4 mt-0.5 flex-shrink-0 text-text-tertiary" />
              <span>{t('onboarding.notifications')}</span>
            </label>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400 bg-red-400/10 border border-red-400/40 rounded-2xl px-4 py-3 mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Submit button */}
        <button
          type="button"
          disabled={isPending || !formState.company.trim() || !formState.country.trim()}
          onClick={handleSubmit}
          className={cn(
            'w-full rounded-2xl bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
            isPending && 'opacity-70',
            !isPending && !formState.company.trim() && !formState.country.trim() && 'opacity-50'
          )}
        >
          {isPending ? (
            <>
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              {t('onboarding.saving')}
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              {t('onboarding.submit')}
            </>
          )}
        </button>

        {/* Footer note */}
        <p className="text-xs text-text-tertiary text-center mt-6 leading-relaxed">
          {t('onboarding.footer')}
        </p>
      </motion.div>
    </div>
  );
}
