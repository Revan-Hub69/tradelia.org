import { Metadata } from 'next';
import { FAQContent } from '@/components/support/FAQContent';

export const metadata: Metadata = {
  title: 'FAQ · Tradelia',
  description: 'Domande frequenti su Tradelia, i nostri servizi e come utilizzare la piattaforma.',
};

export default function FAQPage() {
  return <FAQContent />;
}
