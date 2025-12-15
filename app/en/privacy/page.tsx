import { PrivacyContent } from '@/components/legal/PrivacyContent';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('privacy', 'en');
}

export default function PrivacyPage() {
  return <PrivacyContent />;
}
