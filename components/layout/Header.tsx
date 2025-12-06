'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
// LanguageToggle removed - system always uses Italian
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';
import { useReducedMotion } from '@/lib/animations';
import { useTranslations } from '@/lib/i18n/use-translations';
import { prefetchOnHover } from '@/lib/utils/prefetch';
import { CurrencySwitch } from '@/components/ui/CurrencySwitch';
import { useIsClient } from '@/lib/hooks/useIsClient';

export function Header() {
  const { t } = useTranslations();
  const prefersReducedMotion = useReducedMotion();
  const isClient = useIsClient();

  // Non renderizzare animazioni fino a quando non siamo sul client (previene hydration mismatch)
  if (!isClient) {
    return (
      <header
        className="sticky top-0 z-50 w-full border-b border-border-subtle glass supports-[backdrop-filter]:bg-bg-glass"
        suppressHydrationWarning
      >
        <div className="container flex h-16 items-center justify-between px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Tradelia AI - Home"
          >
            <Image
              src="/logos/tradelia-logo.svg"
              alt="Tradelia AI"
              width={200}
              height={50}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">{t('header.dashboard')}</span>
              </Link>
            </Button>
            <NotificationBell />
            <CurrencySwitch size="sm" />
          </div>
        </div>
      </header>
    );
  }

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
      suppressHydrationWarning
    >
      <div className="container flex h-16 items-center justify-between px-8">
        <Link
          href="/"
          className="flex items-center gap-3 group transition-all duration-300 hover:-translate-y-0.5"
          aria-label="Tradelia AI - Home"
        >
          <div className="relative">
            <Image
              src="/logos/tradelia-logo.svg"
              alt="Tradelia AI"
              width={200}
              height={50}
              className="h-10 w-auto brightness-95 drop-shadow-[0_0_10px_rgba(59,130,246,0.15)] transition-all duration-300 group-hover:brightness-100 group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.25)] group-hover:scale-105"
              priority
              loading="eager"
            />
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent-hover transition-all duration-300 group-hover:w-full" />
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {/* Dashboard Button */}
          <Button 
            asChild 
            variant="secondary" 
            size="sm" 
            className="group"
          >
            <Link 
              href="/dashboard"
              aria-label={t('header.dashboardAria')}
              onMouseEnter={() => prefetchOnHover('/dashboard')}
            >
              <LayoutDashboard className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t('header.dashboard')}</span>
            </Link>
          </Button>
          
          {/* Notification Bell - solo se siamo nella dashboard */}
          <NotificationBell />
          
          {/* Currency Switch */}
          <CurrencySwitch size="sm" />
        </div>
      </div>
    </motion.header>
  );
}
