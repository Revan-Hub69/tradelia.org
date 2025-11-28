'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from '@/lib/i18n/use-translations';

const navKeys = [
  { key: 'manifesto', href: '/about' },
  { key: 'percorso', href: '/dashboard#education' },
  { key: 'serviziPro', href: '/services' },
  { key: 'documentazione', href: '/docs' },
  { key: 'community', href: '/community' },
];

export function Navigation() {
  const { t } = useTranslations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Desktop Navigation - Best Practice with Elegant Effects */}
      <nav 
        className="hidden md:flex items-center gap-1" 
        aria-label="Main navigation"
        role="navigation"
      >
        {navKeys.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <motion.div
              key={item.key}
              whileHover={{ y: -1 }}
              whileTap={{ y: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'px-4 py-2 text-sm font-semibold text-text-secondary rounded-lg transition-all duration-200 relative',
                  'hover:text-text-primary hover:bg-bg-surface/60 hover:shadow-sm',
                  'active:scale-[0.98] active:bg-bg-surface/80',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base',
                  'min-w-[44px] min-h-[44px] flex items-center justify-center',
                  'group',
                  isActive && 'text-text-primary bg-bg-surface/70 shadow-sm'
                )}
              >
                <span className="relative z-10">{t(`nav.${item.key}`)}</span>
                {isActive && (
                  <motion.span
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    aria-hidden="true"
                  />
                )}
                {/* Hover underline effect */}
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" aria-hidden="true" />
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Mobile Menu Button - Best Practice: 44x44px touch target */}
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="md:hidden min-w-[44px] min-h-[44px]"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
      >
        {mobileMenuOpen ? (
          <X className="w-5 h-5" aria-hidden="true" />
        ) : (
          <Menu className="w-5 h-5" aria-hidden="true" />
        )}
      </Button>

      {/* Mobile Menu - Simple dropdown under header - Best Practice */}
      <div
        className={cn(
          'md:hidden fixed top-16 left-0 right-0 bg-bg-surface border-b border-border-subtle shadow-xl z-40',
          'transition-all duration-300 ease-in-out overflow-hidden',
          mobileMenuOpen 
            ? 'max-h-screen opacity-100' 
            : 'max-h-0 opacity-0 pointer-events-none'
        )}
        id="mobile-menu"
        ref={menuRef}
        aria-hidden={!mobileMenuOpen}
      >
        <nav 
          className="px-4 py-4 space-y-1"
          role="navigation"
          aria-label="Main navigation"
        >
          {navKeys.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200',
                  'min-h-[44px] flex items-center',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-surface',
                  isActive
                    ? 'text-text-primary bg-bg-elevated'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
