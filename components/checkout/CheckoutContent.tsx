'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Building2, User, CreditCard, FileText, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

interface CheckoutData {
  planId: 'pro' | 'desk';
  customerType: 'retail' | 'professionale'; // Retail = privato, Professionale = azienda
  billingCycle: 'monthly' | 'yearly';
  price: number;
  currency: string;
}

interface CustomerData {
  // Retail (Privato) - Solo dati essenziali
  firstName?: string;
  lastName?: string;
  email: string;
  country?: string;
  taxCode?: string; // Codice fiscale (solo se IT)
  
  // Professionale (Azienda) - Solo dati essenziali
  companyName?: string;
  vatNumber?: string; // P.IVA (obbligatorio per professionale)
  contactEmail?: string;
  companyCountry?: string;
  requireInvoice?: boolean;
}

export function CheckoutContent() {
  const { t } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'data' | 'payment' | 'processing'>('data');
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const planId = searchParams.get('plan') as 'pro' | 'desk' | null;
    const billingCycle = searchParams.get('billing') as 'monthly' | 'yearly';

    if (!planId || !billingCycle) {
      router.push('/pricing');
      return;
    }

    // Calcola prezzo in base al piano
    const prices: Record<string, { monthly: number; yearly: number }> = {
      pro: { monthly: 29, yearly: 290 },
      desk: { monthly: 99, yearly: 990 },
    };

    const price = prices[planId]?.[billingCycle] ?? 0;

    // customerType sarà selezionato nel form, non più da query params
    setCheckoutData({
      planId: planId as 'pro' | 'desk',
      customerType: 'retail', // Default, sarà cambiato dall'utente
      billingCycle,
      price,
      currency: 'EUR',
    });

    // Pre-compila email se utente loggato
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setCustomerData(prev => ({ ...prev, email: user.email || '' }));
      }
    };
    fetchUser();
  }, [searchParams, router]);

  const validateData = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validazione customerType
    if (!checkoutData?.customerType) {
      newErrors.customerType = 'Seleziona tipo cliente';
    }

    if (checkoutData?.customerType === 'retail') {
      if (!customerData.firstName) newErrors.firstName = 'Nome richiesto';
      if (!customerData.lastName) newErrors.lastName = 'Cognome richiesto';
      if (!customerData.email) newErrors.email = 'Email richiesta';
      if (!customerData.country) newErrors.country = 'Paese richiesto';
      if (customerData.country === 'IT' && !customerData.taxCode) {
        newErrors.taxCode = 'Codice fiscale richiesto per l\'Italia';
      }
    } else if (checkoutData?.customerType === 'professionale') {
      if (!customerData.companyName) newErrors.companyName = 'Ragione sociale richiesta';
      if (!customerData.vatNumber) newErrors.vatNumber = 'P.IVA richiesta';
      if (!customerData.contactEmail) newErrors.contactEmail = 'Email contatto richiesta';
      if (!customerData.companyCountry) newErrors.companyCountry = 'Paese richiesto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitData = () => {
    if (validateData()) {
      setStep('payment');
    }
  };

  const handlePayment = async () => {
    if (!checkoutData) return;

    setLoading(true);
    setStep('processing');

    try {
      // Invia email all'admin con i dati del form
      const emailResponse = await fetch('/api/checkout/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: checkoutData.planId,
          customerType: checkoutData.customerType,
          billingCycle: checkoutData.billingCycle,
          price: checkoutData.price,
          currency: checkoutData.currency,
          customerData,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.error || 'Errore invio richiesta');
      }

      const { success, requestId } = await emailResponse.json();

      if (!success) {
        throw new Error('Errore invio richiesta');
      }

      // Reindirizza a pagina di conferma
      router.push(`/checkout/submitted?request=${requestId}`);
    } catch (error) {
      console.error('Errore checkout:', error);
      setStep('payment');
      setErrors({ payment: t('checkout.errors.payment') || 'Errore durante il pagamento' });
    } finally {
      setLoading(false);
    }
  };

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('checkout.backToPricing') || 'Torna ai piani'}
          </Link>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {t('checkout.title') || 'Checkout'}
          </h1>
          <p className="text-text-secondary">
            {t('checkout.subtitle') || 'Completa i tuoi dati e procedi al pagamento'}
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          <div className={cn('flex items-center gap-2', step === 'data' && 'text-accent')}>
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center border-2',
              step === 'data' ? 'bg-accent border-accent text-white' : 'border-border-subtle text-text-tertiary'
            )}>
              1
            </div>
            <span className="text-sm font-medium">{t('checkout.steps.data') || 'Dati'}</span>
          </div>
          <div className="flex-1 h-px bg-border-subtle" />
          <div className={cn('flex items-center gap-2', step === 'payment' && 'text-accent')}>
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center border-2',
              step === 'payment' ? 'bg-accent border-accent text-white' : 'border-border-subtle text-text-tertiary'
            )}>
              2
            </div>
            <span className="text-sm font-medium">{t('checkout.steps.payment') || 'Pagamento'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {step === 'data' && (
              <DataCollectionForm
                planId={checkoutData.planId}
                customerType={checkoutData.customerType}
                customerData={customerData}
                setCustomerData={setCustomerData}
                setCheckoutData={setCheckoutData}
                errors={errors}
                onSubmit={handleSubmitData}
              />
            )}
            {step === 'payment' && (
              <PaymentForm
                checkoutData={checkoutData}
                customerData={customerData}
                onPayment={handlePayment}
                errors={errors}
              />
            )}
            {step === 'processing' && (
              <div className="bg-bg-surface border border-border-subtle rounded-2xl p-12 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
                <p className="text-text-secondary">
                  {t('checkout.processing') || 'Elaborazione pagamento in corso...'}
                </p>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary checkoutData={checkoutData} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DataCollectionForm({
  planId,
  customerType,
  customerData,
  setCustomerData,
  setCheckoutData,
  errors,
  onSubmit,
}: {
  planId: 'pro' | 'desk';
  customerType: 'retail' | 'professionale';
  customerData: CustomerData;
  setCustomerData: (data: CustomerData) => void;
  setCheckoutData: React.Dispatch<React.SetStateAction<CheckoutData | null>>;
  errors: Record<string, string>;
  onSubmit: () => void;
}) {
  const { t } = useTranslations();

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-6">
      {/* Selezione Business/Retail */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Tipo Cliente *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setCheckoutData((prev: CheckoutData | null) => prev ? { ...prev, customerType: 'retail' as const } : null);
              setCustomerData({ email: customerData.email || '' }); // Reset dati
            }}
            className={cn(
              'p-4 rounded-xl border-2 transition-all',
              customerType === 'retail'
                ? 'border-accent bg-accent/10'
                : 'border-border-subtle hover:border-border-default'
            )}
          >
            <User className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="font-semibold text-text-primary">Privato (Retail)</div>
            <div className="text-xs text-text-tertiary mt-1">Per uso personale</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setCheckoutData((prev: CheckoutData | null) => prev ? { ...prev, customerType: 'professionale' as const } : null);
              setCustomerData({ email: customerData.email || '' }); // Reset dati
            }}
            className={cn(
              'p-4 rounded-xl border-2 transition-all',
              customerType === 'professionale'
                ? 'border-accent bg-accent/10'
                : 'border-border-subtle hover:border-border-default'
            )}
          >
            <Building2 className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <div className="font-semibold text-text-primary">Azienda (Business)</div>
            <div className="text-xs text-text-tertiary mt-1">Per uso professionale</div>
          </button>
        </div>
        {errors.customerType && (
          <p className="text-xs text-red-400 mt-2">{errors.customerType}</p>
        )}
      </div>

      {customerType === 'retail' ? (
        <>
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-text-primary">
              Dati Personali
            </h2>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Nome *
            </label>
            <input
              type="text"
              value={customerData.firstName || ''}
              onChange={(e) => setCustomerData({ ...customerData, firstName: e.target.value })}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-bg-soft border focus:outline-none focus:border-accent',
                errors.firstName ? 'border-red-500' : 'border-border-subtle'
              )}
            />
            {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Cognome *
            </label>
            <input
              type="text"
              value={customerData.lastName || ''}
              onChange={(e) => setCustomerData({ ...customerData, lastName: e.target.value })}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-bg-soft border focus:outline-none focus:border-accent',
                errors.lastName ? 'border-red-500' : 'border-border-subtle'
              )}
            />
            {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Email *
          </label>
          <input
            type="email"
            value={customerData.email}
            onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
            className={cn(
              'w-full px-4 py-2 rounded-lg bg-bg-soft border focus:outline-none focus:border-accent',
              errors.email ? 'border-red-500' : 'border-border-subtle'
            )}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>

        <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Paese *
            </label>
            <select
              value={customerData.country || ''}
              onChange={(e) => setCustomerData({ ...customerData, country: e.target.value })}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-bg-soft border focus:outline-none focus:border-accent',
                errors.country ? 'border-red-500' : 'border-border-subtle'
              )}
            >
              <option value="">Seleziona...</option>
              <option value="IT">Italia</option>
              <option value="US">Stati Uniti</option>
              <option value="GB">Regno Unito</option>
              <option value="DE">Germania</option>
              <option value="FR">Francia</option>
            </select>
            {errors.country && <p className="text-xs text-red-400 mt-1">{errors.country}</p>}
          </div>

        {customerData.country === 'IT' && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Codice Fiscale *
            </label>
            <input
              type="text"
              value={customerData.taxCode || ''}
              onChange={(e) => setCustomerData({ ...customerData, taxCode: e.target.value.toUpperCase() })}
              maxLength={16}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-bg-soft border focus:outline-none focus:border-accent',
                errors.taxCode ? 'border-red-500' : 'border-border-subtle'
              )}
            />
            {errors.taxCode && <p className="text-xs text-red-400 mt-1">{errors.taxCode}</p>}
          </div>
        )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-text-primary">
              Dati Aziendali
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Ragione Sociale *
            </label>
            <input
              type="text"
              value={customerData.companyName || ''}
              onChange={(e) => setCustomerData({ ...customerData, companyName: e.target.value })}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-bg-soft border focus:outline-none focus:border-accent',
                errors.companyName ? 'border-red-500' : 'border-border-subtle'
              )}
            />
            {errors.companyName && <p className="text-xs text-red-400 mt-1">{errors.companyName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Partita IVA *
            </label>
            <input
              type="text"
              value={customerData.vatNumber || ''}
              onChange={(e) => setCustomerData({ ...customerData, vatNumber: e.target.value })}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-bg-soft border focus:outline-none focus:border-accent',
                errors.vatNumber ? 'border-red-500' : 'border-border-subtle'
              )}
            />
            {errors.vatNumber && <p className="text-xs text-red-400 mt-1">{errors.vatNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Paese *
            </label>
            <select
              value={customerData.companyCountry || ''}
              onChange={(e) => setCustomerData({ ...customerData, companyCountry: e.target.value })}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-bg-soft border focus:outline-none focus:border-accent',
                errors.companyCountry ? 'border-red-500' : 'border-border-subtle'
              )}
            >
              <option value="">Seleziona...</option>
              <option value="IT">Italia</option>
              <option value="US">Stati Uniti</option>
              <option value="GB">Regno Unito</option>
              <option value="DE">Germania</option>
              <option value="FR">Francia</option>
            </select>
            {errors.companyCountry && <p className="text-xs text-red-400 mt-1">{errors.companyCountry}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email Contatto *
            </label>
            <input
              type="email"
              value={customerData.contactEmail || ''}
              onChange={(e) => setCustomerData({ ...customerData, contactEmail: e.target.value })}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-bg-soft border focus:outline-none focus:border-accent',
                errors.contactEmail ? 'border-red-500' : 'border-border-subtle'
              )}
            />
            {errors.contactEmail && <p className="text-xs text-red-400 mt-1">{errors.contactEmail}</p>}
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <input
              type="checkbox"
              id="requireInvoice"
              checked={customerData.requireInvoice || false}
              onChange={(e) => setCustomerData({ ...customerData, requireInvoice: e.target.checked })}
              className="w-5 h-5 rounded border-border-subtle text-accent focus:ring-accent"
            />
            <label htmlFor="requireInvoice" className="flex-1 text-sm text-text-secondary cursor-pointer">
              Richiedi fattura B2B (verrà generata automaticamente dopo il pagamento)
            </label>
          </div>
        </>
      )}

      <button
        onClick={onSubmit}
        className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all duration-200"
      >
        Continua al Pagamento
      </button>
    </div>
  );
}

