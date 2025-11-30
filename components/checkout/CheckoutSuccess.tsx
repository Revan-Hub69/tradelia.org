'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, FileText, ArrowRight, Download } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function CheckoutSuccess() {
  const { t } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const paymentId = searchParams.get('payment');

  useEffect(() => {
    if (!paymentId) {
      router.push('/pricing');
      return;
    }

    // Fetch payment data
    const fetchPayment = async () => {
      try {
        const response = await fetch(`/api/billing/payments?paymentId=${paymentId}`);
        if (response.ok) {
          const data = await response.json();
          setPaymentData(data);
        }
      } catch (error) {
        console.error('Error fetching payment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId, router]);

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
          className="bg-bg-surface border border-border-subtle rounded-2xl p-12 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>

          <h1 className="text-3xl font-bold text-text-primary mb-4">
            {t('checkout.success.title') || 'Pagamento Completato!'}
          </h1>
          <p className="text-text-secondary mb-8">
            {t('checkout.success.description') || 'Il tuo pagamento è stato processato con successo. Riceverai una conferma via email.'}
          </p>

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
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all duration-200"
            >
              {t('checkout.success.goToDashboard') || 'Vai alla Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/billing"
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

