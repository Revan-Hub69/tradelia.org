import { Metadata } from 'next';
import { GlossaryContent } from '@/components/glossary/GlossaryContent';

export const metadata: Metadata = {
  title: 'Glossario | Tradelia',
  description: 'Glossario completo dei termini finanziari e tecnici utilizzati in Tradelia',
};

export default function GlossaryPage() {
  return <GlossaryContent />;
}

