import dynamic from 'next/dynamic';
import { Hero } from '@/components/home';
import { Loading } from '@/components/ui';
import { generateMetadata as genMetadata } from '@/lib/seo/metadata';

// Dynamic imports for below-the-fold components (Next.js 14 App Router)
const Features = dynamic(() => import('@/components/home/Features').then(m => ({ default: m.Features })), {
  loading: () => <Loading className="min-h-[400px]" text="Caricamento contenuti..." />,
  ssr: true,
});

const Methods = dynamic(() => import('@/components/home/Methods').then(m => ({ default: m.Methods })), {
  loading: () => <Loading className="min-h-[400px]" text="Caricamento contenuti..." />,
  ssr: true,
});

const Values = dynamic(() => import('@/components/home/Values').then(m => ({ default: m.Values })), {
  loading: () => <Loading className="min-h-[400px]" text="Caricamento contenuti..." />,
  ssr: true,
});

export const metadata = genMetadata('it');

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Methods />
      <Values />
    </>
  );
}
