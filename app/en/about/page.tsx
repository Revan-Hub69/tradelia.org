import { AboutContent } from '@/components/about/AboutContent';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('about', 'en');
}

export default function AboutPage() {
  return <AboutContent />;
}
