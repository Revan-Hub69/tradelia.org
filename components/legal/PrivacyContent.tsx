'use client';

import { useTranslations } from '@/lib/i18n/use-translations';

export function PrivacyContent() {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto prose prose-invert max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('privacy.title') || 'Privacy Policy'}
          </h1>
          <p className="text-text-secondary mb-8 text-lg">
            {t('privacy.lastUpdated') || 'Ultimo aggiornamento: Gennaio 2024'}
          </p>

          <div className="space-y-8 text-text-secondary">
            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                {t('privacy.sections.introduction.title') || 'Introduzione'}
              </h2>
              <p>
                {t('privacy.sections.introduction.content') || 'Tradelia rispetta la tua privacy e si impegna a proteggere i tuoi dati personali. Questa Privacy Policy spiega come raccogliamo, utilizziamo e proteggiamo le tue informazioni quando utilizzi la nostra piattaforma.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                {t('privacy.sections.dataCollection.title') || 'Raccolta Dati'}
              </h2>
              <p>
                {t('privacy.sections.dataCollection.content') || 'Raccogliamo solo i dati necessari per fornire i nostri servizi: email per l\'autenticazione, dati di utilizzo per migliorare la piattaforma, e informazioni di pagamento per i servizi Pro (processate tramite provider sicuri).'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                {t('privacy.sections.dataUsage.title') || 'Utilizzo Dati'}
              </h2>
              <p>
                {t('privacy.sections.dataUsage.content') || 'I tuoi dati sono utilizzati esclusivamente per: fornire e migliorare i nostri servizi, comunicare con te, processare pagamenti, e rispettare obblighi legali. Non vendiamo né condividiamo i tuoi dati con terze parti per scopi di marketing.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                {t('privacy.sections.rights.title') || 'I Tuoi Diritti'}
              </h2>
              <p>
                {t('privacy.sections.rights.content') || 'Hai il diritto di accedere, correggere, eliminare o limitare l\'elaborazione dei tuoi dati personali. Puoi anche opporti all\'elaborazione o richiedere la portabilità dei dati. Contattaci a support@tradelia.org per esercitare questi diritti.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                {t('privacy.sections.contact.title') || 'Contatti'}
              </h2>
              <p>
                {t('privacy.sections.contact.content') || 'Per domande sulla Privacy Policy, contattaci a support@tradelia.org'}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
