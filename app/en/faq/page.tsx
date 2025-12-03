import { Metadata } from 'next';
import { FAQContent } from '@/components/support/FAQContent';

export const metadata: Metadata = {
  title: 'FAQ · Tradelia',
  description: 'Frequently asked questions about Tradelia, our services, and how to use the platform.',
};

export default function FAQPage() {
  return <FAQContent />;
}
