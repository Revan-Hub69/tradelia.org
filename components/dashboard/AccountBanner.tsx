'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useTranslations } from '@/lib/i18n/use-translations';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Mail, X } from 'lucide-react';
import Link from 'next/link';

type BannerState = 'not-logged-in' | 'email-not-verified' | 'verified' | 'loading';

export function AccountBanner() {
  const { t } = useTranslations();
  const [bannerState, setBannerState] = useState<BannerState>('loading');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const checkUserStatus = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        // Utente non loggato
        setBannerState('not-logged-in');
        return;
      }

      setUserEmail(user.email || null);

      // Verifica se email è confermata
      // Supabase usa `email_confirmed_at` o `confirmed_at`
      const isEmailVerified = user.email_confirmed_at !== null || user.confirmed_at !== null;

      if (isEmailVerified) {
        setBannerState('verified');
      } else {
        setBannerState('email-not-verified');
      }
    } catch (err) {
      console.error('Error checking user status:', err);
      setBannerState('not-logged-in');
    }
  }, []);

  useEffect(() => {
    checkUserStatus();

    // Ascolta cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        checkUserStatus();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkUserStatus]);

  // Non mostrare se verificato o se dismissato
  if (bannerState === 'verified' || bannerState === 'loading' || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    // Salva in localStorage per non mostrare di nuovo in questa sessione
    localStorage.setItem('account-banner-dismissed', 'true');
  };

  // Controlla se è stato dismissato in precedenza (memoizzato)
  const wasDismissed = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('account-banner-dismissed') === 'true';
  }, []);

  useEffect(() => {
    if (wasDismissed) {
      setDismissed(true);
    }
  }, [wasDismissed]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div
          className={`
            relative rounded-xl border px-4 py-3 mb-6
            ${
              bannerState === 'not-logged-in'
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            }
          `}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {bannerState === 'not-logged-in' ? (
                <AlertCircle className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Mail className="w-5 h-5" aria-hidden="true" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {bannerState === 'not-logged-in' ? (
                <div>
                  <p className="text-sm font-medium mb-1">
                    {t('dashboard.banner.notLoggedIn.title')}
                  </p>
                  <p className="text-xs opacity-90 mb-2">
                    {t('dashboard.banner.notLoggedIn.description')}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href="/login"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent/20 hover:bg-accent/30 border border-accent/40 transition-colors"
                    >
                      {t('dashboard.banner.notLoggedIn.login')}
                    </Link>
                    <Link
                      href="/login"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors"
                    >
                      {t('dashboard.banner.notLoggedIn.signup')}
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium mb-1">
                    {t('dashboard.banner.emailNotVerified.title')}
                  </p>
                  <p className="text-xs opacity-90 mb-2">
                    {t('dashboard.banner.emailNotVerified.description').replace(
                      '{email}',
                      userEmail || ''
                    )}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href="/login?mode=verify-email"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 transition-colors"
                    >
                      {t('dashboard.banner.emailNotVerified.verify')}
                    </Link>
                    <button
                      onClick={async () => {
                        // Resend verification email
                        if (userEmail) {
                          const { error } = await supabase.auth.resend({
                            type: 'signup',
                            email: userEmail,
                          });
                          if (error) {
                            console.error('Error resending verification:', error);
                          } else {
                            // Mostra messaggio di successo temporaneo
                            alert(t('dashboard.banner.emailNotVerified.resendSuccess'));
                          }
                        }
                      }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-bg-soft hover:bg-bg-surface border border-border-subtle transition-colors"
                    >
                      {t('dashboard.banner.emailNotVerified.resend')}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity p-1"
              aria-label={t('dashboard.banner.dismiss')}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

