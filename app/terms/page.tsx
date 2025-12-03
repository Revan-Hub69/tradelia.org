import { Metadata } from 'next';
import { TermsContent } from '@/components/legal/TermsContent';

export const metadata: Metadata = {
  title: 'Termini e Condizioni · Tradelia',
  description: 'Termini e condizioni di utilizzo della piattaforma Tradelia.',
};

export default function TermsPage() {
  return <TermsContent />;
}
