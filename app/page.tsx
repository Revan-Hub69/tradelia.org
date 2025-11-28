import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { Methods } from '@/components/home/Methods';
import { Values } from '@/components/home/Values';
import { generateMetadata as genMetadata } from '@/lib/seo/metadata';

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
