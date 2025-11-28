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
import { useTranslations } from '@/lib/i18n/use-translations';

const valueKeys = ['libero', 'verificabile', 'aperta', 'etica'];
const valueIcons = [DollarSign, CheckCircle2, Smartphone, Shield];

const values = [
  {
    icon: DollarSign,
    title: 'Accesso libero',
    description:
      'Il progetto resta gratuito per sempre. I servizi pro finanziano ricerca e infrastruttura, senza paywall sul percorso base.',
  },
  {
    icon: CheckCircle2,
    title: 'Metodo verificabile',
    description:
      'Ogni ipotesi, limite e fonte è pubblica. Gli utenti possono replicare i nostri risultati o proporre miglioramenti.',
  },
  {
    icon: Smartphone,
    title: 'Tecnologia aperta',
    description:
      'Dashboard PWA installabile, API documentate e componenti riusabili per integrare i modelli nel proprio stack.',
  },
  {
    icon: Shield,
    title: 'Etica e compliance',
    description:
      'Materiale educativo conforme alle normative europee e audit continuo su bias, privacy e responsabilità dell’AI.',
  },
];

export function Values() {
  const { t } = useTranslations();
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
            <span>{t('home.values.badge')}</span>
          </Badge>
          <h2 id="values-title" className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tighter text-text-primary mb-6">
            {t('home.values.title')}{' '}
            <span className="gradient-text">{t('home.values.titleHighlight')}</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed tracking-tight font-light">
            {t('home.values.description')}{' '}
            <strong className="text-text-primary font-medium">
              {t('home.values.descriptionHighlight')}
            </strong>{' '}
            {t('home.values.descriptionEnd')}
          </p>
        </motion.div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {valueKeys.map((key, idx) => {
                    const Icon = valueIcons[idx];
                    return (
                      <motion.div key={key} variants={itemVariants}>
                        <motion.div
                          variants={hoverVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Card className="h-full text-center group hover:border-border-accent">
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
                                {t(`home.values.items.${key}.title`)}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <CardDescription className="text-base text-text-secondary leading-relaxed font-light" aria-describedby={`value-title-${idx}`}>
                                {t(`home.values.items.${key}.description`)}
                              </CardDescription>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
      </motion.div>
    </section>
  );
}
