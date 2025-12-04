import { Suspense } from 'react';
import { FAQContent } from '@/components/support/FAQContent';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { getDictionary } from '@/lib/i18n/dictionaries';

export async function generateMetadata() {
  return generatePageMetadata('faq', 'it');
}

export default async function FAQPage() {
  const dict = await getDictionary('it');
  
  // Genera FAQ structured data
  const faqs = [
    {
      question: dict.faq.questions.whatIsTradelia || 'Cos\'è Tradelia?',
      answer: dict.faq.answers.whatIsTradelia || 'Tradelia è un laboratorio indipendente...',
    },
    {
      question: dict.faq.questions.howToStart || 'Come posso iniziare?',
      answer: dict.faq.answers.howToStart || 'Puoi iniziare creando un account gratuito...',
    },
    {
      question: dict.faq.questions.whatIsPro || 'Cos\'è il piano Pro?',
      answer: dict.faq.answers.whatIsPro || 'Il piano Pro include...',
    },
    {
      question: dict.faq.questions.isFree || 'Tradelia è davvero gratuito?',
      answer: dict.faq.answers.isFree || 'Sì, l\'accesso base è completamente gratuito...',
    },
    {
      question: dict.faq.questions.mifidCompliant || 'Il materiale è conforme MiFID II?',
      answer: dict.faq.answers.mifidCompliant || 'Sì, tutto il materiale è conforme...',
    },
    {
      question: dict.faq.questions.businessPlans || 'Ci sono piani per aziende?',
      answer: dict.faq.answers.businessPlans || 'Sì, offriamo piani Business...',
    },
  ];

  const faqSchema = generateFAQSchema(faqs, 'it');

  return (
    <>
      <StructuredData data={faqSchema} id="faq-structured-data" />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-text-secondary">Caricamento...</p></div></div>}>
        <FAQContent />
      </Suspense>
    </>
  );
}
