import { TermsContent } from '@/components/legal/TermsContent';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('terms', 'en');
}

export default function TermsPage() {
  return <TermsContent />;
}
