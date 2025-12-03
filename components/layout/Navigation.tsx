'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, BookOpen, GraduationCap, FileText, Users, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from '@/lib/i18n/use-translations';
import { prefetchOnHover } from '@/lib/utils/prefetch';

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
  const [pathname, setPathname] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    // Get pathname only on client
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  // Update pathname on navigation
  useEffect(() => {
    if (!mounted) return;
    
    const handlePathChange = () => {
      setPathname(window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePathChange);
    return () => window.removeEventListener('popstate', handlePathChange);
  }, [mounted]);

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
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen, mounted]);

  const isActive = (href: string) => {
    if (!mounted || !pathname) return false;
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  };

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
          const active = isActive(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              onMouseEnter={() => prefetchOnHover(item.href)}
              className={cn(
                'px-4 py-2 text-sm font-semibold text-text-secondary rounded-lg transition-all duration-200 relative',
                'hover:text-text-primary hover:bg-bg-surface/60 hover:shadow-sm hover:-translate-y-0.5',
                'active:scale-[0.98] active:bg-bg-surface/80',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base',
                'min-w-[44px] min-h-[44px] flex items-center justify-center gap-2',
                'group',
                active && 'text-text-primary bg-bg-surface/70 shadow-sm'
              )}
            >
              <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
              <span className="relative z-10">{t(`nav.${item.key}`)}</span>
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-accent-hover" />
              )}
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" aria-hidden="true" />
            </Link>
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
        {mobileMenuOpen ? (
          <X className="w-5 h-5 transition-transform duration-200" aria-hidden="true" />
        ) : (
          <Menu className="w-5 h-5 transition-transform duration-200" aria-hidden="true" />
        )}
      </Button>

      {/* Mobile Menu - Horizontal Scrollable with Icons */}
      {mounted && mobileMenuOpen && (
        <div
          className="md:hidden fixed top-16 left-0 right-0 bg-bg-surface border-b border-border-subtle shadow-lg z-40 overflow-x-auto"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <nav 
            className="flex items-center gap-2 px-4 py-3 min-w-max"
            role="navigation"
            aria-label="Main navigation"
          >
            {navKeys.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  onMouseEnter={() => prefetchOnHover(item.href)}
                  className={cn(
                    'px-4 py-2 text-sm font-semibold whitespace-nowrap rounded-lg transition-all duration-200',
                    'min-h-[44px] flex items-center justify-center gap-2',
                    'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                    'group hover:scale-105',
                    active
                      ? 'text-text-primary bg-bg-elevated shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                  <span>{t(`nav.${item.key}`)}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
