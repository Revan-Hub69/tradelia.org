'use client';

import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { useAuthState } from '@/lib/hooks/useAuthState';
import { useIsPro } from '@/lib/hooks/useUserRole';
import Link from 'next/link';
import { Check, Lock, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * UserBenefits - Mostra chiaramente cosa può fare l'utente
 * e perché dovrebbe registrarsi/upgradare
 */
export function UserBenefits() {
  const { t, locale } = useTranslations();
  const { isAuthenticated, isLoading } = useAuthState();
  const isPro = useIsPro();

  // Se sta caricando, non mostrare nulla
  if (isLoading) {
    return null;
  }

  // Guest: mostra perché registrarsi
  if (!isAuthenticated) {
    return (
      <Card className="p-6 md:p-8 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-accent/20" style={{ minHeight: '280px' }}>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              {t('dashboard.benefits.guest.title') || 'Perché registrarsi?'}
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              {t('dashboard.benefits.guest.description') || 'Registrati gratuitamente per sbloccare funzionalità esclusive'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            {
              icon: <Check className="w-5 h-5 text-green-400" />,
              text: t('dashboard.benefits.guest.feature1') || 'Accesso a report verificabili',
            },
            {
              icon: <Check className="w-5 h-5 text-green-400" />,
              text: t('dashboard.benefits.guest.feature2') || 'Corsi formativi gratuiti',
            },
            {
              icon: <Check className="w-5 h-5 text-green-400" />,
              text: t('dashboard.benefits.guest.feature3') || 'Salva i tuoi contenuti preferiti',
            },
            {
              icon: <Check className="w-5 h-5 text-green-400" />,
              text: t('dashboard.benefits.guest.feature4') || 'Traccia il tuo progresso',
            },
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm text-text-secondary">
              {feature.icon}
              <span>{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="flex-1">
            <Link href={buildLocalePath(locale, '/login')}>
              {t('dashboard.benefits.guest.cta') || 'Registrati Gratis'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1">
            <Link href={buildLocalePath(locale, '/pricing')}>
              {t('dashboard.benefits.guest.viewPricing') || 'Vedi Piani'}
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  // Base user: mostra perché upgradare a Pro
  if (!isPro) {
    return (
      <Card className="p-6 md:p-8 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20" style={{ minHeight: '280px' }}>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              {t('dashboard.benefits.base.title') || 'Sblocca il Potere di Pro'}
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              {t('dashboard.benefits.base.description') || 'Upgrade a Pro per accedere a funzionalità avanzate'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            {
              icon: <Lock className="w-5 h-5 text-amber-400" />,
              text: t('dashboard.benefits.base.feature1') || 'Richieste analisi personalizzate',
            },
            {
              icon: <Lock className="w-5 h-5 text-amber-400" />,
              text: t('dashboard.benefits.base.feature2') || 'Portfolio e watchlist avanzati',
            },
            {
              icon: <Lock className="w-5 h-5 text-amber-400" />,
              text: t('dashboard.benefits.base.feature3') || 'Trading journal professionale',
            },
            {
              icon: <Lock className="w-5 h-5 text-amber-400" />,
              text: t('dashboard.benefits.base.feature4') || 'Votazioni e proposte community',
            },
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm text-text-secondary">
              {feature.icon}
              <span>{feature.text}</span>
            </div>
          ))}
        </div>

        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={buildLocalePath(locale, '/pricing')}>
            {t('dashboard.benefits.base.cta') || 'Upgrade a Pro'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </Card>
    );
  }

  // Pro user: mostra che ha accesso completo
  return (
    <Card className="p-6 md:p-8 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20" style={{ minHeight: '120px' }}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-green-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            {t('dashboard.benefits.pro.title') || 'Account Pro Attivo'}
          </h2>
          <p className="text-sm text-text-secondary">
            {t('dashboard.benefits.pro.description') || 'Hai accesso completo a tutte le funzionalità avanzate'}
          </p>
        </div>
      </div>
    </Card>
  );
}
