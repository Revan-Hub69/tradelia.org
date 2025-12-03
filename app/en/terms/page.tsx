import { Metadata } from 'next';
import { TermsContent } from '@/components/legal/TermsContent';

export const metadata: Metadata = {
  title: 'Terms & Conditions · Tradelia',
  description: 'Terms and conditions for using the Tradelia platform.',
};

export default function TermsPage() {
  return <TermsContent />;
}
