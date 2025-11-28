'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, BookOpen, Shield, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const features = [
  {
    icon: CheckCircle2,
    title: 'Percorsi Gamificati',
    description:
      'Assessment strutturati, tutorial interattivi, quiz di verifica e sistema di badge per un apprendimento coinvolgente e progressivo.',
  },
  {
    icon: BookOpen,
    title: 'Materiale Didattico Completo',
    description:
      'Documentazione accademica completa con fonti verificabili, ipotesi esplicitate e limiti metodologici documentati per trasparenza totale.',
  },
  {
    icon: Shield,
    title: 'Conforme MiFID II',
    description:
      'Materiale educativo conforme alle regole MiFID II e agli standard accademici internazionali per formazione professionale certificata.',
  },
  {
    icon: Zap,
    title: 'Accesso Immediato',
    description:
      'Nessuna registrazione richiesta, accesso immediato a tutti i contenuti formativi. Inizia la tua formazione in pochi secondi.',
  },
];

export function Features() {
  return (
    <section className="relative py-24 md:py-32 bg-bg-surface overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_40px,rgba(255,255,255,0.008)_40px,rgba(255,255,255,0.008)_41px)] animate-pattern-shift" />
      </div>

      {/* Subtle gradient accent */}
      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-accent/6 to-transparent rounded-full blur-[60px]" />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        {/* Section Header */}
        <motion.div
          variants={itemVariants}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge variant="default" className="mb-6">
            <BookOpen className="w-4 h-4" />
            <span>Formazione</span>
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tighter text-text-primary mb-6">
            Formazione Finanziaria di{' '}
            <span className="gradient-text">Livello Accademico</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed tracking-tight font-light">
            Percorsi formativi completi basati su{' '}
            <strong className="text-text-primary font-medium">
              framework AI proprietari verificabili
            </strong>{' '}
            e metodologie documentate. Conforme agli standard accademici internazionali e alle normative MiFID II.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="h-full group">
                  <CardHeader>
                    <div className="w-16 h-16 rounded-xl bg-gradient-accent border border-border-accent flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-gradient-primary group-hover:border-accent group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-glow">
                      <Icon className="w-8 h-8 text-accent transition-colors duration-300 group-hover:text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-text-primary">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-text-secondary leading-relaxed font-light">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div variants={itemVariants} className="text-center">
          <Button asChild variant="default" size="lg" className="group">
            <Link href="/dashboard#education">
              <span>Esplora i Percorsi Formativi</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
