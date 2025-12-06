import { Suspense } from 'react';
import { FAQContent } from '@/components/support/FAQContent';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';

export async function generateMetadata() {
  return generatePageMetadata('faq', 'it');
}

export default async function FAQPage() {
  // Genera FAQ structured data
  const faqs = [
    {
      question: 'Cos\'è Tradelia?',
      answer: 'Tradelia è un laboratorio indipendente...',
    },
    {
      question: 'Come posso iniziare?',
      answer: 'Puoi iniziare creando un account gratuito...',
    },
    {
      question: 'Cos\'è il piano Pro?',
      answer: 'Il piano Pro include...',
    },
    {
      question: 'Tradelia è davvero gratuito?',
      answer: 'Sì, l\'accesso base è completamente gratuito...',
    },
    {
      question: 'Il materiale è conforme MiFID II?',
      answer: 'Sì, tutto il materiale è conforme...',
    },
    {
      question: 'Ci sono piani per aziende?',
      answer: 'Sì, offriamo piani Business...',
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
