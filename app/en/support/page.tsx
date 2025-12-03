import { Metadata } from 'next';
import { SupportContent } from '@/components/support/SupportContent';

export const metadata: Metadata = {
  title: 'Support · Tradelia',
  description: 'Get support for Tradelia. Contact us for assistance, questions, or reports.',
};

export default function SupportPage() {
  return <SupportContent />;
}
