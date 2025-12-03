import { Metadata } from 'next';
import { ContactContent } from '@/components/contact/ContactContent';

export const metadata: Metadata = {
  title: 'Contatti · Tradelia',
  description: 'Contatta il team di Tradelia per supporto, domande o collaborazioni.',
};

export default function ContactPage() {
  return <ContactContent />;
}
