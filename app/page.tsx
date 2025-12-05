import dynamic from 'next/dynamic';
import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { Values } from '@/components/home/Values';
import { Loading } from '@/components/ui';
import { generateMetadata as genMetadata } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo/structured-data';
import { defaultLocale } from '@/lib/i18n/config';

// Methods uses advanced client-side logic and animation infrastructure.
// Rendering it via dynamic import with ssr: false avoids parsing the client
// component during the server build phase on Render (fixes JSX parse error).
const Methods = dynamic(() => import('@/components/home/Methods').then((m) => ({ default: m.Methods })), {
  loading: () => <Loading className="min-h-[400px]" />,
});

// Reviews component - visibile a tutti, login solo per commentare
const Reviews = dynamic(() => import('@/components/home/Reviews').then((m) => ({ default: m.Reviews })), {
  loading: () => null, // Non mostrare loading, componente si auto-nasconde se non ci sono recensioni
});

export const metadata = genMetadata('it');

export default function HomePage() {
  // Structured data per homepage
  const schemas = [
    generateOrganizationSchema(defaultLocale),
    generateWebSiteSchema(defaultLocale),
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <StructuredData key={index} data={schema} id={`homepage-structured-data-${index}`} />
      ))}
      <Hero />
      <Features />
      <Methods />
      <Reviews />
      <Values />
    </>
  );
}