function PaymentForm({
  checkoutData,
  customerData,
  onPayment,
  errors,
}: {
  checkoutData: CheckoutData;
  customerData: CustomerData;
  onPayment: () => void;
  errors: Record<string, string>;
}) {
  const { t } = useTranslations();

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-semibold text-text-primary">
          {t('checkout.payment.title') || 'Metodo di Pagamento'}
        </h2>
      </div>

      <div className="p-6 bg-bg-soft border border-border-subtle rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">Xolo Go</h3>
            <p className="text-sm text-text-secondary">
              {t('checkout.payment.xolo.description') || 'Pagamento sicuro tramite Xolo Go'}
            </p>
          </div>
        </div>
        <p className="text-sm text-text-tertiary">
          {t('checkout.payment.xolo.info') || 'Il pagamento verrà processato in modo sicuro tramite Xolo Go. Riceverai una conferma via email.'}
        </p>
      </div>

      {errors.payment && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
          {errors.payment}
        </div>
      )}

      <button
        onClick={onPayment}
        className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2"
      >
        {t('checkout.payment.proceed') || 'Procedi al Pagamento'}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function OrderSummary({ checkoutData }: { checkoutData: CheckoutData | null }) {
  const { t } = useTranslations();

  if (!checkoutData) return null;

  const planNames: Record<string, string> = {
    trial: t('pricing.plans.trial.name') || 'Trial',
    pro: t('pricing.plans.pro.name') || 'Pro',
    institutional: t('pricing.plans.institutional.name') || 'Institutional',
  };

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 sticky top-4">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {t('checkout.summary.title') || 'Riepilogo Ordine'}
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">{planNames[checkoutData.planId]}</span>
          <span className="font-semibold text-text-primary">
            €{checkoutData.price}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-tertiary">
            {checkoutData.billingCycle === 'monthly' 
              ? t('checkout.summary.billing.monthly') || 'Fatturazione mensile'
              : t('checkout.summary.billing.yearly') || 'Fatturazione annuale'}
          </span>
        </div>
        <div className="pt-4 border-t border-border-subtle">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-text-primary">
              {t('checkout.summary.total') || 'Totale'}
            </span>
            <span className="text-2xl font-bold text-text-primary">
              €{checkoutData.price}
            </span>
          </div>
          <p className="text-xs text-text-tertiary mt-2">
            {t('checkout.summary.vat') || 'IVA inclusa dove applicabile'}
          </p>
        </div>
      </div>
    </div>
  );
}

