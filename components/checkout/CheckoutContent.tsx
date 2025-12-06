'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Building2, User, CreditCard, ArrowLeft, ArrowRight, Loader2, Shield, CheckCircle2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

interface CheckoutData {
  planId: 'pro' | 'desk';
  customerType: 'retail' | 'professionale';
  billingCycle: 'monthly' | 'yearly';
  price: number;
  currency: string;
}

interface CustomerData {
  firstName?: string;
  lastName?: string;
  email: string;
  country?: string;
  taxCode?: string;
  companyName?: string;
  vatNumber?: string;
  contactEmail?: string;
  companyCountry?: string;
  requireInvoice?: boolean;
}

// Lista completa paesi
const COUNTRIES = [
  { value: 'IT', label: 'Italia' },
  { value: 'AT', label: 'Austria' },
  { value: 'BE', label: 'Belgio' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'HR', label: 'Croazia' },
  { value: 'CY', label: 'Cipro' },
  { value: 'CZ', label: 'Repubblica Ceca' },
  { value: 'DK', label: 'Danimarca' },
  { value: 'EE', label: 'Estonia' },
  { value: 'FI', label: 'Finlandia' },
  { value: 'FR', label: 'Francia' },
  { value: 'DE', label: 'Germania' },
  { value: 'GR', label: 'Grecia' },
  { value: 'IE', label: 'Irlanda' },
  { value: 'LV', label: 'Lettonia' },
  { value: 'LT', label: 'Lituania' },
  { value: 'LU', label: 'Lussemburgo' },
  { value: 'MT', label: 'Malta' },
  { value: 'NL', label: 'Paesi Bassi' },
  { value: 'PL', label: 'Polonia' },
  { value: 'PT', label: 'Portogallo' },
  { value: 'RO', label: 'Romania' },
  { value: 'SK', label: 'Slovacchia' },
  { value: 'SI', label: 'Slovenia' },
  { value: 'ES', label: 'Spagna' },
  { value: 'SE', label: 'Svezia' },
  { value: 'GB', label: 'Regno Unito' },
  { value: 'CH', label: 'Svizzera' },
  { value: 'NO', label: 'Norvegia' },
  { value: 'US', label: 'Stati Uniti' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'Nuova Zelanda' },
  { value: 'JP', label: 'Giappone' },
  { value: 'SG', label: 'Singapore' },
  { value: 'AE', label: 'Emirati Arabi Uniti' },
  { value: 'OTHER', label: 'Altro' },
];

