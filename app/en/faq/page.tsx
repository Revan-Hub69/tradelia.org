import { Suspense } from 'react';
import { FAQContent } from '@/components/support/FAQContent';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';

export async function generateMetadata() {
  return generatePageMetadata('faq', 'en');
}

export default async function FAQPageEN() {
  // Genera FAQ structured data
  const faqs = [
    {
      question: 'What is Tradelia?',
      answer: 'Tradelia is an independent lab...',
    },
    {
      question: 'How can I get started?',
      answer: 'You can start by creating a free account...',
    },
    {
      question: 'What is the Pro plan?',
      answer: 'The Pro plan includes...',
    },
    {
      question: 'Is Tradelia really free?',
      answer: 'Yes, basic access is completely free...',
    },
    {
      question: 'Is the material MiFID II compliant?',
      answer: 'Yes, all material is compliant...',
    },
    {
      question: 'Are there business plans?',
      answer: 'Yes, we offer Business plans...',
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
