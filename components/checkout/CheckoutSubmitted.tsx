'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, Clock } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function CheckoutSubmitted() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('request');
  const localePrefix = locale === 'en' ? '/en' : '';

  useEffect(() => {
    if (!requestId) {
      router.push(`${localePrefix}/pricing`);
    }
  }, [requestId, router, localePrefix]);

  return (
    <div className="min-h-screen bg-bg-base py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-surface border border-border-subtle rounded-2xl p-12 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-12 h-12 text-blue-400" />
          </div>

          <h1 className="text-3xl font-bold text-text-primary mb-4">
            {t('checkout.submitted.title') || 'Richiesta Inviata!'}
          </h1>
          <p className="text-text-secondary mb-8">
            {t('checkout.submitted.description') || 'La tua richiesta è stata inviata con successo al nostro team. Riceverai una risposta via email entro 24-48 ore.'}
          </p>

          {/* Info Box */}
          <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-left">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary mb-2">
                  <strong className="text-text-primary">Cosa succede ora?</strong>
                </p>
                <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                  <li>Il nostro team riceverà la tua richiesta via email</li>
                  <li>Verificheremo i dati e creeremo il tuo account</li>
                  <li>Ti invieremo la fattura da pagare</li>
                  <li>Dopo il pagamento, il tuo account verrà attivato</li>
                </ol>
              </div>
            </div>
          </div>

          {requestId && (
            <div className="mb-8 p-4 bg-bg-soft rounded-xl">
              <p className="text-xs text-text-tertiary mb-1">Request ID</p>
              <code className="text-sm text-text-primary font-mono">{requestId}</code>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`${localePrefix}/dashboard`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all duration-200"
            >
              {t('checkout.submitted.goToDashboard') || 'Vai alla Dashboard'}
            </Link>
            <Link
              href={`${localePrefix}/pricing`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-bg-soft hover:bg-bg-elevated border border-border-subtle text-text-primary font-semibold transition-all duration-200"
            >
              {t('checkout.submitted.backToPricing') || 'Torna ai Piani'}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
