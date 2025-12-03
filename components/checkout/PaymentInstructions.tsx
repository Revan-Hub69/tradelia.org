'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, Mail, FileText, CheckCircle, Loader2, ExternalLink, Copy, Check } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  metadata: {
    planId: string;
    planType: string;
    billingCycle: string;
    customerData: any;
  };
}

export function PaymentInstructions() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const paymentId = searchParams.get('payment');
  const localePrefix = locale === 'en' ? '/en' : '';

  // Xolo Go payment link (da configurare)
  const XOLO_PAYMENT_LINK = process.env.NEXT_PUBLIC_XOLO_PAYMENT_LINK || 'https://pay.xolo.io';
  const XOLO_IBAN = process.env.NEXT_PUBLIC_XOLO_IBAN || 'IT60 X054 2811 1010 0000 0123 4567'; // Esempio

  useEffect(() => {
    if (!paymentId) {
      router.push(`${localePrefix}/pricing`);
      return;
    }

    const fetchPayment = async () => {
      try {
        const response = await fetch(`/api/billing/payments?paymentId=${paymentId}`);
        if (response.ok) {
          const data = await response.json();
          setPaymentData(data);
        } else {
          router.push(`${localePrefix}/pricing`);
        }
      } catch (error) {
        console.error('Error fetching payment:', error);
        router.push(`${localePrefix}/pricing`);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId, router, localePrefix]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!paymentData) {
    return null;
  }

  const planNames: Record<string, string> = {
    trial: t('pricing.plans.trial.name') || 'Trial',
    pro: t('pricing.plans.pro.name') || 'Pro',
    // Desk sarà aggiunto in futuro
  };

  return (
    <div className="min-h-screen bg-bg-base py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              {t('checkout.instructions.title') || 'Completa il Pagamento'}
            </h1>
            <p className="text-text-secondary">
              {t('checkout.instructions.subtitle') || 'Segui le istruzioni per completare il pagamento tramite Xolo Go'}
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              {t('checkout.instructions.orderSummary') || 'Riepilogo Ordine'}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">{planNames[paymentData.metadata.planId]}</span>
                <span className="font-semibold text-text-primary">
                  €{paymentData.amount} {paymentData.currency}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-tertiary">
                  {paymentData.metadata.billingCycle === 'monthly' 
                    ? t('checkout.summary.billing.monthly') || 'Fatturazione mensile'
                    : t('checkout.summary.billing.yearly') || 'Fatturazione annuale'}
                </span>
              </div>
              <div className="pt-3 border-t border-border-subtle">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-text-primary">
                    {t('checkout.summary.total') || 'Totale'}
                  </span>
                  <span className="text-2xl font-bold text-text-primary">
                    €{paymentData.amount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-text-primary">
              {t('checkout.instructions.paymentMethods') || 'Metodi di Pagamento'}
            </h2>

            {/* Xolo Go Link */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary mb-1">
                    {t('checkout.instructions.xoloLink.title') || 'Pagamento tramite Xolo Go'}
                  </h3>
                  <p className="text-sm text-text-secondary mb-3">
                    {t('checkout.instructions.xoloLink.description') || 'Clicca sul link per completare il pagamento in modo sicuro tramite Xolo Go'}
                  </p>
                  <a
                    href={XOLO_PAYMENT_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors"
                  >
                    {t('checkout.instructions.xoloLink.button') || 'Vai a Xolo Go'}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* IBAN Transfer */}
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary mb-1">
                    {t('checkout.instructions.iban.title') || 'Bonifico Bancario'}
                  </h3>
                  <p className="text-sm text-text-secondary mb-3">
                    {t('checkout.instructions.iban.description') || 'Effettua un bonifico all\'IBAN indicato. Includi il Payment ID come causale.'}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-text-tertiary mb-1 block">
                        {t('checkout.instructions.iban.label') || 'IBAN'}
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 rounded-lg bg-bg-soft border border-border-subtle text-text-primary font-mono text-sm">
                          {XOLO_IBAN}
                        </code>
                        <button
                          onClick={() => copyToClipboard(XOLO_IBAN)}
                          className="px-3 py-2 rounded-lg bg-bg-soft hover:bg-bg-elevated border border-border-subtle text-text-primary transition-colors"
                          aria-label={t('checkout.instructions.copy') || 'Copia'}
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-text-tertiary mb-1 block">
                        {t('checkout.instructions.iban.causale') || 'Causale (obbligatoria)'}
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 rounded-lg bg-bg-soft border border-border-subtle text-text-primary font-mono text-sm">
                          Tradelia - {paymentId}
                        </code>
                        <button
                          onClick={() => copyToClipboard(`Tradelia - ${paymentId}`)}
                          className="px-3 py-2 rounded-lg bg-bg-soft hover:bg-bg-elevated border border-border-subtle text-text-primary transition-colors"
                          aria-label={t('checkout.instructions.copy') || 'Copia'}
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary">
                  {t('checkout.instructions.info') || 'Dopo aver completato il pagamento, riceverai una conferma via email. Il tuo account verrà aggiornato automaticamente entro 24-48 ore.'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`${localePrefix}/dashboard`}
              className="flex-1 px-6 py-3 rounded-xl bg-bg-soft hover:bg-bg-elevated border border-border-subtle text-text-primary font-semibold text-center transition-all duration-200"
            >
              {t('checkout.instructions.backToDashboard') || 'Torna alla Dashboard'}
            </Link>
            <button
              onClick={() => router.push(`${localePrefix}/checkout/success?payment=${paymentId}`)}
              className="flex-1 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all duration-200"
            >
              {t('checkout.instructions.alreadyPaid') || 'Ho già pagato'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

