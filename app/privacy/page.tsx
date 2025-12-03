import { Metadata } from 'next';
import { PrivacyContent } from '@/components/legal/PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy · Tradelia',
  description: 'Informativa sulla privacy di Tradelia. Scopri come gestiamo i tuoi dati personali.',
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
