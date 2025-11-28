import { Hero, Features, Methods, Values } from '@/components/home';
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
