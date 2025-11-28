'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { label: 'Home', href: '/', key: 'home' },
  { label: 'Dashboard', href: '/dashboard', key: 'dashboard' },
  {
    label: 'Formazione',
    href: '/dashboard#education',
    key: 'education',
  },
  { label: 'Chi Siamo', href: '/about', key: 'about' },
  { label: 'Contatti', href: '/contact', key: 'contact' },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'px-4 py-2 text-sm font-medium text-text-secondary rounded-lg transition-all duration-300 relative group',
                isActive && 'text-text-primary',
                'hover:text-text-primary hover:bg-bg-surface'
              )}
            >
              {item.label}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-bg-base/80 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              className="fixed top-16 left-0 right-0 bg-bg-surface border-b border-border z-50 md:hidden"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="container px-8 py-6 space-y-4">
                {navItems.map((item, idx) => {
                  const isActive = pathname === item.href;
                  
                  return (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'block px-4 py-3 text-base font-medium rounded-lg transition-all duration-300',
                          isActive
                            ? 'text-text-primary bg-bg-elevated'
                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                        )}
                      >
                        {item.label}
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
