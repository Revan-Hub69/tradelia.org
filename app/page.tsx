import { HomeHero } from '@/components/home/HomeHero';
import { EducationSection } from '@/components/home/EducationSection';
import { MethodSection } from '@/components/home/MethodSection';
import { ValueSection } from '@/components/home/ValueSection';

export const metadata = {
  title: 'Tradelia AI · La Piattaforma di Formazione Finanziaria più Avanzata al Mondo',
  description:
    'Formazione finanziaria gratuita basata su framework AI proprietari verificabili. Percorsi gamificati, materiale didattico completo, conforme MiFID-Safe. Nessun login richiesto.',
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <EducationSection />
      <MethodSection />
      <ValueSection />
    </>
  );
}
