import { CookieContent } from '@/components/legal/CookieContent';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('cookie', 'it');
}

export default function CookiePage() {
  return <CookieContent />;
}
