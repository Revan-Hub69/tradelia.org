'use client';

import { useTranslations } from '@/lib/i18n/use-translations';
import { Target, Users, Award, Shield } from 'lucide-react';
import { ShareButtons } from '@/components/ui/ShareButtons';

export function AboutContent() {
  const { t } = useTranslations();

  const values = [
    {
      icon: Target,
      title: t('about.values.independence.title') || 'Indipendenza',
      description: t('about.values.independence.description') || 'Progetto indipendente senza conflitti di interesse.',
    },
    {
      icon: Award,
      title: t('about.values.academic.title') || 'Rigore Accademico',
      description: t('about.values.academic.description') || 'Metodologia basata su standard accademici internazionali.',
    },
    {
      icon: Shield,
      title: t('about.values.compliance.title') || 'Conformità',
      description: t('about.values.compliance.description') || 'Materiale conforme alle normative MiFID II.',
    },
    {
      icon: Users,
      title: t('about.values.community.title') || 'Community',
      description: t('about.values.community.description') || 'Accesso gratuito per tutti, servizi Pro opzionali.',
    },
  ];

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('about.title') || 'Chi Siamo'}
          </h1>
          <p className="text-text-secondary mb-8 text-lg leading-relaxed">
            {t('about.description') || 'Tradelia è un laboratorio indipendente che unisce framework AI proprietari e metodo accademico per la ricerca finanziaria. Il nostro obiettivo è rendere la ricerca finanziaria accessibile, verificabile e conforme agli standard internazionali.'}
          </p>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-6">
              {t('about.mission.title') || 'La Nostra Missione'}
            </h2>
            <p className="text-text-secondary leading-relaxed">
              {t('about.mission.content') || 'Crediamo che la ricerca finanziaria debba essere aperta, verificabile e accessibile a tutti. I nostri framework AI sono documentati e replicabili, il materiale è conforme alle normative MiFID II e gli standard accademici internazionali. I servizi professionali sono opzionali e finanziano l\'accesso gratuito per la community.'}
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-6">
              {t('about.values.title') || 'I Nostri Valori'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="p-6 bg-bg-surface rounded-lg border border-border-subtle">
                    <Icon className="w-8 h-8 text-accent mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      {value.title}
                    </h3>
                    <p className="text-text-secondary">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-bg-surface rounded-lg border border-border-subtle p-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              {t('about.contact.title') || 'Vuoi Saperne di Più?'}
            </h2>
            <p className="text-text-secondary mb-6">
              {t('about.contact.description') || 'Contattaci per domande, collaborazioni o per saperne di più sui nostri servizi.'}
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors mb-6"
            >
              {t('about.contact.button') || 'Contattaci'}
            </a>
            <ShareButtons 
              variant="compact"
              title={t('about.title')}
              description={t('about.description')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
