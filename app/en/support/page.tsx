import { SupportContent } from '@/components/support/SupportContent';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('support', 'en');
}

export default function SupportPage() {
  return <SupportContent />;
}
