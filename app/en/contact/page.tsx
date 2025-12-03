import { Metadata } from 'next';
import { ContactContent } from '@/components/contact/ContactContent';

export const metadata: Metadata = {
  title: 'Contact · Tradelia',
  description: 'Contact the Tradelia team for support, questions, or collaborations.',
};

export default function ContactPage() {
  return <ContactContent />;
}
