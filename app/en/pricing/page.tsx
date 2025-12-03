import type { Metadata } from 'next';
import { PricingContent } from '@/components/pricing/PricingContent';

export const metadata: Metadata = {
  title: 'Pricing · Tradelia',
  description: 'Choose the perfect plan for your needs. Individual or Business, with B2B invoicing available.',
};

export default function PricingPageEN() {
  return <PricingContent />;
}
