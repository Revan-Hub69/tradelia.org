import { Metadata } from 'next';
import { PrivacyContent } from '@/components/legal/PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy · Tradelia',
  description: 'Tradelia Privacy Policy. Learn how we handle your personal data.',
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
