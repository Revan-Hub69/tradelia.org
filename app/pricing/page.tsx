import type { Metadata } from 'next';
import { PricingContent } from '@/components/pricing/PricingContent';

export const metadata: Metadata = {
  title: 'Pricing · Tradelia',
  description: 'Scegli il piano perfetto per le tue esigenze. Individuale o Business, con fatturazione B2B disponibile.',
};

export default function PricingPage() {
  return <PricingContent />;
}

