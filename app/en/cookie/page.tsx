import { CookieContent } from '@/components/legal/CookieContent';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('cookie', 'en');
}

export default function CookiePage() {
  return <CookieContent />;
}
