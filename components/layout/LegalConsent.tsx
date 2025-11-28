'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, FileText, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useReducedMotion } from '@/lib/animations';
import Link from 'next/link';

const CONSENT_KEY = 'tradelia-legal-consent';

export function LegalConsent() {
  const { t, locale } = useTranslations();
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setHasConsented(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setHasConsented(true);
    setIsOpen(false);
  };

  const handleReject = () => {
    localStorage.setItem(CONSENT_KEY, 'rejected');
    setHasConsented(true);
    setIsOpen(false);
  };

  if (hasConsented || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-bg-base/80 backdrop-blur-sm z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleAccept}
            aria-hidden="true"
          />

          {/* Consent Modal */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:right-auto z-[201] max-w-2xl w-full md:max-w-lg"
            initial={prefersReducedMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0.2 }
                : { type: 'spring', damping: 25, stiffness: 200 }
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-consent-title"
            aria-describedby="legal-consent-description"
          >
            <Card className="m-4 md:m-0 border-border-strong shadow-2xl">
              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-accent border border-border-accent flex items-center justify-center">
                      <Shield className="w-6 h-6 text-accent" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 id="legal-consent-title" className="text-xl font-bold text-text-primary">
                        {locale === 'en' ? 'Legal Information' : 'Informativa Legale'}
                      </h2>
                      <p className="text-sm text-text-muted">
                        {locale === 'en' ? 'GDPR and MiFID II Compliance' : 'Conformità GDPR e MiFID II'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-w-[44px] min-h-[44px]"
                    onClick={handleAccept}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </Button>
                </div>

                {/* Content */}
                <div id="legal-consent-description" className="space-y-4 mb-6">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {locale === 'en' 
                      ? 'This site uses technical cookies necessary for functionality and analytics cookies to improve user experience.'
                      : 'Questo sito utilizza cookie tecnici necessari per il funzionamento e cookie di analisi per migliorare l\'esperienza utente.'}
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {locale === 'en'
                      ? <>The information provided is for <strong className="text-text-primary">educational purposes only</strong> and does not constitute financial advice. Material compliant with <strong className="text-text-primary">MiFID II</strong> regulations and international academic standards.</>
                      : <>Le informazioni fornite sono a scopo <strong className="text-text-primary">esclusivamente educativo</strong> e non costituiscono consulenza finanziaria. Materiale conforme alle normative <strong className="text-text-primary">MiFID II</strong> e agli standard accademici internazionali.</>}
                  </p>
                  <div className="flex items-start gap-3 p-4 bg-bg-elevated rounded-lg border border-border">
                    <FileText className="w-5 h-5 text-accent flex-shrink-0 mt-1" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {locale === 'en' ? (
                          <>Read our{' '}
                            <Link href="/privacy" className="text-accent hover:text-accent-hover underline">
                              Privacy Policy
                            </Link>
                            {' '}and{' '}
                            <Link href="/terms" className="text-accent hover:text-accent-hover underline">
                              Terms & Conditions
                            </Link>
                            .</>
                        ) : (
                          <>Consulta la nostra{' '}
                            <Link href="/privacy" className="text-accent hover:text-accent-hover underline">
                              Privacy Policy
                            </Link>
                            {' '}e i{' '}
                            <Link href="/terms" className="text-accent hover:text-accent-hover underline">
                              Termini e Condizioni
                            </Link>
                            .</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="default"
                    onClick={handleAccept}
                    className="flex-1 min-h-[44px]"
                  >
                    <Cookie className="w-4 h-4" aria-hidden="true" />
                    <span>{locale === 'en' ? 'Accept and continue' : 'Accetta e continua'}</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleReject}
                    className="flex-1 min-h-[44px]"
                  >
                    <span>{locale === 'en' ? 'Reject' : 'Rifiuta'}</span>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
