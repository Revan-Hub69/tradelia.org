import { Metadata } from 'next';
import { AboutContent } from '@/components/about/AboutContent';

export const metadata: Metadata = {
  title: 'Chi Siamo · Tradelia',
  description: 'Scopri Tradelia: un laboratorio indipendente che unisce framework AI proprietari e metodo accademico per la ricerca finanziaria.',
};

export default function AboutPage() {
  return <AboutContent />;
}
