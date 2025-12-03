import dynamic from 'next/dynamic';
import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { Values } from '@/components/home/Values';
import { Loading } from '@/components/ui';
import { generateMetadata as genMetadata } from '@/lib/seo/metadata';

// Methods uses advanced client-side logic and animation infrastructure.
// Rendering it via dynamic import with ssr: false avoids parsing the client
// component during the server build phase on Render (fixes JSX parse error).
const Methods = dynamic(() => import('@/components/home/Methods').then((m) => ({ default: m.Methods })), {
  loading: () => <Loading className="min-h-[400px]" />,
  ssr: false,
});

// Reviews component - solo per utenti loggati
const Reviews = dynamic(() => import('@/components/home/Reviews').then((m) => ({ default: m.Reviews })), {
  loading: () => null, // Non mostrare loading, componente si auto-nasconde se non loggato
  ssr: false,
});

export const metadata = genMetadata('it');

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Methods />
      <Reviews />
      <Values />
    </>
  );
}
