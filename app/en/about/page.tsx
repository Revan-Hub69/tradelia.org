import { Metadata } from 'next';
import { AboutContent } from '@/components/about/AboutContent';

export const metadata: Metadata = {
  title: 'About Us · Tradelia',
  description: 'Discover Tradelia: an independent lab that combines proprietary AI frameworks and academic methodology for financial research.',
};

export default function AboutPage() {
  return <AboutContent />;
}
