import { GlossaryContent } from '@/components/glossary/GlossaryContent';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('glossary', 'en');
}

export default function GlossaryPageEN() {
  return <GlossaryContent />;
}
