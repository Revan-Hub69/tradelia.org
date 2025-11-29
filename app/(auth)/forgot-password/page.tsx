'use client';

import { useState, useTransition } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email) {
      setError(t('auth.forgotPassword.errors.emailRequired'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth.forgotPassword.errors.invalidEmail'));
      return;
    }

    startTransition(async () => {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setInfo(t('auth.forgotPassword.success'));
    });
  };

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
                <Mail className="w-6 h-6 text-accent" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                {t('auth.forgotPassword.title')}
              </h1>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t('auth.forgotPassword.description')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                {t('auth.form.email.label')}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="rounded-xl bg-bg-soft border border-border-subtle px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all min-h-[44px]"
                placeholder={t('auth.form.email.placeholder')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                disabled={isPending}
                required
                aria-required="true"
              />
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
              disabled={isPending}
              className="w-full rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 px-6 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base"
              aria-busy={isPending}
            >
              {isPending ? t('auth.form.submitting') : t('auth.forgotPassword.submit')}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              {t('auth.forgotPassword.backToLogin')}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

