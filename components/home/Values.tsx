'use client';

import { motion } from 'framer-motion';
import { DollarSign, CheckCircle2, Smartphone, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import {
  useReducedMotion,
  createContainerVariants,
  createItemVariants,
  createHoverVariants,
} from '@/lib/animations';

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
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = createContainerVariants(prefersReducedMotion);
  const itemVariants = createItemVariants(prefersReducedMotion);
  const hoverVariants = createHoverVariants(prefersReducedMotion);

  return (
    <section 
      className="relative py-24 md:py-32 bg-bg-surface border-t border-border overflow-hidden"
      aria-labelledby="values-title"
    >
      {/* Subtle background pattern */}
      <div className="geometric-pattern" aria-hidden="true" />

      {/* Subtle gradient accent */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-accent/4 to-transparent rounded-full blur-[80px]"
        animate={
          prefersReducedMotion
            ? {}
            : {
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.7, 0.5],
              }
        }
        transition={
          prefersReducedMotion
            ? {}
            : {
                duration: 15,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
        aria-hidden="true"
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
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>Valori</span>
          </Badge>
          <h2 id="values-title" className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tighter text-text-primary mb-6">
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
                  <Card className="h-full text-center">
                    <CardHeader>
                      <div className="flex flex-col items-center gap-3 mb-6">
                        <div
                          className="w-20 h-20 rounded-2xl bg-gradient-accent border border-border-accent flex items-center justify-center"
                          aria-hidden="true"
                        >
                          <Icon className="w-10 h-10 text-accent" aria-hidden="true" />
                        </div>
                        {/* Non-chromatic indicator - different shapes for each value */}
                        <div 
                          className={cn(
                            idx === 0 && 'w-3 h-3 rounded-full border-2 border-accent bg-accent',
                            idx === 1 && 'w-3 h-3 border-2 border-accent bg-accent',
                            idx === 2 && 'w-3 h-3 rotate-45 border-2 border-accent bg-accent',
                            idx === 3 && 'w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-accent'
                          )}
                          aria-hidden="true"
                        />
                      </div>
                      <CardTitle className="text-xl font-bold text-text-primary" id={`value-title-${idx}`}>
                        {value.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-text-secondary leading-relaxed font-light" aria-describedby={`value-title-${idx}`}>
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
