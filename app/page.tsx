import Link from 'next/link';
import Image from 'next/image';
import { HomeHero } from '@/components/home/HomeHero';
import { MethodSection } from '@/components/home/MethodSection';
import { AudienceSection } from '@/components/home/AudienceSection';
import { ValueSection } from '@/components/home/ValueSection';
import { ServicesSection } from '@/components/home/ServicesSection';

export const metadata = {
  title: 'Tradelia AI · progetto indipendente di analisi sui mercati',
  description:
    'Tradelia AI offre un campus formativo gratuito sui mercati finanziari con percorsi gamificati basati su framework AI proprietari (FDM, MLT, PAC). Dashboard PWA installabile, nessun login richiesto.',
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <MethodSection />
      <AudienceSection />
      <ValueSection />
      <ServicesSection />
    </>
  );
}
