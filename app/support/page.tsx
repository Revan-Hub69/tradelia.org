import { Metadata } from 'next';
import { SupportContent } from '@/components/support/SupportContent';

export const metadata: Metadata = {
  title: 'Supporto · Tradelia',
  description: 'Ottieni supporto per Tradelia. Contattaci per assistenza, domande o segnalazioni.',
};

export default function SupportPage() {
  return <SupportContent />;
}
