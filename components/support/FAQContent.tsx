'use client';

import { useTranslations } from '@/lib/i18n/use-translations';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { InternalLinks } from '@/components/seo/InternalLinks';

export function FAQContent() {
  const { t } = useTranslations();

  const faqs = [
    {
      question: t('faq.questions.whatIsTradelia') || 'Cos\'è Tradelia?',
      answer: t('faq.answers.whatIsTradelia') || 'Tradelia è un laboratorio indipendente che unisce framework AI proprietari e metodo accademico per la ricerca finanziaria. Offriamo accesso gratuito per tutti e servizi professionali on demand.',
    },
    {
      question: t('faq.questions.howToStart') || 'Come posso iniziare?',
      answer: t('faq.answers.howToStart') || 'Puoi iniziare creando un account gratuito. Avrai accesso alla dashboard, ai report pubblici e ai corsi base. Per funzionalità avanzate, considera l\'upgrade a Pro.',
    },
    {
      question: t('faq.questions.whatIsPro') || 'Cos\'è il piano Pro?',
      answer: t('faq.answers.whatIsPro') || 'Il piano Pro include Portfolio Manager, Calcolatrice Finanziaria, Sistema Alert Avanzato, Download PDF Report, Richieste Analisi Personalizzate e supporto prioritario.',
    },
    {
      question: t('faq.questions.isFree') || 'Tradelia è davvero gratuito?',
      answer: t('faq.answers.isFree') || 'Sì, l\'accesso base è completamente gratuito e permanente. I servizi professionali sono opzionali e finanziano l\'accesso gratuito per tutti.',
    },
    {
      question: t('faq.questions.mifidCompliant') || 'Il materiale è conforme MiFID II?',
      answer: t('faq.answers.mifidCompliant') || 'Sì, tutto il materiale è conforme alle normative MiFID II e agli standard accademici internazionali. Le informazioni sono a scopo educativo e non costituiscono consulenza finanziaria.',
    },
    {
      question: t('faq.questions.businessPlans') || 'Ci sono piani per aziende?',
      answer: t('faq.answers.businessPlans') || 'Sì, offriamo piani Business con fatturazione B2B. Contattaci per maggiori informazioni sui piani aziendali.',
    },
  ];

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('faq.title') || 'Domande Frequenti'}
          </h1>
          <p className="text-text-secondary mb-8">
            {t('faq.subtitle') || 'Trova risposte alle domande più comuni su Tradelia.'}
          </p>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-text-secondary">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 p-6 bg-bg-surface rounded-lg border border-border-subtle">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              {t('faq.needMoreHelp') || 'Hai bisogno di più aiuto?'}
            </h2>
            <p className="text-text-secondary mb-4">
              {t('faq.contactUs') || 'Non hai trovato la risposta che cercavi? Contattaci e ti aiuteremo.'}
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors mb-6"
            >
              {t('faq.contactButton') || 'Contattaci'}
            </a>
            <ShareButtons 
              variant="compact"
              title={t('faq.title')}
              description={t('faq.subtitle')}
            />
          </div>
          
          {/* Internal Links per SEO */}
          <InternalLinks />
        </div>
      </div>
    </div>
  );
}
