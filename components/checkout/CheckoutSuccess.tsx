'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, FileText, ArrowRight, Download, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUserRole } from '@/lib/hooks/useUserRole';

export function CheckoutSuccess() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'unknown'>('unknown');
  const { role, isLoading: roleLoading, validUntil } = useUserRole();
  const paymentId = searchParams.get('payment');
  const localePrefix = locale === 'en' ? '/en' : '';

  const fetchPayment = async () => {
    if (!paymentId) return;
    
    try {
      const response = await fetch(`/api/billing/payments?paymentId=${paymentId}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentData(data);
        setPaymentStatus(data.status === 'completed' ? 'completed' : 'pending');
      }
    } catch (error) {
      console.error('Error fetching payment:', error);
    } finally {
      setLoading(false);
      setCheckingPayment(false);
    }
  };

  useEffect(() => {
    if (!paymentId) {
      router.push(`${localePrefix}/pricing`);
      return;
    }

    fetchPayment();
  }, [paymentId, router]);

  // Polling manuale per verificare stato pagamento (ogni 30 secondi se pending)
  useEffect(() => {
    if (!paymentId || paymentStatus !== 'pending') return;

    const interval = setInterval(() => {
      setCheckingPayment(true);
      fetchPayment();
    }, 30000); // 30 secondi

    return () => clearInterval(interval);
  }, [paymentId, paymentStatus]);

  const handleRefreshPayment = async () => {
    setCheckingPayment(true);
    await fetchPayment();
    // Forza refresh del ruolo utente
    window.location.reload();
  };

  const isPro = role === 'pro' || role === 'desk' || role === 'admin';
  const isPaymentCompleted = paymentStatus === 'completed';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-surface border border-border-subtle rounded-2xl p-12"
        >
          {/* Status Icon e Titolo */}
          <div className="text-center mb-8">
            {isPaymentCompleted ? (
              <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-12 h-12 text-amber-400" />
              </div>
            )}

            <h1 className="text-3xl font-bold text-text-primary mb-4">
              {isPaymentCompleted 
                ? (t('checkout.success.title') || 'Pagamento Completato!')
                : (t('checkout.success.pending') || 'Pagamento in Attesa')}
            </h1>
            <p className="text-text-secondary mb-8">
              {isPaymentCompleted
                ? (t('checkout.success.description') || 'Il tuo pagamento è stato processato con successo. Riceverai una conferma via email.')
                : (t('checkout.success.pendingDescription') || 'Il tuo pagamento è in attesa di conferma. Verrà processato manualmente entro 24-48 ore.')}
            </p>
          </div>

          {/* Status Box */}
          {!isPaymentCompleted && (
            <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-text-secondary mb-3">
                    {t('checkout.success.pendingInfo') || 'Il pagamento tramite Xolo Go richiede conferma manuale. Il tuo account verrà aggiornato automaticamente una volta confermato il pagamento.'}
                  </p>
                  <button
                    onClick={handleRefreshPayment}
                    disabled={checkingPayment}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {t('checkout.success.checking') || 'Verifica in corso...'}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        {t('checkout.success.checkPayment') || 'Verifica Stato Pagamento'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pro Status */}
          {isPaymentCompleted && (
            <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-center gap-3 justify-center">
                {isPro ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-text-primary">
                      {t('checkout.success.proActive') || 'Account Pro Attivo!'}
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span className="text-sm text-text-secondary">
                      {t('checkout.success.proPending') || 'Aggiornamento ruolo in corso...'}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {paymentData?.metadata?.customerData?.requireInvoice && (
            <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-center gap-3 justify-center mb-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-text-primary">
                  {t('checkout.success.invoice') || 'Fattura B2B'}
                </span>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                {t('checkout.success.invoiceDescription') || 'La tua fattura verrà generata e inviata via email entro 24 ore.'}
              </p>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-400 text-sm font-medium transition-colors">
                <Download className="w-4 h-4" />
                {t('checkout.success.downloadInvoice') || 'Scarica Fattura'}
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`${localePrefix}/dashboard`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all duration-200"
            >
              {t('checkout.success.goToDashboard') || 'Vai alla Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`${localePrefix}/dashboard/billing`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-bg-soft hover:bg-bg-elevated border border-border-subtle text-text-primary font-semibold transition-all duration-200"
            >
              <FileText className="w-4 h-4" />
              {t('checkout.success.viewBilling') || 'Vedi Fatture'}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