export function CheckoutContent() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  // System simplified: Italian only
  const localePrefix = '';
  const [step, setStep] = useState<'data' | 'payment' | 'processing'>('data');
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({ email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const companyNameRef = useRef<HTMLInputElement>(null);
  const paymentButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const planId = searchParams.get('plan') as 'pro' | 'desk' | null;
    const billingCycle = searchParams.get('billing') as 'monthly' | 'yearly';

    if (!planId || !billingCycle) {
      router.push(`${localePrefix}/pricing`);
      return;
    }

    const prices: Record<string, { monthly: number; yearly: number }> = {
      pro: { monthly: 29, yearly: 290 },
      desk: { monthly: 99, yearly: 990 },
    };

    const price = prices[planId]?.[billingCycle] ?? 0;

    setCheckoutData({
      planId: planId as 'pro' | 'desk',
      customerType: 'retail',
      billingCycle,
      price,
      currency: 'EUR',
    });

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setCustomerData(prev => ({ ...prev, email: user.email || '' }));
      }
    };
    fetchUser();
  }, [searchParams, router]);

  // Autofocus quando cambia customerType
  useEffect(() => {
    if (checkoutData?.customerType === 'retail' && firstNameRef.current) {
      setTimeout(() => firstNameRef.current?.focus(), 100);
    } else if (checkoutData?.customerType === 'professionale' && companyNameRef.current) {
      setTimeout(() => companyNameRef.current?.focus(), 100);
    }
  }, [checkoutData?.customerType]);

  // Validazione migliorata con sanitizzazione
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validateTaxCode = (code: string): boolean => {
    return /^[A-Z0-9]{11,16}$/.test(code.trim().toUpperCase());
  };

  const validateVAT = (vat: string): boolean => {
    return /^[A-Z0-9]{8,15}$/.test(vat.trim().toUpperCase());
  };

  const validateData = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!checkoutData?.customerType) {
      newErrors.customerType = t('checkout.errors.customerType') || 'Seleziona tipo cliente';
    }

    if (checkoutData?.customerType === 'retail') {
      if (!customerData.firstName?.trim()) {
        newErrors.firstName = t('checkout.errors.firstName') || 'Nome richiesto';
      }
      if (!customerData.lastName?.trim()) {
        newErrors.lastName = t('checkout.errors.lastName') || 'Cognome richiesto';
      }
      if (!customerData.email?.trim()) {
        newErrors.email = t('checkout.errors.email') || 'Email richiesta';
      } else if (!validateEmail(customerData.email)) {
        newErrors.email = t('checkout.errors.invalidEmail') || 'Email non valida';
      }
      if (!customerData.country) {
        newErrors.country = t('checkout.errors.country') || 'Paese richiesto';
      }
      if (customerData.country === 'IT' && customerData.taxCode) {
        if (!validateTaxCode(customerData.taxCode)) {
          newErrors.taxCode = t('checkout.errors.invalidTaxCode') || 'Codice fiscale non valido';
        }
      }
      if (customerData.country === 'IT' && !customerData.taxCode) {
        newErrors.taxCode = t('checkout.errors.taxCode') || 'Codice fiscale richiesto per l\'Italia';
      }
    } else if (checkoutData?.customerType === 'professionale') {
      if (!customerData.companyName?.trim()) {
        newErrors.companyName = t('checkout.errors.companyName') || 'Ragione sociale richiesta';
      }
      if (!customerData.vatNumber?.trim()) {
        newErrors.vatNumber = t('checkout.errors.vatNumber') || 'P.IVA richiesta';
      } else if (!validateVAT(customerData.vatNumber)) {
        newErrors.vatNumber = t('checkout.errors.invalidVAT') || 'P.IVA non valida';
      }
      if (!customerData.contactEmail?.trim()) {
        newErrors.contactEmail = t('checkout.errors.contactEmail') || 'Email contatto richiesta';
      } else if (!validateEmail(customerData.contactEmail)) {
        newErrors.contactEmail = t('checkout.errors.invalidEmail') || 'Email non valida';
      }
      if (!customerData.companyCountry) {
        newErrors.companyCountry = t('checkout.errors.companyCountry') || 'Paese richiesto';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitData = () => {
    if (validateData()) {
      setStep('payment');
      // Focus management: focus sul primo elemento del payment step
      setTimeout(() => {
        paymentButtonRef.current?.focus();
      }, 100);
    }
  };

  const handlePayment = async () => {
    if (!checkoutData || isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);
    setStep('processing');

    try {
      const response = await fetch('/api/checkout/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: checkoutData.planId,
          customerType: checkoutData.customerType,
          billingCycle: checkoutData.billingCycle,
          price: checkoutData.price,
          currency: checkoutData.currency,
          customerData: {
            ...customerData,
            email: customerData.email.trim(),
            contactEmail: customerData.contactEmail?.trim(),
            firstName: customerData.firstName?.trim(),
            lastName: customerData.lastName?.trim(),
            companyName: customerData.companyName?.trim(),
            taxCode: customerData.taxCode?.trim().toUpperCase(),
            vatNumber: customerData.vatNumber?.trim().toUpperCase(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('checkout.errors.payment') || 'Errore invio richiesta');
      }

      const { success, requestId } = await response.json();

      if (!success) {
        throw new Error(t('checkout.errors.payment') || 'Errore invio richiesta');
      }

      router.push(`${localePrefix}/checkout/submitted?request=${requestId}`);
    } catch (error) {
      console.error('Errore checkout:', error);
      setStep('payment');
      setErrors({ payment: error instanceof Error ? error.message : t('checkout.errors.payment') || 'Errore durante il pagamento' });
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
      {/* Skip to main content link for accessibility */}
      <a
        href="#checkout-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
      >
        {t('common.skipToContent') || 'Salta al contenuto principale'}
      </a>
      <div className="container mx-auto px-4 max-w-4xl" id="checkout-main">
        <div className="mb-8">
          <Link
            href={`${localePrefix}/pricing`}
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

        <div className="flex items-center gap-4 mb-8">
          <div className={cn('flex items-center gap-2', step === 'data' && 'text-accent')}>
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
              step === 'data' ? 'bg-accent border-accent text-white' : 'border-border-subtle text-text-tertiary'
            )}>
              {step !== 'data' ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-sm font-medium">{t('checkout.steps.data') || 'Dati'}</span>
          </div>
          <div className="flex-1 h-px bg-border-subtle" />
          <div className={cn('flex items-center gap-2', step === 'payment' && 'text-accent')}>
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
              step === 'payment' ? 'bg-accent border-accent text-white' : 'border-border-subtle text-text-tertiary'
            )}>
              2
            </div>
            <span className="text-sm font-medium">{t('checkout.steps.payment') || 'Pagamento'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 'data' && (
                <motion.div
                  key="data"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <DataCollectionForm
                    planId={checkoutData.planId}
                    customerType={checkoutData.customerType}
                    customerData={customerData}
                    setCustomerData={setCustomerData}
                    setCheckoutData={setCheckoutData}
                    errors={errors}
                    touched={touched}
                    setTouched={setTouched}
                    onSubmit={handleSubmitData}
                    firstNameRef={firstNameRef}
                    companyNameRef={companyNameRef}
                  />
                </motion.div>
              )}
              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <PaymentForm
                    checkoutData={checkoutData}
                    customerData={customerData}
                    onPayment={handlePayment}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    paymentButtonRef={paymentButtonRef}
                  />
                </motion.div>
              )}
              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-bg-surface border border-border-subtle rounded-2xl p-12 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
                    <p className="text-text-secondary">
                      {t('checkout.processing') || 'Elaborazione pagamento in corso...'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
  touched,
  setTouched,
  onSubmit,
  firstNameRef,
  companyNameRef,
}: {
  planId: 'pro' | 'desk';
  customerType: 'retail' | 'professionale';
  customerData: CustomerData;
  setCustomerData: (data: CustomerData) => void;
  setCheckoutData: React.Dispatch<React.SetStateAction<CheckoutData | null>>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setTouched: (touched: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  onSubmit: () => void;
  firstNameRef: React.RefObject<HTMLInputElement>;
  companyNameRef: React.RefObject<HTMLInputElement>;
}) {
  const { t } = useTranslations();

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          {t('checkout.data.customerType') || 'Tipo Cliente'} *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setCheckoutData((prev: CheckoutData | null) => prev ? { ...prev, customerType: 'retail' as const } : null);
              setCustomerData({ email: customerData.email || '' });
            }}
            className={cn(
              'p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-accent/50',
              customerType === 'retail'
                ? 'border-accent bg-accent/10'
                : 'border-border-subtle hover:border-border-default'
            )}
            aria-pressed={customerType === 'retail'}
          >
            <User className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="font-semibold text-text-primary">{t('checkout.data.retail.label') || 'Privato (Retail)'}</div>
            <div className="text-xs text-text-tertiary mt-1">{t('checkout.data.retail.description') || 'Per uso personale'}</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setCheckoutData((prev: CheckoutData | null) => prev ? { ...prev, customerType: 'professionale' as const } : null);
              setCustomerData({ email: customerData.email || '' });
            }}
            className={cn(
              'p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-accent/50',
              customerType === 'professionale'
                ? 'border-accent bg-accent/10'
                : 'border-border-subtle hover:border-border-default'
            )}
            aria-pressed={customerType === 'professionale'}
          >
            <Building2 className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <div className="font-semibold text-text-primary">{t('checkout.data.business.label') || 'Azienda (Business)'}</div>
            <div className="text-xs text-text-tertiary mt-1">{t('checkout.data.business.description') || 'Per uso professionale'}</div>
          </button>
        </div>
        {errors.customerType && (
          <p className="text-xs text-red-400 mt-2" role="alert">{errors.customerType}</p>
        )}
      </div>

      {customerType === 'retail' ? (
        <>
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-text-primary">
              {t('checkout.data.individual.title') || 'Dati Personali'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-text-primary mb-2">
                {t('checkout.data.individual.firstName') || 'Nome'} *
              </label>
              <input
                id="firstName"
                ref={firstNameRef}
                type="text"
                autoFocus
                autoComplete="given-name"
                value={customerData.firstName || ''}
                onChange={(e) => setCustomerData({ ...customerData, firstName: e.target.value })}
                onBlur={() => handleBlur('firstName')}
                className={cn(
                  'w-full px-4 py-2 rounded-lg bg-bg-soft border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50',
                  errors.firstName && touched.firstName ? 'border-red-500' : 'border-border-subtle focus:border-accent'
                )}
                aria-invalid={errors.firstName && touched.firstName ? 'true' : 'false'}
                aria-describedby={errors.firstName && touched.firstName ? 'firstName-error' : undefined}
              />
              {errors.firstName && touched.firstName && (
                <p id="firstName-error" className="text-xs text-red-400 mt-1" role="alert">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-text-primary mb-2">
                {t('checkout.data.individual.lastName') || 'Cognome'} *
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                value={customerData.lastName || ''}
                onChange={(e) => setCustomerData({ ...customerData, lastName: e.target.value })}
                onBlur={() => handleBlur('lastName')}
                className={cn(
                  'w-full px-4 py-2 rounded-lg bg-bg-soft border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50',
                  errors.lastName && touched.lastName ? 'border-red-500' : 'border-border-subtle focus:border-accent'
                )}
                aria-invalid={errors.lastName && touched.lastName ? 'true' : 'false'}
                aria-describedby={errors.lastName && touched.lastName ? 'lastName-error' : undefined}
              />
              {errors.lastName && touched.lastName && (
                <p id="lastName-error" className="text-xs text-red-400 mt-1" role="alert">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              {t('checkout.data.individual.email') || 'Email'} *
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={customerData.email}
              onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
              onBlur={() => handleBlur('email')}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-bg-soft border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50',
                errors.email && touched.email ? 'border-red-500' : 'border-border-subtle focus:border-accent'
              )}
              aria-invalid={errors.email && touched.email ? 'true' : 'false'}
              aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
            />
            {errors.email && touched.email && (
              <p id="email-error" className="text-xs text-red-400 mt-1" role="alert">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-text-primary mb-2">
              {t('checkout.data.individual.country') || 'Paese'} *
            </label>
            <select
              id="country"
              value={customerData.country || ''}
              onChange={(e) => setCustomerData({ ...customerData, country: e.target.value })}
              onBlur={() => handleBlur('country')}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-bg-soft border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50',
                errors.country && touched.country ? 'border-red-500' : 'border-border-subtle focus:border-accent'
              )}
              aria-invalid={errors.country && touched.country ? 'true' : 'false'}
              aria-describedby={errors.country && touched.country ? 'country-error' : undefined}
            >
              <option value="">{t('checkout.data.selectCountry') || 'Seleziona...'}</option>
              {COUNTRIES.map(country => (
                <option key={country.value} value={country.value}>{country.label}</option>
              ))}
            </select>
            {errors.country && touched.country && (
              <p id="country-error" className="text-xs text-red-400 mt-1" role="alert">{errors.country}</p>
            )}
          </div>

          {customerData.country === 'IT' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label htmlFor="taxCode" className="block text-sm font-medium text-text-primary mb-2">
                {t('checkout.data.individual.taxCode') || 'Codice Fiscale'} *
              </label>
              <input
                id="taxCode"
                type="text"
                autoComplete="off"
                value={customerData.taxCode || ''}
                onChange={(e) => setCustomerData({ ...customerData, taxCode: e.target.value.toUpperCase() })}
                onBlur={() => handleBlur('taxCode')}
                maxLength={16}
                className={cn(
                  'w-full px-4 py-2 rounded-lg bg-bg-soft border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50',
                  errors.taxCode && touched.taxCode ? 'border-red-500' : 'border-border-subtle focus:border-accent'
                )}
                aria-invalid={errors.taxCode && touched.taxCode ? 'true' : 'false'}
                aria-describedby={errors.taxCode && touched.taxCode ? 'taxCode-error' : undefined}
              />
              {errors.taxCode && touched.taxCode && (
                <p id="taxCode-error" className="text-xs text-red-400 mt-1" role="alert">{errors.taxCode}</p>
              )}
            </motion.div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-text-primary">
              {t('checkout.data.business.title') || 'Dati Aziendali'}
            </h2>
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-text-primary mb-2">
              {t('checkout.data.business.companyName') || 'Ragione Sociale'} *
            </label>
            <input
              id="companyName"
              ref={companyNameRef}
              type="text"
              autoFocus
              autoComplete="organization"
              value={customerData.companyName || ''}
              onChange={(e) => setCustomerData({ ...customerData, companyName: e.target.value })}
              onBlur={() => handleBlur('companyName')}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-bg-soft border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50',
                errors.companyName && touched.companyName ? 'border-red-500' : 'border-border-subtle focus:border-accent'
              )}
              aria-invalid={errors.companyName && touched.companyName ? 'true' : 'false'}
              aria-describedby={errors.companyName && touched.companyName ? 'companyName-error' : undefined}
            />
            {errors.companyName && touched.companyName && (
              <p id="companyName-error" className="text-xs text-red-400 mt-1" role="alert">{errors.companyName}</p>
            )}
          </div>

          <div>
            <label htmlFor="vatNumber" className="block text-sm font-medium text-text-primary mb-2">
              {t('checkout.data.business.vatNumber') || 'Partita IVA'} *
            </label>
            <input
              id="vatNumber"
              type="text"
              autoComplete="off"
              value={customerData.vatNumber || ''}
              onChange={(e) => setCustomerData({ ...customerData, vatNumber: e.target.value.toUpperCase() })}
              onBlur={() => handleBlur('vatNumber')}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-bg-soft border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50',
                errors.vatNumber && touched.vatNumber ? 'border-red-500' : 'border-border-subtle focus:border-accent'
              )}
              aria-invalid={errors.vatNumber && touched.vatNumber ? 'true' : 'false'}
              aria-describedby={errors.vatNumber && touched.vatNumber ? 'vatNumber-error' : undefined}
            />
            {errors.vatNumber && touched.vatNumber && (
              <p id="vatNumber-error" className="text-xs text-red-400 mt-1" role="alert">{errors.vatNumber}</p>
            )}
          </div>

          <div>
            <label htmlFor="companyCountry" className="block text-sm font-medium text-text-primary mb-2">
              {t('checkout.data.business.companyCountry') || 'Paese'} *
            </label>
            <select
              id="companyCountry"
              autoComplete="country"
              value={customerData.companyCountry || ''}
              onChange={(e) => setCustomerData({ ...customerData, companyCountry: e.target.value })}
              onBlur={() => handleBlur('companyCountry')}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-bg-soft border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50',
                errors.companyCountry && touched.companyCountry ? 'border-red-500' : 'border-border-subtle focus:border-accent'
              )}
              aria-invalid={errors.companyCountry && touched.companyCountry ? 'true' : 'false'}
              aria-describedby={errors.companyCountry && touched.companyCountry ? 'companyCountry-error' : undefined}
            >
              <option value="">{t('checkout.data.selectCountry') || 'Seleziona...'}</option>
              {COUNTRIES.map(country => (
                <option key={country.value} value={country.value}>{country.label}</option>
              ))}
            </select>
            {errors.companyCountry && touched.companyCountry && (
              <p id="companyCountry-error" className="text-xs text-red-400 mt-1" role="alert">{errors.companyCountry}</p>
            )}
          </div>

          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-text-primary mb-2">
              {t('checkout.data.business.contactEmail') || 'Email Contatto'} *
            </label>
            <input
              id="contactEmail"
              type="email"
              autoComplete="email"
              value={customerData.contactEmail || ''}
              onChange={(e) => setCustomerData({ ...customerData, contactEmail: e.target.value })}
              onBlur={() => handleBlur('contactEmail')}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-bg-soft border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50',
                errors.contactEmail && touched.contactEmail ? 'border-red-500' : 'border-border-subtle focus:border-accent'
              )}
              aria-invalid={errors.contactEmail && touched.contactEmail ? 'true' : 'false'}
              aria-describedby={errors.contactEmail && touched.contactEmail ? 'contactEmail-error' : undefined}
            />
            {errors.contactEmail && touched.contactEmail && (
              <p id="contactEmail-error" className="text-xs text-red-400 mt-1" role="alert">{errors.contactEmail}</p>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <input
              type="checkbox"
              id="requireInvoice"
              checked={customerData.requireInvoice || false}
              onChange={(e) => setCustomerData({ ...customerData, requireInvoice: e.target.checked })}
              className="w-5 h-5 rounded border-border-subtle text-accent focus:ring-accent focus:ring-2"
            />
            <label htmlFor="requireInvoice" className="flex-1 text-sm text-text-secondary cursor-pointer">
              {t('checkout.data.business.requireInvoice') || 'Richiedi fattura B2B (verrà generata automaticamente dopo il pagamento)'}
            </label>
          </div>
        </>
      )}

      <button
        onClick={onSubmit}
        className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
  isSubmitting,
  paymentButtonRef,
}: {
  checkoutData: CheckoutData;
  customerData: CustomerData;
  onPayment: () => void;
  errors: Record<string, string>;
  isSubmitting: boolean;
  paymentButtonRef: React.RefObject<HTMLButtonElement>;
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
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{t('checkout.payment.xolo.title') || 'Xolo Go'}</h3>
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
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400" role="alert">
          {errors.payment}
        </div>
      )}

      <button
        ref={paymentButtonRef}
        onClick={onPayment}
        disabled={isSubmitting}
        className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('checkout.processing') || 'Elaborazione...'}
          </>
        ) : (
          <>
            {t('checkout.payment.proceed') || 'Procedi al Pagamento'}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}

function OrderSummary({ checkoutData }: { checkoutData: CheckoutData | null }) {
  const { t } = useTranslations();

  if (!checkoutData) return null;

  const planNames: Record<string, string> = {
    pro: t('pricing.plans.pro.name') || 'Pro',
    desk: t('pricing.plans.desk.name') || 'Desk',
    trial: t('pricing.plans.trial.name') || 'Trial',
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
