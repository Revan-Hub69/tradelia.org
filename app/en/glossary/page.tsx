import { GlossaryChat } from '@/components/glossary/GlossaryChat';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('glossary', 'en');
}

export default function GlossaryPageEN() {
  return (
    <div className="min-h-screen bg-bg-base">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GlossaryChat />
      </div>
    </div>
  );
}
