'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X, LayoutDashboard, Building2, BookOpen, GraduationCap, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from '@/lib/i18n/use-translations';

const navKeys = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'brokers', href: '/brokers', icon: Building2 },
  { key: 'manifesto', href: '/about', icon: BookOpen },
  { key: 'percorso', href: '/dashboard#education', icon: GraduationCap },
  { key: 'serviziPro', href: '/services', icon: FileText },
  { key: 'documentazione', href: '/docs', icon: FileText },
  { key: 'community', href: '/community', icon: Users },
];

export function Navigation() {
  const { t } = useTranslations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    if (!mounted) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen, mounted]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (!mounted) return;
    
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, mounted]);

  if (!mounted) {
    // Return static version during SSR to avoid hydration mismatch
    return (
      <>
        <nav 
          className="hidden md:flex items-center gap-1"
          role="navigation"
          aria-label="Main navigation"
        >
          {navKeys.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="px-4 py-2 text-sm font-semibold text-text-secondary rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden min-w-[44px] min-h-[44px]"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </Button>
      </>
    );
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav 
        className="hidden md:flex items-center gap-1"
        role="navigation"
        aria-label="Main navigation"
      >
        {navKeys.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <motion.div
              key={item.key}
              whileHover={{ y: -1 }}
              whileTap={{ y: 0, scale: 0.98 }}
            >
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'px-4 py-2 text-sm font-semibold text-text-secondary rounded-lg transition-all duration-200 relative',
                  'hover:text-text-primary hover:bg-bg-surface/60 hover:shadow-sm',
                  'active:scale-[0.98] active:bg-bg-surface/80',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base',
                  'min-w-[44px] min-h-[44px] flex items-center justify-center gap-2',
                  'group',
                  isActive && 'text-text-primary bg-bg-surface/70 shadow-sm'
                )}
              >
                <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                <span className="relative z-10">{t(`nav.${item.key}`)}</span>
                {isActive && (
                  <motion.span
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary"
                    layoutId="activeTab"
                  />
                )}
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" aria-hidden="true" />
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden min-w-[44px] min-h-[44px]"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileMenuOpen}
      >
        <motion.div
          animate={mobileMenuOpen ? { rotate: 90 } : { rotate: 0 }}
          transition={{ duration: 0.2 }}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Menu className="w-5 h-5" aria-hidden="true" />
          )}
        </motion.div>
      </Button>

      {/* Mobile Menu - Horizontal Scrollable with Icons */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="md:hidden fixed top-16 left-0 right-0 bg-bg-surface border-b border-border-subtle shadow-lg z-40 overflow-x-auto"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <nav 
            className="flex items-center gap-2 px-4 py-3 min-w-max"
            role="navigation"
            aria-label="Main navigation"
          >
            {navKeys.map((item, idx) => {
              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname?.startsWith(item.href));

              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'px-4 py-2 text-sm font-semibold whitespace-nowrap rounded-lg transition-all duration-200',
                      'min-h-[44px] flex items-center justify-center gap-2',
                      'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                      'group',
                      isActive
                        ? 'text-text-primary bg-bg-elevated shadow-sm'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                    <span>{t(`nav.${item.key}`)}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </motion.div>
      )}
    </>
  );
}
