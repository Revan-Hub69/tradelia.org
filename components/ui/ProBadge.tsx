'use client';

import { useState } from 'react';
import { Crown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

interface ProBadgeProps {
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function ProBadge({ onClick, className, size = 'md', showTooltip = true }: ProBadgeProps) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowModal(true);
    }
  };

  const handleUpgrade = () => {
    setShowModal(false);
    router.push('/pricing');
  };

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1.5',
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-semibold',
          'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500',
          'text-white shadow-md hover:shadow-lg',
          'transition-all duration-200 hover:scale-105',
          'border border-amber-300/50',
          sizeClasses[size],
          className
        )}
        aria-label="Funzionalità Pro - Clicca per maggiori informazioni"
      >
        <Crown className={cn(
          size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-3.5 h-3.5'
        )} />
        <span>Pro</span>
      </button>

      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <div
                className="bg-bg-surface border border-border-subtle rounded-xl shadow-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      Funzionalità Pro
                    </h3>
                    <p className="text-sm text-text-secondary mb-4">
                      Questa funzionalità è disponibile solo per utenti Pro. 
                      Passa a Pro per accedere a strumenti avanzati, analisi approfondite e molto altro.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpgrade}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-colors"
                      >
                        Passa a Pro
                      </button>
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-bg-soft text-text-secondary rounded-lg font-medium hover:bg-bg-surface transition-colors"
                      >
                        Chiudi
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors flex-shrink-0"
                    aria-label="Chiudi"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
