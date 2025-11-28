'use client';

import { motion } from 'framer-motion';
import { DollarSign, CheckCircle2, Smartphone, Shield } from 'lucide-react';
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

const values = [
  {
    icon: DollarSign,
    title: 'Gratuito',
    description:
      'Nessun costo nascosto, completamente gratuito e accessibile a tutti. Formazione di qualità senza barriere economiche.',
  },
  {
    icon: CheckCircle2,
    title: 'Verificabile',
    description:
      'Metodologie documentate con fonti accademiche, ipotesi esplicitate e limiti metodologici completamente trasparenti.',
  },
  {
    icon: Smartphone,
    title: 'PWA Installabile',
    description:
      'Dashboard installabile, funziona offline, accesso immediato da qualsiasi dispositivo. Tecnologia all\'avanguardia.',
  },
  {
    icon: Shield,
    title: 'MiFID-Safe',
    description:
      'Materiale educativo conforme alle regole MiFID II e agli standard accademici internazionali per formazione professionale certificata.',
  },
];

export function Values() {
  return (
    <section className="relative py-24 md:py-32 bg-bg-surface border-t border-border overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_60px,rgba(255,255,255,0.008)_60px,rgba(255,255,255,0.008)_61px),repeating-linear-gradient(90deg,transparent,transparent_60px,rgba(255,255,255,0.008)_60px,rgba(255,255,255,0.008)_61px)] animate-pattern-shift" />
      </div>

      {/* Subtle gradient accent */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-accent/4 to-transparent rounded-full blur-[80px]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

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
            <CheckCircle2 className="w-4 h-4" />
            <span>Valori</span>
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tighter text-text-primary mb-6">
            Perché <span className="gradient-text">Tradelia AI</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed tracking-tight font-light">
            La piattaforma di formazione finanziaria più{' '}
            <strong className="text-text-primary font-medium">
              avanzata, accessibile e trasparente
            </strong>{' '}
            al mondo. Conforme agli standard accademici internazionali.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, idx) => {
            const Icon = value.icon;
            return (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="h-full text-center group">
                  <CardHeader>
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-accent border border-border-accent flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-gradient-primary group-hover:border-accent group-hover:scale-115 group-hover:rotate-12 group-hover:shadow-glow">
                      <Icon className="w-10 h-10 text-accent transition-colors duration-300 group-hover:text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-text-primary">
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-text-secondary leading-relaxed font-light">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
