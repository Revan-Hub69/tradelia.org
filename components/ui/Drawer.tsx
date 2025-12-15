'use client';

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from '@/lib/i18n/use-translations';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  size = 'md',
}: DrawerProps) {
  const { locale } = useTranslations();

  // Prevent body scroll when drawer is open - Versione ottimizzata e più robusta
  useEffect(() => {
    if (!isOpen) {
      // Ripristina scroll quando si chiude
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
      return;
    }
    
    // Salva scroll position PRIMA di bloccare
    const scrollY = window.scrollY;
    
    // Blocca scroll in modo più semplice e performante
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : '';
    
    return () => {
      // Cleanup sicuro - ripristina scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Responsive design (Rodriguez et al. 2025): Mobile-first breakpoints
  const sizeClasses = {
    sm: side === 'left' || side === 'right' 
      ? 'w-full sm:w-96' 
      : 'h-64 sm:h-96',
    md: side === 'left' || side === 'right' 
      ? 'w-full sm:w-[32rem] md:w-[42rem]' 
      : 'h-96 sm:h-[42rem]',
    lg: side === 'left' || side === 'right' 
      ? 'w-full sm:w-[40rem] md:w-[50rem]' 
      : 'h-[42rem] sm:h-[50rem]',
    xl: side === 'left' || side === 'right' 
      ? 'w-full sm:w-[48rem] md:w-[56rem] lg:w-[60rem]' 
      : 'h-[50rem] sm:h-[56rem] lg:h-[60rem]',
  };

  const getAnimationVariants = () => {
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }

    switch (side) {
      case 'left':
        return {
          initial: { x: '-100%' },
          animate: { x: 0 },
          exit: { x: '-100%' },
        };
      case 'right':
        return {
          initial: { x: '100%' },
          animate: { x: 0 },
          exit: { x: '100%' },
        };
      case 'top':
        return {
          initial: { y: '-100%' },
          animate: { y: 0 },
          exit: { y: '-100%' },
        };
      case 'bottom':
        return {
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' },
        };
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {/* Backdrop - Overlay bloccante */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
        aria-hidden="true"
        style={{ touchAction: 'none' }}
        tabIndex={-1}
      />
      
      {/* Drawer - Z-index sopra header (che di solito è z-50 o z-[100]) */}
      <motion.div
        key="drawer"
        {...getAnimationVariants()}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
          mass: 0.8,
        }}
        className={cn(
          'fixed z-[9999] bg-bg-surface border-border-subtle shadow-2xl',
          'flex flex-col',
          side === 'left' || side === 'right' ? 'top-0 bottom-0' : 'left-0 right-0',
          side === 'left' && 'left-0',
          side === 'right' && 'right-0',
          side === 'top' && 'top-0',
          side === 'bottom' && 'bottom-0',
          side === 'left' || side === 'right' ? 'border-l' : 'border-t',
          sizeClasses[size]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-border-subtle flex-shrink-0">
            <h2
              id="drawer-title"
              className="text-lg font-semibold text-text-primary"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-bg-soft transition-colors text-text-secondary hover:text-text-primary"
              aria-label={locale === 'it' ? 'Chiudi' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content - Scroll smooth e padding ottimizzato */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6">
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
