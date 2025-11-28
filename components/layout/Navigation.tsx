'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  const menuRef = useRef<HTMLElement>(null);
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

  // Focus trap for mobile menu - Best Practice
  useEffect(() => {
    if (!mobileMenuOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const focusableElements = menu.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    menu.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';

    return () => {
      menu.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Desktop Navigation - Best Practice */}
      <nav 
        className="hidden md:flex items-center gap-1" 
        aria-label="Main navigation"
        role="navigation"
      >
        {navKeys.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'px-4 py-2 text-sm font-semibold text-text-secondary rounded-lg transition-all duration-200 relative',
                'hover:text-text-primary hover:bg-bg-surface/50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base',
                'min-w-[44px] min-h-[44px] flex items-center justify-center',
                isActive && 'text-text-primary bg-bg-surface/70'
              )}
            >
              {t(`nav.${item.key}`)}
              {isActive && (
                <motion.span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  aria-hidden="true"
                />
              )}
            </Link>
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

      {/* Mobile Menu - Best Practice: Full-screen overlay, proper z-index, focus management */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-bg-base/90 backdrop-blur-sm z-[100] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Menu Panel */}
            <motion.nav
              ref={menuRef}
              id="mobile-menu"
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-bg-surface border-l border-border z-[101] md:hidden shadow-xl"
              initial={prefersReducedMotion ? { x: '100%' } : { x: '100%', opacity: 0 }}
              animate={prefersReducedMotion ? { x: 0 } : { x: 0, opacity: 1 }}
              exit={prefersReducedMotion ? { x: '100%' } : { x: '100%', opacity: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0.2 }
                  : { type: 'spring', damping: 25, stiffness: 200 }
              }
              aria-label="Main navigation"
              role="navigation"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-bold text-text-primary">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-w-[44px] min-h-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </Button>
              </div>

              {/* Mobile Menu Items */}
              <div className="px-6 py-4 space-y-2 overflow-y-auto max-h-[calc(100vh-80px)]">
                {navKeys.map((item, idx) => {
                  const isActive = pathname === item.href ||
                    (item.href !== '/' && pathname?.startsWith(item.href));

                  return (
                    <motion.div
                      key={item.key}
                      initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                      transition={prefersReducedMotion ? {} : { delay: idx * 0.05 }}
                    >
                      <Link
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
                    </motion.div>
                  );
                })}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
