import { HomeHero } from '@/components/home/HomeHero';
import { EducationSection } from '@/components/home/EducationSection';
import { MethodSection } from '@/components/home/MethodSection';
import { ValueSection } from '@/components/home/ValueSection';

export const metadata = {
  title: 'Tradelia AI · Formazione Finanziaria Gratuita',
  description:
    'Formazione finanziaria gratuita basata su framework AI proprietari verificabili. Percorsi formativi completi, materiale didattico conforme agli standard accademici internazionali e alle normative MiFID II.',
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
