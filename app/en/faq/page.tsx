import { Suspense } from 'react';
import { FAQContent } from '@/components/support/FAQContent';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { getDictionary } from '@/lib/i18n/dictionaries';

export async function generateMetadata() {
  return generatePageMetadata('faq', 'en');
}

export default async function FAQPageEN() {
  const dict = await getDictionary('en');
  
  // Genera FAQ structured data
  const faqs = [
    {
      question: dict.faq.questions.whatIsTradelia || 'What is Tradelia?',
      answer: dict.faq.answers.whatIsTradelia || 'Tradelia is an independent lab...',
    },
    {
      question: dict.faq.questions.howToStart || 'How can I get started?',
      answer: dict.faq.answers.howToStart || 'You can start by creating a free account...',
    },
    {
      question: dict.faq.questions.whatIsPro || 'What is the Pro plan?',
      answer: dict.faq.answers.whatIsPro || 'The Pro plan includes...',
    },
    {
      question: dict.faq.questions.isFree || 'Is Tradelia really free?',
      answer: dict.faq.answers.isFree || 'Yes, basic access is completely free...',
    },
    {
      question: dict.faq.questions.mifidCompliant || 'Is the material MiFID II compliant?',
      answer: dict.faq.answers.mifidCompliant || 'Yes, all material is compliant...',
    },
    {
      question: dict.faq.questions.businessPlans || 'Are there business plans?',
      answer: dict.faq.answers.businessPlans || 'Yes, we offer Business plans...',
    },
  ];

  const faqSchema = generateFAQSchema(faqs, 'en');

  return (
    <>
      <StructuredData data={faqSchema} id="faq-structured-data" />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-text-secondary">Loading...</p></div></div>}>
        <FAQContent />
      </Suspense>
    </>
  );
}
