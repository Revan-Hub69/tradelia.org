'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Eye, EyeOff, CheckCircle2, XCircle, AlertCircle, Lock, Mail, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AuthMode = 'login' | 'signup' | 'verify-email';

interface FormState {
  email: string;
  password: string;
  name: string;
  otp: string;
}

const INITIAL_STATE: FormState = {
  email: '',
  password: '',
  name: '',
  otp: '',
};

// Password strength calculation
function calculatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
} {
  if (!password) {
    return { score: 0, feedback: [], strength: 'weak' };
  }

  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Almeno 8 caratteri');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Una lettera minuscola');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Una lettera maiuscola');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Un numero');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Un carattere speciale');
  }

  // Length bonus
  if (password.length >= 12) {
    score += 1;
  }

  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (score >= 5) strength = 'strong';
  else if (score >= 4) strength = 'good';
  else if (score >= 3) strength = 'fair';

  return { score, feedback, strength };
}

// Check password breach
async function checkPasswordBreach(password: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/check-password-breach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    // L'API ritorna 'pwned', non 'isBreached'
    return data.pwned === true;
  } catch {
    return false;
  }
}

export function AuthForm() {
  const router = useRouter();
  const { t } = useTranslations();
  const [mode, setMode] = useState<AuthMode>('login');
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null); // Email in attesa di conferma

  // Gestisci errori dalla URL (es. callback conferma email fallita)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error');
      if (errorParam === 'email_verification_failed') {
        setError(t('auth.form.errors.emailVerificationFailed'));
        // Rimuovi il parametro dalla URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [t]);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<ReturnType<typeof calculatePasswordStrength>>({
    score: 0,
    feedback: [],
    strength: 'weak',
  });
  const [isPasswordBreached, setIsPasswordBreached] = useState<boolean | null>(null);
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (mode === 'login' && emailInputRef.current) {
      emailInputRef.current.focus();
    } else if (mode === 'signup' && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [mode]);

  // Calculate password strength in real-time
  useEffect(() => {
    if (mode === 'signup' && form.password) {
      const strength = calculatePasswordStrength(form.password);
      setPasswordStrength(strength);

      // Check breach only for passwords with minimum strength
      if (strength.score >= 3 && form.password.length >= 8) {
        setIsCheckingBreach(true);
        checkPasswordBreach(form.password).then((breached) => {
          setIsPasswordBreached(breached);
          setIsCheckingBreach(false);
        });
      } else {
        setIsPasswordBreached(null);
      }
    } else {
      setPasswordStrength({ score: 0, feedback: [], strength: 'weak' });
      setIsPasswordBreached(null);
    }
  }, [form.password, mode]);

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    // Validation - diversa per ogni modalità
    // Per verify-email, la validazione viene gestita dentro startTransition
    if (mode !== 'verify-email') {
      if (mode === 'login') {
        if (!form.email || !form.password) {
          setError(t('auth.form.errors.fillAll'));
          return;
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
          setError(t('auth.form.errors.invalidEmail'));
          return;
        }
      } else if (mode === 'signup') {
        if (!form.email || !form.password || !form.name.trim()) {
          setError(t('auth.form.errors.fillAll'));
          return;
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
          setError(t('auth.form.errors.invalidEmail'));
          return;
        }
        // Password strength validation for signup
        if (passwordStrength.strength === 'weak') {
          setError(t('auth.form.errors.weakPassword'));
          return;
        }
        // Password breach check for signup
        if (isPasswordBreached) {
          setError(t('auth.form.errors.breachedPassword'));
          return;
        }
      }
    }

    startTransition(async () => {
      if (mode === 'verify-email') {
        // Verifica codice OTP
        if (!form.otp || form.otp.length < 6) {
          setError(t('auth.form.errors.invalidOtp'));
          return;
        }

        if (!pendingEmail) {
          setError(t('auth.form.errors.emailRequired'));
          return;
        }

        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: pendingEmail,
          token: form.otp,
          type: 'signup',
        });

        if (verifyError) {
          setError(verifyError.message);
          return;
        }

        // Verifica riuscita - reindirizza alla dashboard
        // Forza un reload completo per assicurarsi che la sessione sia disponibile
        window.location.href = '/dashboard';
        return;
      }

      if (mode === 'login') {
        const { error: signInError, data } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        // Verifica che la sessione sia disponibile prima di reindirizzare
        if (data?.session) {
          // Aspetta un momento per assicurarsi che i cookie siano salvati
          await new Promise((resolve) => setTimeout(resolve, 100));
          
          // Verifica nuovamente la sessione
          const { data: { session: verifiedSession } } = await supabase.auth.getSession();
          
          if (verifiedSession) {
            // Forza un reload completo per assicurarsi che la sessione sia disponibile lato server
            window.location.href = '/dashboard';
            return;
          }
        }
        
        // Se non c'è sessione, mostra errore
        setError('Errore durante il login. Riprova.');
        return;
      }

      const { error: signUpError, data } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name.trim(),
          },
          // Redirect alla callback route che gestisce la conferma email
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data?.user?.identities && data.user.identities.length === 0) {
        setError(t('auth.form.errors.emailExists'));
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

      // Mostra il form di verifica email invece di tornare al login
      setPendingEmail(form.email);
      setInfo(null);
      setMode('verify-email');
      setForm((prev) => ({ ...prev, password: '', name: '', otp: '' }));
    });
  };

  const strengthColors: Record<string, string> = {
    weak: 'bg-red-500',
    fair: 'bg-yellow-500',
    good: 'bg-blue-500',
    strong: 'bg-green-500',
  };

  const strengthLabels: Record<string, string> = {
    weak: t('auth.form.passwordStrength.weak'),
    fair: t('auth.form.passwordStrength.fair'),
    good: t('auth.form.passwordStrength.good'),
    strong: t('auth.form.passwordStrength.strong'),
  };

  return (
    <div className="w-full max-w-md mx-auto">
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
              {t('auth.title')}
            </h1>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t('auth.description')}
          </p>
        </div>

        {/* Mode Toggle - solo se non in verify-email */}
        {mode !== 'verify-email' && (
          <div className="flex items-center gap-2 mb-8 p-1 bg-bg-soft rounded-2xl border border-border-subtle">
            <button
              type="button"
              className={cn(
                'flex-1 text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 min-h-[44px]',
                mode === 'login'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-text-secondary hover:text-text-primary'
              )}
              onClick={() => {
                setMode('login');
                setError(null);
                setForm(INITIAL_STATE);
                setPendingEmail(null);
              }}
              disabled={isPending}
              aria-pressed={mode === 'login'}
              aria-label={t('auth.mode.login')}
            >
              {t('auth.mode.login')}
            </button>
            <button
              type="button"
              className={cn(
                'flex-1 text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 min-h-[44px]',
                mode === 'signup'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-text-secondary hover:text-text-primary'
              )}
              onClick={() => {
                setMode('signup');
                setError(null);
                setForm(INITIAL_STATE);
                setPendingEmail(null);
              }}
              disabled={isPending}
              aria-pressed={mode === 'signup'}
              aria-label={t('auth.mode.signup')}
            >
              {t('auth.mode.signup')}
            </button>
          </div>
        )}

        {/* Info per verify-email */}
        {mode === 'verify-email' && (
          <div className="mb-8 p-4 bg-accent/10 border border-accent/30 rounded-xl">
            <p className="text-sm text-text-primary font-medium mb-2">
              {t('auth.form.otp.title')}
            </p>
            <p className="text-xs text-text-secondary">
              {t('auth.form.otp.instructions').replace('{email}', pendingEmail || form.email)}
            </p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {/* Name field (signup only) */}
          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2"
              >
                <label
                  htmlFor="name"
                  className="text-xs font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5" aria-hidden="true" />
                  {t('auth.form.name.label')}
                </label>
                <input
                  id="name"
                  ref={nameInputRef}
                  type="text"
                  autoComplete="name"
                  className="rounded-xl bg-bg-soft border border-border-subtle px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all min-h-[44px]"
                  placeholder={t('auth.form.name.placeholder')}
                  value={form.name}
                  onChange={handleChange('name')}
                  disabled={isPending}
                  aria-required="true"
                  aria-invalid={mode === 'signup' && !form.name.trim() ? 'true' : 'false'}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email field */}
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
              ref={emailInputRef}
              type="email"
              autoComplete="email"
              className="rounded-xl bg-bg-soft border border-border-subtle px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all min-h-[44px]"
              placeholder={t('auth.form.email.placeholder')}
              value={form.email}
              onChange={handleChange('email')}
              disabled={isPending}
              required
              aria-required="true"
              aria-invalid={form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'true' : 'false'}
            />
          </div>

          {/* OTP field (verify-email mode) */}
          <AnimatePresence>
            {mode === 'verify-email' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2"
              >
                <label
                  htmlFor="otp"
                  className="text-xs font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  {t('auth.form.otp.label')}
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="one-time-code"
                  className="rounded-xl bg-bg-soft border border-border-subtle px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all min-h-[44px] text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  value={form.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setForm((prev) => ({ ...prev, otp: value }));
                    setError(null);
                  }}
                  disabled={isPending}
                  required
                  aria-required="true"
                  aria-label={t('auth.form.otp.label')}
                />
                <p className="text-xs text-text-secondary text-center">
                  {t('auth.form.otp.description').replace('{email}', pendingEmail || form.email)}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    if (!pendingEmail) return;
                    setError(null);
                    const { error: resendError } = await supabase.auth.resend({
                      type: 'signup',
                      email: pendingEmail,
                    });
                    if (resendError) {
                      setError(resendError.message);
                    } else {
                      setInfo(t('auth.form.otp.resendSuccess'));
                    }
                  }}
                  className="text-xs text-accent hover:text-accent-hover underline underline-offset-4 transition-colors text-center"
                  disabled={isPending}
                >
                  {t('auth.form.otp.resend')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password field */}
          {mode !== 'verify-email' && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                {t('auth.form.password.label')}
              </label>
            <div className="relative">
              <input
                id="password"
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className="rounded-xl bg-bg-soft border border-border-subtle px-4 py-3 pr-12 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all w-full min-h-[44px]"
                placeholder={t('auth.form.password.placeholder')}
                value={form.password}
                onChange={handleChange('password')}
                disabled={isPending}
                required
                aria-required="true"
                aria-invalid={mode === 'signup' && passwordStrength.strength === 'weak' ? 'true' : 'false'}
                aria-describedby={
                  mode === 'signup'
                    ? 'password-strength password-feedback password-breach'
                    : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={showPassword ? t('auth.form.password.hide') : t('auth.form.password.show')}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Eye className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Password strength indicator (signup only) */}
            <AnimatePresence>
              {mode === 'signup' && form.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                  id="password-strength"
                  role="status"
                  aria-live="polite"
                >
                  {/* Strength bar */}
                  <div className="flex gap-1 h-1.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex-1 rounded-full transition-all',
                          i < passwordStrength.score
                            ? strengthColors[passwordStrength.strength]
                            : 'bg-bg-soft'
                        )}
                      />
                    ))}
                  </div>

                  {/* Strength label */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-text-tertiary">{t('auth.form.passwordStrength.label')}:</span>
                    <span
                      className={cn(
                        'font-semibold',
                        passwordStrength.strength === 'weak' && 'text-red-400',
                        passwordStrength.strength === 'fair' && 'text-yellow-400',
                        passwordStrength.strength === 'good' && 'text-blue-400',
                        passwordStrength.strength === 'strong' && 'text-green-400'
                      )}
                    >
                      {strengthLabels[passwordStrength.strength]}
                    </span>
                    {isCheckingBreach && (
                      <span className="text-text-tertiary text-xs">({t('auth.form.passwordStrength.checking')})</span>
                    )}
                  </div>

                  {/* Feedback */}
                  {passwordStrength.feedback.length > 0 && (
                    <ul
                      id="password-feedback"
                      className="text-xs text-text-secondary space-y-1"
                      role="list"
                    >
                      {passwordStrength.feedback.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <XCircle className="w-3 h-3 text-text-tertiary flex-shrink-0" aria-hidden="true" />
                          {t('auth.form.passwordStrength.needs')} {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Breach warning */}
                  <AnimatePresence>
                    {isPasswordBreached !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        id="password-breach"
                        role="alert"
                        className={cn(
                          'flex items-center gap-2 text-xs p-2 rounded-lg',
                          isPasswordBreached
                            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                            : 'bg-green-500/10 border border-green-500/30 text-green-400'
                        )}
                      >
                        {isPasswordBreached ? (
                          <>
                            <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            <span>{t('auth.form.passwordStrength.breached')}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            <span>{t('auth.form.passwordStrength.safe')}</span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          )}

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
            disabled={
              isPending ||
              (mode === 'signup' && passwordStrength.strength === 'weak') ||
              (mode === 'verify-email' && form.otp.length < 6)
            }
            className="w-full rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 px-6 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base"
            aria-busy={isPending}
          >
            {isPending
              ? t('auth.form.submitting')
              : mode === 'verify-email'
                ? t('auth.form.submit.verify')
                : mode === 'login'
                  ? t('auth.form.submit.login')
                  : t('auth.form.submit.signup')}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 space-y-3 text-xs text-text-tertiary">
          {mode === 'login' && (
            <div className="text-center">
              <a
                href="/forgot-password"
                className="text-accent hover:text-accent-hover underline underline-offset-4 transition-colors"
              >
                {t('auth.form.forgotPassword')}
              </a>
            </div>
          )}
          <p className="leading-relaxed text-center">
            {t('auth.form.footer.text')}{' '}
            <a
              href="/privacy"
              className="text-accent hover:text-accent-hover underline underline-offset-4 transition-colors"
            >
              {t('auth.form.footer.privacy')}
            </a>{' '}
            {t('auth.form.footer.and')}{' '}
            <a
              href="/terms"
              className="text-accent hover:text-accent-hover underline underline-offset-4 transition-colors"
            >
              {t('auth.form.footer.terms')}
            </a>
            .
          </p>
          <div className="text-center">
            <a
              href="/"
              className="text-text-secondary hover:text-text-primary underline underline-offset-4 transition-colors"
            >
              {t('auth.form.footer.backHome')}
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
