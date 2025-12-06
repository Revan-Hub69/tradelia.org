'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Building2, User, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { prefetchOnHover } from '@/lib/utils/prefetch';
import { InternalLinks } from '@/components/seo/InternalLinks';
import { ShareButtons } from '@/components/ui/ShareButtons';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceYearly?: number;
  currency: string;
  features: string[];
  popular?: boolean;
  cta: string;
  type: 'individual' | 'business';
  badge?: string;
}

export function PricingContent() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const isPro = useIsPro();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  // System simplified: Italian only
  const localePrefix = '';

  const individualPlans: Plan[] = [
    {
      id: 'trial',
      name: t('pricing.plans.trial.name') || 'Trial',
      description: t('pricing.plans.trial.description') || 'Prova gratuita',
      price: 0,
      currency: 'EUR',
      features: [
        t('pricing.plans.trial.features.1') || 'Accesso base alla dashboard',
        t('pricing.plans.trial.features.2') || 'Report pubblici',
        t('pricing.plans.trial.features.3') || 'Corsi base',
        t('pricing.plans.trial.features.4') || 'Supporto community',
      ],
      cta: t('pricing.plans.trial.cta') || 'Inizia Gratis',
      type: 'individual',
    },
    {
      id: 'pro',
      name: t('pricing.plans.pro.name') || 'Pro',
      description: t('pricing.plans.pro.description') || 'Per professionisti',
      price: 29,
      priceYearly: 290,
      currency: 'EUR',
      popular: true,
      features: [
        t('pricing.plans.pro.features.1') || 'Tutto del Trial',
        t('pricing.plans.pro.features.2') || 'Portfolio Manager',
        t('pricing.plans.pro.features.3') || 'Calcolatrice Finanziaria',
        t('pricing.plans.pro.features.4') || 'Sistema Alert Avanzato',
        t('pricing.plans.pro.features.5') || 'Download PDF Report',
        t('pricing.plans.pro.features.6') || 'Richiesta Analisi Personalizzate',
        t('pricing.plans.pro.features.7') || 'Supporto prioritario',
      ],
      cta: t('pricing.plans.pro.cta') || 'Scegli Pro',
      type: 'individual',
      badge: t('pricing.plans.pro.badge') || 'Più Popolare',
    },
  ];

  // Business plans (Desk)
  const businessPlans: Plan[] = [
    {
      id: 'desk',
      name: t('pricing.plans.desk.name') || 'Desk',
      description: t('pricing.plans.desk.description') || 'Per istituzioni e team',
      price: 99,
      priceYearly: 990,
      currency: 'EUR',
      features: [
        t('pricing.plans.desk.features.1') || 'Tutto del Pro',
        t('pricing.plans.desk.features.2') || 'API Access',
        t('pricing.plans.desk.features.3') || 'Fatturazione B2B',
        t('pricing.plans.desk.features.4') || 'Supporto 24/7',
        t('pricing.plans.desk.features.5') || 'Account Manager dedicato',
        t('pricing.plans.desk.features.6') || 'Custom integrations',
      ],
      cta: t('pricing.plans.desk.cta') || 'Scegli Desk',
      type: 'business',
    },
  ];

  const handleSelectPlan = (planId: string, type: 'individual' | 'business') => {
    setSelectedPlan(planId);
    // Naviga direttamente al checkout - l'utente sceglierà business/retail nel form
    router.push(`${localePrefix}/checkout?plan=${planId}&billing=${billingCycle}`);
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            {t('pricing.title') || 'Scegli il Tuo Piano'}
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
            {t('pricing.subtitle') || 'Piani flessibili per ogni esigenza, con fatturazione B2B disponibile per aziende'}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={cn('text-sm font-medium', billingCycle === 'monthly' ? 'text-text-primary' : 'text-text-tertiary')}>
              {t('pricing.billing.monthly') || 'Mensile'}
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={cn(
                'relative w-14 h-8 rounded-full transition-colors',
                billingCycle === 'yearly' ? 'bg-accent' : 'bg-bg-soft'
              )}
            >
              <motion.div
                layout
                className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: billingCycle === 'yearly' ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={cn('text-sm font-medium', billingCycle === 'yearly' ? 'text-text-primary' : 'text-text-tertiary')}>
              {t('pricing.billing.yearly') || 'Annuale'}
              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                {t('pricing.billing.save') || '-17%'}
              </span>
            </span>
          </div>
        </div>

        {/* Individual Plans */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <User className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-semibold text-text-primary">
              {t('pricing.sections.individual') || 'Piani Individuali'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {individualPlans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                index={index}
                onSelect={() => handleSelectPlan(plan.id, plan.type)}
                isCurrentPlan={plan.id === 'pro' && isPro}
              />
            ))}
          </div>
        </section>

        {/* Business Plans */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-semibold text-text-primary">
              {t('pricing.sections.business') || 'Piani Business'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-2xl mx-auto">
            {businessPlans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                index={index}
                onSelect={() => handleSelectPlan(plan.id, plan.type)}
              />
            ))}
          </div>
        </section>

        {/* Features Comparison */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-text-primary text-center mb-8">
            {t('pricing.comparison.title') || 'Confronta le Funzionalità'}
          </h2>
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-8">
            <ComparisonTable />
          </div>
        </section>

        {/* Share Buttons */}
        <div className="mt-12 flex justify-center">
          <ShareButtons 
            variant="compact"
            title={t('pricing.title')}
            description={t('pricing.subtitle')}
          />
        </div>
        
        {/* Internal Links per SEO */}
        <InternalLinks />
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  billingCycle,
  index,
  onSelect,
  isCurrentPlan,
}: {
  plan: Plan;
  billingCycle: 'monthly' | 'yearly';
  index: number;
  onSelect: () => void;
  isCurrentPlan?: boolean;
}) {
  const { t } = useTranslations();
  const price = billingCycle === 'yearly' && plan.priceYearly ? plan.priceYearly : plan.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'relative p-8 rounded-2xl border-2 transition-all duration-200',
        plan.popular
          ? 'bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-accent shadow-lg'
          : 'bg-bg-surface border-border-subtle hover:border-accent/40',
        isCurrentPlan && 'ring-2 ring-accent'
      )}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-sm font-semibold rounded-full">
          {plan.badge}
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-4 right-4 px-3 py-1 bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-medium rounded-full">
          {t('pricing.currentPlan') || 'Piano Attuale'}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-text-primary mb-2">{plan.name}</h3>
        <p className="text-text-secondary text-sm">{plan.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-text-primary">
            €{billingCycle === 'yearly' && plan.priceYearly ? plan.priceYearly : plan.price}
          </span>
          <span className="text-text-tertiary">
            /{billingCycle === 'monthly' ? t('pricing.perMonth') || 'mese' : t('pricing.perYear') || 'anno'}
          </span>
        </div>
        {billingCycle === 'yearly' && plan.priceYearly && (
          <p className="text-sm text-text-tertiary mt-1">
            {t('pricing.equivalent') || 'Equivalente a'} €{Math.round(plan.priceYearly / 12)}/{t('pricing.perMonth') || 'mese'}
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <span className="text-sm text-text-secondary">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        onMouseEnter={() => {
          if (!isCurrentPlan) {
            prefetchOnHover('/checkout');
          }
        }}
        disabled={isCurrentPlan}
        className={cn(
          'w-full py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2',
          plan.popular
            ? 'bg-accent hover:bg-accent-hover text-white shadow-md hover:shadow-lg'
            : 'bg-bg-soft hover:bg-bg-elevated text-text-primary border border-border-subtle hover:border-accent/40',
          isCurrentPlan && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isCurrentPlan ? (
          <>
            <Check className="w-5 h-5" />
            {t('pricing.currentPlan') || 'Piano Attuale'}
          </>
        ) : (
          <>
            {plan.cta}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </motion.div>
  );
}

function ComparisonTable() {
  const { t } = useTranslations();

  const features = [
    { name: t('pricing.comparison.features.dashboard') || 'Dashboard Completa', trial: true, pro: true, business: true },
    { name: t('pricing.comparison.features.reports') || 'Report Pubblici', trial: true, pro: true, business: true },
    { name: t('pricing.comparison.features.courses') || 'Corsi Base', trial: true, pro: true, business: true },
    { name: t('pricing.comparison.features.portfolio') || 'Portfolio Manager', trial: false, pro: true, business: true },
    { name: t('pricing.comparison.features.calculator') || 'Calcolatrice Finanziaria', trial: false, pro: true, business: true },
    { name: t('pricing.comparison.features.alerts') || 'Sistema Alert', trial: false, pro: true, business: true },
    { name: t('pricing.comparison.features.pdf') || 'Download PDF', trial: false, pro: true, business: true },
    { name: t('pricing.comparison.features.analysis') || 'Analisi Personalizzate', trial: false, pro: true, business: true },
    { name: t('pricing.comparison.features.api') || 'API Access', trial: false, pro: false, business: true },
    { name: t('pricing.comparison.features.b2b') || 'Fatturazione B2B', trial: false, pro: false, business: true },
    { name: t('pricing.comparison.features.support') || 'Supporto 24/7', trial: false, pro: false, business: true },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="text-left py-4 px-4 font-semibold text-text-primary">
              {t('pricing.comparison.feature') || 'Funzionalità'}
            </th>
            <th className="text-center py-4 px-4 font-semibold text-text-primary">Trial</th>
            <th className="text-center py-4 px-4 font-semibold text-text-primary">Pro</th>
            <th className="text-center py-4 px-4 font-semibold text-text-primary">Business</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, idx) => (
            <tr key={idx} className="border-b border-border-subtle/50">
              <td className="py-4 px-4 text-text-secondary">{feature.name}</td>
              <td className="py-4 px-4 text-center">
                {feature.trial ? (
                  <Check className="w-5 h-5 text-accent mx-auto" />
                ) : (
                  <span className="text-text-tertiary">—</span>
                )}
              </td>
              <td className="py-4 px-4 text-center">
                {feature.pro ? (
                  <Check className="w-5 h-5 text-accent mx-auto" />
                ) : (
                  <span className="text-text-tertiary">—</span>
                )}
              </td>
              <td className="py-4 px-4 text-center">
                {feature.business ? (
                  <Check className="w-5 h-5 text-accent mx-auto" />
                ) : (
                  <span className="text-text-tertiary">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

