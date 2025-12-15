import { PricingContent } from '@/components/pricing/PricingContent';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('pricing', 'en');
}

export default function PricingPageEN() {
  return <PricingContent />;
}
