import dynamic from 'next/dynamic';
import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { Values } from '@/components/home/Values';
import { Loading } from '@/components/ui';
import { generateMetadata as genMetadata } from '@/lib/seo/metadata';

const Methods = dynamic(() => import('@/components/home/Methods').then((m) => ({ default: m.Methods })), {
  loading: () => <Loading className="min-h-[400px]" text="Loading content..." />,
  ssr: false,
});

export const metadata = genMetadata('en');

export default function HomePageEN() {
  return (
    <>
      <Hero />
      <Features />
      <Methods />
      <Values />
    </>
  );
}
