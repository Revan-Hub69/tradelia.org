'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { enableAnalytics, disableAnalytics, isAnalyticsEnabled } from '@/lib/analytics/tracker';
import { useTranslations } from '@/lib/i18n/use-translations';

/**
 * Analytics Consent Banner
 * GDPR-compliant opt-in banner for analytics
 * 
 * Riferimento: GDPR, ePrivacy Directive
 */
export function AnalyticsConsent() {
  const { t } = useTranslations();
  const [showBanner, setShowBanner] = useState(false);
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if consent was already given
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('analytics_consent');
      if (consent === null) {
        // No consent yet, show banner
        setShowBanner(true);
      } else {
        setConsentGiven(consent === 'true');
        if (consent === 'true') {
          enableAnalytics();
        }
      }
    }
  }, []);

  const handleAccept = () => {
    enableAnalytics();
    setConsentGiven(true);
    setShowBanner(false);
    localStorage.setItem('analytics_consent', 'true');
  };

  const handleReject = () => {
    disableAnalytics();
    setConsentGiven(false);
    setShowBanner(false);
    localStorage.setItem('analytics_consent', 'false');
  };

  if (!showBanner || consentGiven !== null) {
    return null;
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-bg-base border-t border-border-subtle shadow-lg"
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">
                    {t('analytics.consent.title') || 'Privacy e Analytics'}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {t('analytics.consent.message') || 
                      'Utilizziamo analytics per migliorare la tua esperienza. I dati sono anonimizzati e rispettano il GDPR. Puoi rifiutare in qualsiasi momento.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {t('analytics.consent.reject') || 'Rifiuta'}
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {t('analytics.consent.accept') || 'Accetta'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

