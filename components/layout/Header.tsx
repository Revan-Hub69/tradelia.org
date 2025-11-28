'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Navigation } from './Navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';
import { useReducedMotion, createSlideInVariants } from '@/lib/animations';

export function Header() {
  const prefersReducedMotion = useReducedMotion();
  const slideVariants = createSlideInVariants(prefersReducedMotion);

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-border-subtle glass supports-[backdrop-filter]:bg-bg-glass"
      initial={prefersReducedMotion ? { opacity: 0 } : { y: -100, opacity: 0 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.01 }
          : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <div className="container flex h-16 items-center justify-between px-8">
        <Link
          href="/"
          className="flex items-center gap-3 group transition-smooth hover:-translate-y-0.5"
          aria-label="Tradelia AI - Home"
        >
          <div className="relative">
            <Image
              src="/logos/tradelia-logo.svg"
              alt="Tradelia AI"
              width={200}
              height={50}
              className="h-10 w-auto brightness-95 drop-shadow-[0_0_10px_rgba(88,166,255,0.15)] transition-smooth group-hover:brightness-100 group-hover:drop-shadow-[0_0_15px_rgba(88,166,255,0.25)] group-hover:scale-105"
              priority
              loading="eager"
            />
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full" />
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <motion.div variants={slideVariants} initial="hidden" animate="visible" className="flex items-center">
            <Navigation />
          </motion.div>
          <Button asChild variant="secondary" size="sm" className="hidden md:flex group">
            <Link href="/dashboard" aria-label="Vai alla dashboard gratuita">
              <LayoutDashboard className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </Button>
          <Button asChild variant="default" size="sm" className="hidden lg:inline-flex">
            <Link href="/contact" aria-label="Parla con il team indipendente">
              Contatti
            </Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
