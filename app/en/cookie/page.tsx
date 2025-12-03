import { Metadata } from 'next';
import { CookieContent } from '@/components/legal/CookieContent';

export const metadata: Metadata = {
  title: 'Cookie Policy · Tradelia',
  description: 'Information about cookies used by Tradelia.',
};

export default function CookiePage() {
  return <CookieContent />;
}
