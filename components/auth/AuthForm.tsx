'use client';

import { useState, useTransition } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

type AuthMode = 'login' | 'signup';

interface FormState {
  email: string;
  password: string;
  name: string;
}

const INITIAL_STATE: FormState = {
  email: '',
  password: '',
  name: '',
};

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!form.email || !form.password || (mode === 'signup' && !form.name.trim())) {
      setError('Compila tutti i campi.');
      return;
    }

    startTransition(async () => {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        router.replace('/dashboard');
        router.refresh();
        return;
      }

      const { error: signUpError, data } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name.trim(),
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data?.user?.identities && data.user.identities.length === 0) {
        setError('Esiste già un account con questa email. Prova ad accedere.');
        return;
      }

      if (data?.user?.id) {
        try {
          await fetch('/api/auth/bootstrap', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: data.user.id,
              email: form.email,
              name: form.name,
            }),
          });
        } catch (bootstrapError) {
          console.error('Errore bootstrap utente', bootstrapError);
        }
      }

      setInfo('Registrazione completata. Controlla la tua casella email per confermare l’account.');
      setForm(INITIAL_STATE);
      setMode('login');
    });
  };

  return (
    <div className="bg-bg-surface/80 border border-border-subtle rounded-3xl shadow-2xl shadow-black/30 p-8 backdrop-blur">
      <div className="flex flex-col gap-3 mb-8">
        <p className="text-xs uppercase tracking-[0.4em] text-text-tertiary">Accesso riservato</p>
        <h1 className="text-3xl font-semibold text-text-primary tracking-tight">
          Tradelia Secure Console
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Autenticati con le tue credenziali istituzionali per accedere alla dashboard, gestire report,
          richieste e percorsi educativi. Tutte le sessioni sono protette da policy Supabase e audit log.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          className={cn(
            'text-sm font-semibold uppercase tracking-[0.3em] transition-colors',
            mode === 'login' ? 'text-accent' : 'text-text-tertiary'
          )}
          onClick={() => setMode('login')}
          disabled={isPending}
        >
          Login
        </button>
        <span className="text-text-tertiary">·</span>
        <button
          type="button"
          className={cn(
            'text-sm font-semibold uppercase tracking-[0.3em] transition-colors',
            mode === 'signup' ? 'text-accent' : 'text-text-tertiary'
          )}
          onClick={() => setMode('signup')}
          disabled={isPending}
        >
          Sign up
        </button>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.3em] text-text-tertiary">
              Nome & Cognome
            </label>
            <input
              type="text"
              autoComplete="name"
              className="rounded-2xl bg-bg-soft border border-border-subtle px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              placeholder="Nome completo"
              value={form.name}
              onChange={handleChange('name')}
              disabled={isPending}
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-[0.3em] text-text-tertiary">
            Email istituzionale
          </label>
          <input
            type="email"
            autoComplete="email"
            className="rounded-2xl bg-bg-soft border border-border-subtle px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            placeholder="nome@azienda.com"
            value={form.email}
            onChange={handleChange('email')}
            disabled={isPending}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-[0.3em] text-text-tertiary">
            Password
          </label>
          <input
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className="rounded-2xl bg-bg-soft border border-border-subtle px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange('password')}
            disabled={isPending}
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/40 rounded-2xl px-4 py-3">
            {error}
          </p>
        )}

        {info && (
          <p className="text-sm text-accent bg-accent/10 border border-accent/40 rounded-2xl px-4 py-3">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-accent hover:bg-accent-hover text-white font-semibold py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Attendere…' : mode === 'login' ? 'Accedi' : 'Crea account'}
        </button>
      </form>

      <p className="mt-6 text-xs text-text-tertiary leading-relaxed">
        Tutte le richieste sono monitorate e auditate. Proseguendo confermi di aver letto e accettato la{' '}
        <a href="/privacy" className="text-accent hover:text-accent-hover underline underline-offset-4">
          Privacy Policy
        </a>{' '}
        e i{' '}
        <a href="/terms" className="text-accent hover:text-accent-hover underline underline-offset-4">
          Termini & Condizioni
        </a>
        .
      </p>
    </div>
  );
}
