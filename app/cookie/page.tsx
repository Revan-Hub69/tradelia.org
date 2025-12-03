import { Metadata } from 'next';
import { CookieContent } from '@/components/legal/CookieContent';

export const metadata: Metadata = {
  title: 'Cookie Policy · Tradelia',
  description: 'Informativa sui cookie utilizzati da Tradelia.',
};

export default function CookiePage() {
  return <CookieContent />;
}
