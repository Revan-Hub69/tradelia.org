'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, Grid3x3, CircleDot, ArrowRight, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useReducedMotion,
  createContainerVariants,
  createItemVariants,
  createHoverVariants,
} from '@/lib/animations';
import { useTranslations } from '@/lib/i18n/use-translations';

const methodKeys = ['fdm', 'mlt', 'pac'];
const methodIcons = [TrendingUp, Grid3x3, CircleDot];

export function Methods() {
  const { t } = useTranslations();
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = createContainerVariants(prefersReducedMotion);
  const itemVariants = createItemVariants(prefersReducedMotion);
  const hoverVariants = createHoverVariants(prefersReducedMotion);

  return (
    <section
      className="relative py-24 md:py-32 bg-bg-base overflow-hidden"
      aria-labelledby="methods-title"
    >
      {/* Subtle background pattern */}
      <div className="geometric-pattern" aria-hidden="true" />

      {/* Subtle gradient accent */}
      <motion.div
        className="absolute bottom-10 left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-accent/5 to-transparent rounded-full blur-[70px]"
        animate={
          prefersReducedMotion
            ? {}
            : {
                scale: [1, 1.08, 1],
                opacity: [0.3, 0.4, 0.3],
              }
        }
        transition={
          prefersReducedMotion
            ? {}
            : {
                duration: 25,
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
        <motion.div
          variants={itemVariants}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge variant="default" className="mb-6">
            <Grid3x3 className="w-4 h-4" aria-hidden="true" />
            <span>{t('home.methods.badge')}</span>
          </Badge>
          <h2 id="methods-title" className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tighter text-text-primary mb-6">
            {t('home.methods.title')}{' '}
            <span className="gradient-text">{t('home.methods.titleHighlight')}</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed tracking-tight font-light">
            {t('home.methods.description')}
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {methodKeys.map((key, idx) => {
            const Icon = methodIcons[idx];
            const acronym = key.toUpperCase();
            return (
              <motion.div key={key} variants={itemVariants}>
                <motion.div variants={hoverVariants} whileHover="hover" whileTap="tap">
                  <Card className="h-full hover:border-border-accent group">
                    <CardHeader>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-accent-hover border border-border-accent flex items-center justify-center flex-shrink-0">
                            <Icon className="w-8 h-8 text-white" aria-hidden="true" />
                          </div>
                          {/* Non-chromatic indicator - shape varies by method */}
                          <div
                            className={
                              idx === 0
                                ? 'w-3 h-3 rounded-full border-2 border-accent bg-accent'
                                : idx === 1
                                ? 'w-3 h-3 rotate-45 border-2 border-accent bg-accent'
                                : 'w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-accent'
                            }
                            aria-hidden="true"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold gradient-text uppercase tracking-widest mb-1">
                            {acronym}
                          </div>
                          <CardTitle className="text-xl font-bold text-text-primary leading-tight" id={`method-title-${key}`}>
                            {t(`home.methods.items.${key}.title`)}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{t(`home.methods.items.${key}.description`)}</CardDescription>
                      <ul className="space-y-3 mb-6">
                        {(t(`home.methods.items.${key}.features`) as string[]).map((feature: string, fIdx: number) => (
                          <li
                            key={fIdx}
                            className="flex items-center gap-3 text-sm text-text-secondary"
                          >
                            <Check className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
                            <span className="font-light">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/dashboard#education"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover transition-colors duration-200"
                      >
                        <span>{t('home.methods.cta')}</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
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
