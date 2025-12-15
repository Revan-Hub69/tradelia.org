import { PrivacyContent } from '@/components/legal/PrivacyContent';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('privacy', 'it');
}

export default function PrivacyPage() {
  return <PrivacyContent />;
}
