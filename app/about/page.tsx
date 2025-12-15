import { AboutContent } from '@/components/about/AboutContent';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('about', 'it');
}

export default function AboutPage() {
  return <AboutContent />;
}
