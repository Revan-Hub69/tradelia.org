import { Suspense } from 'react';
import { GlossaryContent } from '@/components/glossary/GlossaryContent';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateCollectionPageSchema } from '@/lib/seo/structured-data';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { loadGlossaryTerms } from '@/lib/glossary/terms';

export async function generateMetadata() {
  return generatePageMetadata('glossary', 'it');
}

export default async function GlossaryPage() {
  const dict = await getDictionary('it');
  
  // Carica termini per structured data
  const glossaryData = await loadGlossaryTerms('it');
  const termCount = Object.keys(glossaryData).length;

  // Genera CollectionPage schema
  const collectionSchema = generateCollectionPageSchema(
    dict.glossary.title || 'Glossario',
    dict.glossary.subtitle || 'Definizioni e termini finanziari',
    termCount,
    'it'
  );

  return (
    <>
      <StructuredData data={collectionSchema} id="glossary-structured-data" />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-text-secondary">{dict.common.loading || 'Caricamento...'}</p></div></div>}>
        <GlossaryContent />
      </Suspense>
    </>
  );
}
