'use client';

import { useState, useTransition, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslations();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // Verifica se c'è una sessione valida per il reset password
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // Se c'è un token_hash nella URL, Supabase gestirà la sessione automaticamente
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      if (tokenHash && type === 'recovery') {
        // Verifica il token
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });
        
        if (verifyError) {
          setError(t('auth.resetPassword.errors.invalidToken'));
          setIsValidSession(false);
          return;
        }
        
        setIsValidSession(true);
      } else if (session) {
        setIsValidSession(true);
      } else {
        setError(t('auth.resetPassword.errors.noSession'));
        setIsValidSession(false);
      }
    };

    checkSession();
  }, [searchParams, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!password || !confirmPassword) {
      setError(t('auth.resetPassword.errors.fillAll'));
      return;
    }

    if (password.length < 8) {
      setError(t('auth.resetPassword.errors.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.resetPassword.errors.passwordsDontMatch'));
      return;
    }

    startTransition(async () => {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setInfo(t('auth.resetPassword.success'));
      
      // Reindirizza al login dopo 2 secondi
      setTimeout(() => {
        router.push('/login?message=password_reset_success');
      }, 2000);
    });
  };

  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-text-secondary">{t('auth.resetPassword.loading')}</div>
      </div>
    );
  }

  if (isValidSession === false) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-bg-surface/80 backdrop-blur-sm border border-border-subtle rounded-3xl shadow-2xl shadow-black/30 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {t('auth.resetPassword.errors.invalidToken')}
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            {t('auth.resetPassword.errors.tokenExpired')}
          </p>
          <Link
            href="/forgot-password"
            className="inline-block rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-6 transition-all"
          >
            {t('auth.resetPassword.requestNewLink')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Animated background gradients */}
      <motion.div
        className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-accent/20 via-accent/5 to-transparent rounded-full blur-[90px]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-bg-surface/80 backdrop-blur-sm border border-border-subtle rounded-3xl shadow-2xl shadow-black/30 p-8"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-accent border border-border-accent flex items-center justify-center">
                <Lock className="w-6 h-6 text-accent" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                {t('auth.resetPassword.title')}
              </h1>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t('auth.resetPassword.description')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                {t('auth.resetPassword.newPassword')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="rounded-xl bg-bg-soft border border-border-subtle px-4 py-3 pr-12 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all w-full min-h-[44px]"
                  placeholder={t('auth.form.password.placeholder')}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  disabled={isPending}
                  required
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={showPassword ? t('auth.form.password.hide') : t('auth.form.password.show')}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirmPassword"
                className="text-xs font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                {t('auth.resetPassword.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="rounded-xl bg-bg-soft border border-border-subtle px-4 py-3 pr-12 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all w-full min-h-[44px]"
                  placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  disabled={isPending}
                  required
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={showConfirmPassword ? t('auth.form.password.hide') : t('auth.form.password.show')}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  role="alert"
                  className="flex items-start gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-xl px-4 py-3"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info message */}
            <AnimatePresence>
              {info && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  role="alert"
                  className="flex items-start gap-2 text-sm text-accent bg-accent/10 border border-accent/30 rounded-xl px-4 py-3"
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{info}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isPending || !password || !confirmPassword}
              className="w-full rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 px-6 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base"
              aria-busy={isPending}
            >
              {isPending ? t('auth.form.submitting') : t('auth.resetPassword.submit')}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

