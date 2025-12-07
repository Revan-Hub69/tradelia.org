'use client';

import { useEffect, useState, useCallback } from 'react';
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
      // Log error but don't expose to user
      if (process.env.NODE_ENV === 'development') {
        console.error('Error checking user status:', err);
      }
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

  // Controlla se è stato dismissato in precedenza (deve essere prima di qualsiasi return)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const wasDismissed = localStorage.getItem('account-banner-dismissed') === 'true';
        if (wasDismissed) {
          setDismissed(true);
        }
      } catch (error) {
        // localStorage potrebbe non essere disponibile (es. modalità privata)
        // Ignora silenziosamente
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    // Salva in localStorage per non mostrare di nuovo in questa sessione
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('account-banner-dismissed', 'true');
      } catch (error) {
        // localStorage potrebbe non essere disponibile (es. modalità privata)
        // Ignora silenziosamente
      }
    }
  };

  // Non mostrare se verificato o se dismissato
  if (bannerState === 'verified' || bannerState === 'loading' || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full mb-6"
        style={{ minHeight: '80px' }} // Fissa altezza per evitare CLS
      >
        <div
          className={`
            relative rounded-2xl border backdrop-blur-sm shadow-xl overflow-hidden
            ${
              bannerState === 'not-logged-in'
                ? 'bg-gradient-to-br from-accent/20 via-accent/10 to-accent/5 border-accent/30 shadow-accent/10'
                : 'bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-amber-500/5 border-amber-500/30 shadow-amber-500/10'
            }
            ${dismissed ? 'hidden' : ''}
          `}
          role="alert"
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
          
          <div className="relative px-4 py-4 md:px-6 md:py-5">
            <div className="flex items-start gap-3 md:gap-4">
              {/* Icon container */}
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                ${
                  bannerState === 'not-logged-in'
                    ? 'bg-accent/20 border border-accent/30'
                    : 'bg-amber-500/20 border border-amber-500/30'
                }
              `}>
                {bannerState === 'not-logged-in' ? (
                  <AlertCircle className={`w-6 h-6 ${bannerState === 'not-logged-in' ? 'text-accent' : 'text-amber-300'}`} aria-hidden="true" />
                ) : (
                  <Mail className="w-6 h-6 text-amber-300" aria-hidden="true" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {bannerState === 'not-logged-in' ? (
                  <div>
                    <h3 className="text-base font-semibold text-text-primary mb-1.5">
                      {t('dashboard.banner.notLoggedIn.title')}
                    </h3>
                    <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                      {t('dashboard.banner.notLoggedIn.description')}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-bg-soft hover:bg-bg-surface border border-border-subtle text-text-primary font-medium text-sm transition-all duration-200 hover:border-accent/40 hover:shadow-md"
                      >
                        {t('dashboard.banner.notLoggedIn.login')}
                      </Link>
                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        {t('dashboard.banner.notLoggedIn.signup')}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-base font-semibold text-text-primary mb-1.5">
                      {t('dashboard.banner.emailNotVerified.title')}
                    </h3>
                    <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                      {t('dashboard.banner.emailNotVerified.description').replace(
                        '{email}',
                        userEmail || ''
                      )}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        href="/login?mode=verify-email"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-medium text-sm transition-all duration-200 hover:shadow-md"
                      >
                        {t('dashboard.banner.emailNotVerified.verify')}
                      </Link>
                      <button
                        onClick={async () => {
                          if (userEmail) {
                            const { error } = await supabase.auth.resend({
                              type: 'signup',
                              email: userEmail,
                            });
                            if (error) {
                              // Log error but don't expose to user
                              if (process.env.NODE_ENV === 'development') {
                                console.error('Error resending verification:', error);
                              }
                            } else {
                              const { toast } = await import('@/components/ui/Toast');
                              toast.success(t('dashboard.banner.emailNotVerified.resendSuccess'));
                            }
                          }
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-bg-soft hover:bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary font-medium text-sm transition-all duration-200 hover:border-border-default"
                      >
                        {t('dashboard.banner.emailNotVerified.resend')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-all duration-200"
                aria-label={t('dashboard.banner.dismiss')}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

