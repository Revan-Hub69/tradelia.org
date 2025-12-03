import { Metadata } from 'next';
import { GlossaryContent } from '@/components/glossary/GlossaryContent';

export const metadata: Metadata = {
  title: 'Glossary | Tradelia',
  description: 'Complete glossary of financial and technical terms used in Tradelia',
};

export default function GlossaryPageEN() {
  return <GlossaryContent />;
}
