import { Hero, Features, Methods, Values } from '@/components/home';

export const metadata = {
  title: 'Tradelia AI · Formazione Finanziaria Gratuita',
  description:
    'Formazione finanziaria gratuita basata su framework AI proprietari verificabili. Percorsi formativi completi, materiale didattico conforme agli standard accademici internazionali e alle normative MiFID II.',
};

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
