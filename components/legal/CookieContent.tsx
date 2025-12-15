'use client';

import { useTranslations } from '@/lib/i18n/use-translations';

export function CookieContent() {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto prose prose-invert max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('cookie.title') || 'Cookie Policy'}
          </h1>
          <p className="text-text-secondary mb-8 text-lg">
            {t('cookie.lastUpdated') || 'Ultimo aggiornamento: Gennaio 2024'}
          </p>

          <div className="space-y-8 text-text-secondary">
            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                {t('cookie.sections.whatAre.title') || 'Cosa Sono i Cookie'}
              </h2>
              <p>
                {t('cookie.sections.whatAre.content') || 'I cookie sono piccoli file di testo salvati sul tuo dispositivo quando visiti un sito web. Utilizziamo cookie per migliorare la tua esperienza e fornire funzionalità essenziali.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                {t('cookie.sections.types.title') || 'Tipi di Cookie Utilizzati'}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {t('cookie.sections.types.essential.title') || 'Cookie Tecnici (Necessari)'}
                  </h3>
                  <p>
                    {t('cookie.sections.types.essential.content') || 'Cookie essenziali per il funzionamento del sito, inclusi autenticazione e sicurezza. Questi cookie non possono essere disabilitati.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {t('cookie.sections.types.analytics.title') || 'Cookie di Analisi'}
                  </h3>
                  <p>
                    {t('cookie.sections.types.analytics.content') || 'Cookie utilizzati per analizzare l\'utilizzo del sito e migliorare l\'esperienza utente. Puoi disabilitare questi cookie nelle impostazioni del browser.'}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                {t('cookie.sections.management.title') || 'Gestione Cookie'}
              </h2>
              <p>
                {t('cookie.sections.management.content') || 'Puoi gestire le preferenze dei cookie tramite le impostazioni del tuo browser. Nota che disabilitare alcuni cookie può limitare alcune funzionalità del sito.'}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
