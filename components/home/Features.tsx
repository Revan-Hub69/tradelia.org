'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, BookOpen, Shield, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useReducedMotion,
  createContainerVariants,
  createItemVariants,
  createHoverVariants,
} from '@/lib/animations';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';

const featureKeys = ['methodo', 'percorso', 'trasparenza', 'servizi'];
const featureIcons = [CheckCircle2, BookOpen, Shield, Zap];

export function Features() {
  const { t, locale } = useTranslations();
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = createContainerVariants(prefersReducedMotion);
  const itemVariants = createItemVariants(prefersReducedMotion);
  const hoverVariants = createHoverVariants(prefersReducedMotion);

  return (
    <section 
      className="relative py-24 md:py-32 bg-bg-surface overflow-hidden"
      aria-labelledby="features-title"
    >
      {/* Subtle background pattern */}
      <div className="geometric-pattern" aria-hidden="true" />

      {/* Subtle gradient accent */}
      <motion.div
        className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-accent/6 to-transparent rounded-full blur-[60px]"
        animate={
          prefersReducedMotion
            ? {}
            : {
                scale: [1, 1.05, 1],
                opacity: [0.4, 0.5, 0.4],
              }
        }
        transition={
          prefersReducedMotion
            ? {}
            : {
                duration: 20,
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
                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                    <span>{t('home.features.badge')}</span>
                  </Badge>
                  <h2 id="features-title" className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tighter text-text-primary mb-6">
                    {t('home.features.title')}{' '}
                    <span className="gradient-text">{t('home.features.titleHighlight')}</span>
                  </h2>
                  <p className="text-lg md:text-xl text-text-secondary leading-relaxed tracking-tight font-light">
                    {t('home.features.description')}{' '}
                    <strong className="text-text-primary font-medium">
                      {t('home.features.descriptionHighlight')}
                    </strong>{' '}
                    {t('home.features.descriptionEnd')}
                  </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                  variants={containerVariants}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
                >
                  {featureKeys.map((key, idx) => {
                    const Icon = featureIcons[idx];
                    return (
                      <motion.div key={key} variants={itemVariants}>
                        <motion.div variants={hoverVariants} whileHover="hover" whileTap="tap">
                          <Card className="h-full hover:border-border-accent group">
                            <CardHeader>
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-16 h-16 rounded-xl bg-gradient-accent border border-border-accent flex items-center justify-center transition-colors duration-300 group-hover:bg-gradient-primary">
                                  <Icon className="w-8 h-8 text-accent" aria-hidden="true" />
                                </div>
                                {/* Non-chromatic indicator for colorblind accessibility */}
                                <div className="w-2 h-2 rounded-full bg-accent border border-accent" aria-hidden="true" />
                              </div>
                              <CardTitle className="text-xl font-bold text-text-primary" id={`feature-title-${idx}`}>
                                {t(`home.features.items.${key}.title`)}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <CardDescription className="text-base text-text-secondary leading-relaxed font-light" aria-describedby={`feature-title-${idx}`}>
                                {t(`home.features.items.${key}.description`)}
                              </CardDescription>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* CTA */}
                <motion.div variants={itemVariants} className="text-center">
                  <motion.div variants={hoverVariants} whileHover="hover" whileTap="tap">
                    <Button asChild variant="default" size="lg">
                      <Link href={buildLocalePath(locale, '/dashboard#education')}>
                        <span>{t('home.features.cta')}</span>
                        <ArrowRight className="w-5 h-5" aria-hidden="true" />
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
      </motion.div>
    </section>
  );
}
