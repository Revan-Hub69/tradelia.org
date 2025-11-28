'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, ArrowRight, LayoutDashboard, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  useReducedMotion,
  createContainerVariants,
  createItemVariants,
  createFloatVariants,
  createGradientPulse,
  createHoverVariants,
} from '@/lib/animations';
import { useTranslations } from '@/lib/i18n/use-translations';

export function Hero() {
  const { t } = useTranslations();
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = createContainerVariants(prefersReducedMotion);
  const itemVariants = createItemVariants(prefersReducedMotion);
  const hoverVariants = createHoverVariants(prefersReducedMotion);
  const floatVariants = createFloatVariants(prefersReducedMotion);
  const gradientPulsePrimary = createGradientPulse(prefersReducedMotion);
  const gradientPulseSecondary = createGradientPulse(prefersReducedMotion);

  const stats = [
    { value: t('hero.stat1'), label: t('hero.stat1Label'), delay: 0.35, icon: Sparkles },
    { value: t('hero.stat2'), label: t('hero.stat2Label'), delay: 0.45, icon: TrendingUp },
    { value: t('hero.stat3'), label: t('hero.stat3Label'), delay: 0.55, icon: BookOpen },
  ];

  return (
    <section 
      className="relative min-h-[90vh] flex items-center overflow-hidden bg-bg-base py-24 md:py-32"
      aria-labelledby="hero-title"
    >
      {/* Animated background gradients - Research-based */}
      {/* Subtle static background gradients */}
      <motion.div
        className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-accent/20 via-accent/5 to-transparent rounded-full blur-[90px]"
        animate={gradientPulsePrimary}
        aria-hidden="true"
      />
      <motion.div
        className="absolute -bottom-1/3 -left-1/10 w-[650px] h-[650px] bg-gradient-to-br from-accent/10 via-transparent to-transparent rounded-full blur-[80px]"
        animate={{
          ...gradientPulseSecondary,
          scale: prefersReducedMotion ? [1] : [1, 1.15, 1],
          opacity: prefersReducedMotion ? [0.25] : [0.25, 0.45, 0.25],
        }}
        aria-hidden="true"
      />

      {/* Geometric pattern - Academic and refined */}
      <div className="geometric-pattern" aria-hidden="true" />
      <div className="hero-geometric" aria-hidden="true" />
      
      {/* Additional geometric accents for depth - Enhanced and Visible */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-64 h-64 opacity-[0.3] pointer-events-none z-[1]"
        aria-hidden="true"
        animate={floatVariants.animate}
      >
        <div className="absolute inset-0 border-2 border-accent/60 rounded-full" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      </motion.div>
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-52 h-52 opacity-[0.25] pointer-events-none z-[1]"
        aria-hidden="true"
        animate={floatVariants.animate}
        transition={{ ...floatVariants.animate?.transition, delay: 2 }}
      >
        <div className="absolute inset-0 border-2 border-accent/50" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }} />
      </motion.div>
      {/* Additional geometric lines for structure */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent z-[1]" aria-hidden="true" />
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-accent/25 to-transparent z-[1]" aria-hidden="true" />

      {/* Grid pattern overlay - Visible academic texture */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none z-[1]" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.35) 1px, transparent 1px),
              linear-gradient(90deg, rgba(37, 99, 235, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ position: 'relative', zIndex: 10 }}
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <Badge variant="default" className="mb-8">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>{t('hero.badge')}</span>
          </Badge>
        </motion.div>

        {/* Title - Enhanced typography and animation */}
        <motion.h1
          id="hero-title"
          variants={itemVariants}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tighter text-text-primary mb-6 max-w-5xl mx-auto"
        >
          {t('hero.title')}{' '}
          <span className="gradient-text relative inline-block">
            {t('hero.titleHighlight')}
          </span>
        </motion.h1>

        {/* Description - Enhanced readability */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl lg:text-2xl leading-relaxed text-text-secondary mb-10 max-w-3xl mx-auto tracking-tight font-light"
        >
          {t('hero.description')}
        </motion.p>

        {/* Stats - Enhanced with icons and better layout */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 mb-12 max-w-3xl mx-auto py-12 border-y border-border-subtle relative"
        >
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-primary opacity-5 -translate-y-1/2" />
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                className="flex flex-col gap-3 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay, duration: 0.6 }}
                variants={hoverVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent" aria-hidden="true" />
                  </div>
                </div>
                <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold gradient-text leading-none tracking-tighter">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-text-muted uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Buttons - Enhanced with better spacing */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <motion.div variants={hoverVariants} whileHover="hover" whileTap="tap">
            <Button asChild variant="default" size="lg">
              <Link href="/dashboard#education">
                <span>{t('hero.ctaPrimary')}</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </Button>
          </motion.div>
          <motion.div variants={hoverVariants} whileHover="hover" whileTap="tap">
            <Button asChild variant="secondary" size="lg">
              <Link href="/dashboard">
                <span>Dashboard</span>
                <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Disclaimer - Enhanced card design */}
        <motion.div variants={itemVariants}>
          <Card variant="academic" className="max-w-4xl mx-auto text-left">
            <div className="flex items-start gap-5 p-6 md:p-8">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-5 h-5 rounded-full bg-accent-muted flex items-center justify-center ring-2 ring-accent/20">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
              </div>
                      <p className="text-sm md:text-base text-text-secondary leading-relaxed tracking-tight m-0 font-light">
                        {t('hero.disclaimer')}{' '}
                        <strong className="text-text-primary font-medium">{t('hero.mifid')}</strong>{' '}
                        {t('hero.disclaimerEnd')}
                      </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </section>
  );
}
