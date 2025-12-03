'use client';

import { useTranslations } from '@/lib/i18n/use-translations';

export function TermsContent() {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto prose prose-invert max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('terms.title') || 'Termini e Condizioni'}
          </h1>
          <p className="text-text-secondary mb-8 text-lg">
            {t('terms.lastUpdated') || 'Ultimo aggiornamento: Gennaio 2024'}
          </p>

          <div className="space-y-8 text-text-secondary">
            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                {t('terms.sections.acceptance.title') || 'Accettazione dei Termini'}
              </h2>
              <p>
                {t('terms.sections.acceptance.content') || 'Utilizzando Tradelia, accetti questi Termini e Condizioni. Se non accetti, non utilizzare la piattaforma.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                {t('terms.sections.use.title') || 'Utilizzo del Servizio'}
              </h2>
              <p>
                {t('terms.sections.use.content') || 'Tradelia fornisce materiale educativo e strumenti di ricerca finanziaria. Il materiale è a scopo educativo e non costituisce consulenza finanziaria. Non siamo responsabili per decisioni di investimento basate sul materiale fornito.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                {t('terms.sections.account.title') || 'Account e Pagamenti'}
              </h2>
              <p>
                {t('terms.sections.account.content') || 'Sei responsabile di mantenere la sicurezza del tuo account. I pagamenti per servizi Pro sono processati tramite provider sicuri. I rimborsi sono gestiti secondo la nostra politica di rimborso.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                {t('terms.sections.disclaimer.title') || 'Disclaimer'}
              </h2>
              <p>
                {t('terms.sections.disclaimer.content') || 'Il materiale fornito è a scopo educativo e non costituisce consulenza finanziaria, sollecitazione di investimento o raccomandazione. Tutti gli investimenti comportano rischi. Consulta sempre un consulente finanziario qualificato prima di prendere decisioni di investimento.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                {t('terms.sections.contact.title') || 'Contatti'}
              </h2>
              <p>
                {t('terms.sections.contact.content') || 'Per domande sui Termini e Condizioni, contattaci a support@tradelia.org'}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
