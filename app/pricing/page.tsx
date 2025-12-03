import { PricingContent } from '@/components/pricing/PricingContent';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('pricing', 'it');
}

export default function PricingPage() {
  return <PricingContent />;
}

