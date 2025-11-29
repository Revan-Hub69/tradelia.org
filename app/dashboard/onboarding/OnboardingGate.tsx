'use client';

import { useEffect, useState, useTransition } from 'react';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';

interface OnboardingGateProps {
  children: React.ReactNode;
}

export function OnboardingGate({ children }: OnboardingGateProps) {
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
        <div className="text-text-tertiary text-sm uppercase tracking-[0.4em]">Verifica profilo…</div>
      </div>
    );
  }

  if (!needsOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-3xl mx-auto border border-border-subtle bg-bg-surface/90 rounded-3xl shadow-[0_40px_120px_rgba(8,10,18,0.65)] p-8 backdrop-blur">
      <div className="space-y-4 mb-6">
        <p className="text-xs uppercase tracking-[0.4em] text-text-tertiary">Profilo richiesto</p>
        <h2 className="text-3xl font-semibold text-text-primary tracking-tight">
          Completa il tuo profilo istituzionale
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          I dati sono necessari per attivare i moduli regolamentati e assegnare il piano corretto. Tutte le
          informazioni sono trattate secondo le policy MiFID II e GDPR.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Azienda</label>
          <input
            type="text"
            value={formState.company}
            onChange={handleChange('company')}
            className="rounded-2xl bg-bg-soft border border-border-subtle px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            placeholder="Nome azienda / Desk"
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Paese</label>
          <input
            type="text"
            value={formState.country}
            onChange={handleChange('country')}
            className="rounded-2xl bg-bg-soft border border-border-subtle px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            placeholder="IT, FR, DE..."
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Ruolo operativo</label>
          <select
            value={formState.role}
            onChange={handleChange('role')}
            className="rounded-2xl bg-bg-soft border border-border-subtle px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            disabled={isPending}
          >
            <option value="trial">Trial</option>
            <option value="pro">Professional</option>
            <option value="institutional">Institutional</option>
            <option value="desk">Desk / Research</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <input
            id="accepts-research"
            type="checkbox"
            checked={formState.acceptsResearch}
            onChange={handleChange('acceptsResearch')}
            className="w-5 h-5 accent-accent"
            disabled={isPending}
          />
          <label htmlFor="accepts-research" className="text-sm text-text-secondary">
            Voglio ricevere aggiornamenti di ricerca e notifiche operative.
          </label>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/40 rounded-2xl px-4 py-3 mb-4">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={isPending}
        onClick={handleSubmit}
        className={cn(
          'w-full rounded-2xl bg-accent hover:bg-accent-hover text-white font-semibold py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
          isPending && 'opacity-70'
        )}
      >
        {isPending ? 'Salvataggio in corso…' : 'Completa il profilo'}
      </button>
    </div>
  );
}
