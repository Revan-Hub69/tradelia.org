'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Building2, User, CreditCard, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

interface CheckoutData {
  planId: string;
  planType: 'individual' | 'business';
  billingCycle: 'monthly' | 'yearly';
  price: number;
  currency: string;
}

interface CustomerData {
  // Individual
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  taxCode?: string; // Codice fiscale per IT
  
  // Business
  companyName?: string;
  vatNumber?: string; // P.IVA
  companyAddress?: string;
  companyCity?: string;
  companyZipCode?: string;
  companyCountry?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
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
    const planId = searchParams.get('plan');
    const planType = searchParams.get('type') as 'individual' | 'business';
    const billingCycle = searchParams.get('billing') as 'monthly' | 'yearly';

    if (!planId || !planType || !billingCycle) {
      router.push('/pricing');
      return;
    }

    // Calcola prezzo in base al piano
    const prices: Record<string, { monthly: number; yearly: number }> = {
      trial: { monthly: 0, yearly: 0 },
      pro: { monthly: 29, yearly: 290 },
      // Desk sarà aggiunto in futuro
    };

    const price = prices[planId]?.[billingCycle] ?? 0;

    setCheckoutData({
      planId,
      planType,
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

    if (checkoutData?.planType === 'individual') {
      if (!customerData.firstName) newErrors.firstName = t('checkout.errors.firstName') || 'Nome richiesto';
      if (!customerData.lastName) newErrors.lastName = t('checkout.errors.lastName') || 'Cognome richiesto';
      if (!customerData.email) newErrors.email = t('checkout.errors.email') || 'Email richiesta';
      if (!customerData.country) newErrors.country = t('checkout.errors.country') || 'Paese richiesto';
      if (customerData.country === 'IT' && !customerData.taxCode) {
        newErrors.taxCode = t('checkout.errors.taxCode') || 'Codice fiscale richiesto per l\'Italia';
      }
    } else {
      if (!customerData.companyName) newErrors.companyName = t('checkout.errors.companyName') || 'Ragione sociale richiesta';
      if (!customerData.vatNumber) newErrors.vatNumber = t('checkout.errors.vatNumber') || 'P.IVA richiesta';
      if (!customerData.companyAddress) newErrors.companyAddress = t('checkout.errors.companyAddress') || 'Indirizzo aziendale richiesto';
      if (!customerData.contactEmail) newErrors.contactEmail = t('checkout.errors.contactEmail') || 'Email contatto richiesta';
      if (!customerData.companyCountry) newErrors.companyCountry = t('checkout.errors.companyCountry') || 'Paese richiesto';
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
      // Crea payment record
      const paymentResponse = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: checkoutData.planId,
          planType: checkoutData.planType,
          billingCycle: checkoutData.billingCycle,
          price: checkoutData.price,
          currency: checkoutData.currency,
          customerData,
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Errore creazione pagamento');
      }

      const { paymentId } = await paymentResponse.json();

      // Reindirizza a pagina istruzioni pagamento manuale
      router.push(`/checkout/payment-instructions?payment=${paymentId}`);
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
                planType={checkoutData.planType}
                customerData={customerData}
                setCustomerData={setCustomerData}
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
  planType,
  customerData,
  setCustomerData,
  errors,
  onSubmit,
}: {
  planType: 'individual' | 'business';
  customerData: CustomerData;
  setCustomerData: (data: CustomerData) => void;
  errors: Record<string, string>;
  onSubmit: () => void;
}) {
  const { t } = useTranslations();

  if (planType === 'individual') {
    return (
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-semibold text-text-primary">
            {t('checkout.data.individual.title') || 'Dati Personali'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('checkout.data.individual.firstName') || 'Nome'} *
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
              {t('checkout.data.individual.lastName') || 'Cognome'} *
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
            {t('checkout.data.individual.email') || 'Email'} *
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
            {t('checkout.data.individual.phone') || 'Telefono'}
          </label>
          <input
            type="tel"
            value={customerData.phone || ''}
            onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-bg-soft border border-border-subtle focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('checkout.data.individual.address') || 'Indirizzo'}
          </label>
          <input
            type="text"
            value={customerData.address || ''}
            onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-bg-soft border border-border-subtle focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('checkout.data.individual.city') || 'Città'}
            </label>
            <input
              type="text"
              value={customerData.city || ''}
              onChange={(e) => setCustomerData({ ...customerData, city: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-bg-soft border border-border-subtle focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('checkout.data.individual.zipCode') || 'CAP'}
            </label>
            <input
              type="text"
              value={customerData.zipCode || ''}
              onChange={(e) => setCustomerData({ ...customerData, zipCode: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-bg-soft border border-border-subtle focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('checkout.data.individual.country') || 'Paese'} *
            </label>
            <select
              value={customerData.country || ''}
              onChange={(e) => setCustomerData({ ...customerData, country: e.target.value })}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-bg-soft border focus:outline-none focus:border-accent',
                errors.country ? 'border-red-500' : 'border-border-subtle'
              )}
            >
              <option value="">{t('checkout.data.selectCountry') || 'Seleziona...'}</option>
              <option value="IT">Italia</option>
              <option value="US">Stati Uniti</option>
              <option value="GB">Regno Unito</option>
              <option value="DE">Germania</option>
              <option value="FR">Francia</option>
            </select>
            {errors.country && <p className="text-xs text-red-400 mt-1">{errors.country}</p>}
          </div>
        </div>

        {customerData.country === 'IT' && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('checkout.data.individual.taxCode') || 'Codice Fiscale'} *
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

        <button
          onClick={onSubmit}
          className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all duration-200"
        >
          {t('checkout.data.continue') || 'Continua al Pagamento'}
        </button>
      </div>
    );
  }

  // Business Form
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-semibold text-text-primary">
          {t('checkout.data.business.title') || 'Dati Aziendali'}
        </h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          {t('checkout.data.business.companyName') || 'Ragione Sociale'} *
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
          {t('checkout.data.business.vatNumber') || 'Partita IVA'} *
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
          {t('checkout.data.business.companyAddress') || 'Indirizzo Aziendale'} *
        </label>
        <input
          type="text"
          value={customerData.companyAddress || ''}
          onChange={(e) => setCustomerData({ ...customerData, companyAddress: e.target.value })}
          className={cn(
            'w-full px-4 py-2 rounded-lg bg-bg-soft border focus:outline-none focus:border-accent',
            errors.companyAddress ? 'border-red-500' : 'border-border-subtle'
          )}
        />
        {errors.companyAddress && <p className="text-xs text-red-400 mt-1">{errors.companyAddress}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('checkout.data.business.companyCity') || 'Città'}
          </label>
          <input
            type="text"
            value={customerData.companyCity || ''}
            onChange={(e) => setCustomerData({ ...customerData, companyCity: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-bg-soft border border-border-subtle focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('checkout.data.business.companyZipCode') || 'CAP'}
          </label>
          <input
            type="text"
            value={customerData.companyZipCode || ''}
            onChange={(e) => setCustomerData({ ...customerData, companyZipCode: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-bg-soft border border-border-subtle focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('checkout.data.business.companyCountry') || 'Paese'} *
          </label>
          <select
            value={customerData.companyCountry || ''}
            onChange={(e) => setCustomerData({ ...customerData, companyCountry: e.target.value })}
            className={cn(
              'w-full px-4 py-2 rounded-lg bg-bg-soft border focus:outline-none focus:border-accent',
              errors.companyCountry ? 'border-red-500' : 'border-border-subtle'
            )}
          >
            <option value="">{t('checkout.data.selectCountry') || 'Seleziona...'}</option>
            <option value="IT">Italia</option>
            <option value="US">Stati Uniti</option>
            <option value="GB">Regno Unito</option>
            <option value="DE">Germania</option>
            <option value="FR">Francia</option>
          </select>
          {errors.companyCountry && <p className="text-xs text-red-400 mt-1">{errors.companyCountry}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('checkout.data.business.contactPerson') || 'Persona di Contatto'}
          </label>
          <input
            type="text"
            value={customerData.contactPerson || ''}
            onChange={(e) => setCustomerData({ ...customerData, contactPerson: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-bg-soft border border-border-subtle focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('checkout.data.business.contactEmail') || 'Email Contatto'} *
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
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          {t('checkout.data.business.contactPhone') || 'Telefono Contatto'}
        </label>
        <input
          type="tel"
          value={customerData.contactPhone || ''}
          onChange={(e) => setCustomerData({ ...customerData, contactPhone: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-bg-soft border border-border-subtle focus:outline-none focus:border-accent"
        />
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
          {t('checkout.data.business.requireInvoice') || 'Richiedi fattura B2B (verrà generata automaticamente dopo il pagamento)'}
        </label>
      </div>

      <button
        onClick={onSubmit}
        className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all duration-200"
      >
        {t('checkout.data.continue') || 'Continua al Pagamento'}
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

