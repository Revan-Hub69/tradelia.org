import { FAQContent } from '@/components/support/FAQContent';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('faq', 'it');
}

export default function FAQPage() {
  return <FAQContent />;
}
