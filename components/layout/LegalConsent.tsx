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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted to avoid hydration mismatch
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only check localStorage after mount to avoid hydration issues
    if (!mounted) return;
    
    // Check if user has already consented
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setHasConsented(true);
    }
  }, [mounted]);

  // Lock body scroll when popup is open
  useEffect(() => {
    if (!isOpen) return;
    
    // Save original overflow value
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    return () => {
      // Restore original values
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

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

  if (hasConsented) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - SOLID AND OPAQUE */}
          <motion.div
            className="fixed inset-0 z-[200]"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.95)',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleAccept}
            aria-hidden="true"
          />
          
          {/* Modal Container */}
          <motion.div
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-consent-title"
            aria-describedby="legal-consent-description"
            onClick={(e) => {
              // Close on backdrop click
              if (e.target === e.currentTarget) {
                handleAccept();
              }
            }}
          >
            <motion.div
              className="w-full max-w-[560px]"
              initial={prefersReducedMotion ? { opacity: 0, scale: 0.95 } : { y: 20, opacity: 0, scale: 0.95 }}
              animate={prefersReducedMotion ? { opacity: 1, scale: 1 } : { y: 0, opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0, scale: 0.95 } : { y: 20, opacity: 0, scale: 0.95 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0.2 }
                  : { type: 'spring', damping: 25, stiffness: 200 }
              }
              onClick={(e) => e.stopPropagation()}
            >
              <Card 
                className="border-border-strong shadow-2xl w-full"
                style={{
                  backgroundColor: '#1A1F2E',
                  background: '#1A1F2E',
                }}
              >
              <div className="p-6 md:p-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-accent border border-border-accent flex items-center justify-center">
                      <Shield className="w-6 h-6 text-accent" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 id="legal-consent-title" className="text-xl md:text-2xl font-bold text-text-primary">
                        {t('legal.title')}
                      </h2>
                      <p className="text-sm text-text-secondary">
                        {t('legal.subtitle')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-w-[44px] min-h-[44px]"
                    onClick={handleAccept}
                    aria-label={t('legal.close')}
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </Button>
                </div>

                {/* Content */}
                <div id="legal-consent-description" className="space-y-4 mb-6">
                  <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                    {t('legal.cookies')}
                  </p>
                  <div className="p-4 bg-accent-muted/30 rounded-lg border border-accent/20">
                    <p className="text-sm md:text-base text-text-primary leading-relaxed font-medium">
                      {t('legal.noDataSale')}
                    </p>
                  </div>
                  <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                    {t('legal.educational')}{' '}
                    <strong className="text-text-primary">{t('legal.educationalHighlight')}</strong>{' '}
                    {t('legal.educationalEnd')}{' '}
                    <strong className="text-text-primary">{t('legal.mifid')}</strong>{' '}
                    {t('legal.mifidEnd')}
                  </p>
                  <div className="flex items-start gap-3 p-4 bg-bg-elevated rounded-lg border border-border">
                    <FileText className="w-5 h-5 text-accent flex-shrink-0 mt-1" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                        {t('legal.readMore')}{' '}
                        <Link href="/privacy" className="text-accent hover:text-accent-hover underline font-medium" style={{ color: '#3B82F6' }}>
                          {t('legal.privacy')}
                        </Link>
                        {' '}{t('legal.and')}{' '}
                        <Link href="/terms" className="text-accent hover:text-accent-hover underline font-medium" style={{ color: '#3B82F6' }}>
                          {t('legal.terms')}
                        </Link>
                        .
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
                    <span>{t('legal.accept')}</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleReject}
                    className="flex-1 min-h-[44px]"
                  >
                    <span>{t('legal.reject')}</span>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
