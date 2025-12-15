'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void; // Azione da eseguire prima di mostrare lo step
}

interface WelcomeTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  storageKey?: string; // Key per localStorage (es. 'welcome-tour-completed')
}

/**
 * Welcome Tour Component
 * Tour guidato per nuovi utenti
 * Riferimento: Norman (2013) - Onboarding, Nielsen (1994) - First-Time Experience
 */
export function WelcomeTour({
  steps,
  onComplete,
  onSkip,
  storageKey = 'welcome-tour-completed',
}: WelcomeTourProps) {
  const { t } = useTranslations();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  // Verifica se il tour è già stato completato
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem(storageKey);
      if (completed === 'true') {
        return; // Tour già completato
      }
      setIsVisible(true);
    }
  }, [storageKey]);

  // Trova e evidenzia elemento corrente
  useEffect(() => {
    if (!isVisible || currentStep >= steps.length) return;

    const step = steps[currentStep];
    if (!step) return;

    // Esegui azione se presente
    if (step.action) {
      step.action();
    }

    // Attendi che l'elemento sia disponibile
    const findElement = () => {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        // Scroll elemento in vista
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Retry dopo 100ms
        setTimeout(findElement, 100);
      }
    };

    findElement();
  }, [currentStep, isVisible, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
    setIsVisible(false);
    onSkip?.();
  };

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible || currentStep >= steps.length) {
    return null;
  }

  const step = steps[currentStep];
  if (!step) return null;

  const stepPosition = step.position || 'bottom';
  const elementRect = highlightedElement?.getBoundingClientRect();

  // Calcola posizione tooltip
  let tooltipStyle: React.CSSProperties = {};
  if (elementRect) {
    switch (stepPosition) {
      case 'top':
        tooltipStyle = {
          position: 'fixed',
          bottom: window.innerHeight - elementRect.top + 20,
          left: elementRect.left + elementRect.width / 2,
          transform: 'translateX(-50%)',
        };
        break;
      case 'bottom':
        tooltipStyle = {
          position: 'fixed',
          top: elementRect.bottom + 20,
          left: elementRect.left + elementRect.width / 2,
          transform: 'translateX(-50%)',
        };
        break;
      case 'left':
        tooltipStyle = {
          position: 'fixed',
          top: elementRect.top + elementRect.height / 2,
          right: window.innerWidth - elementRect.left + 20,
          transform: 'translateY(-50%)',
        };
        break;
      case 'right':
        tooltipStyle = {
          position: 'fixed',
          top: elementRect.top + elementRect.height / 2,
          left: elementRect.right + 20,
          transform: 'translateY(-50%)',
        };
        break;
    }
  }

  return (
    <>
      {/* Overlay scuro - Fix: z-index più basso per non interferire con menu */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9998]"
            onClick={handleSkip}
            style={{ pointerEvents: 'auto' }}
          />
        )}
      </AnimatePresence>

      {/* Highlight elemento - Fix: usa border invece di box-shadow per evitare "quadrato blu" */}
      {highlightedElement && elementRect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: elementRect.top - 4,
            left: elementRect.left - 4,
            width: elementRect.width + 8,
            height: elementRect.height + 8,
            border: '3px solid hsl(var(--accent))',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      {/* Tooltip */}
      {step && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={cn(
            'fixed z-[10000] w-80 bg-bg-soft border-2 border-accent rounded-xl p-6 shadow-2xl',
            stepPosition === 'left' || stepPosition === 'right' ? 'max-w-sm' : 'max-w-md'
          )}
          style={tooltipStyle}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                {step.title}
              </h3>
              <div className="text-xs text-text-tertiary">
                {currentStep + 1} / {steps.length}
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-text-tertiary hover:text-text-primary transition-colors"
              aria-label={t('onboarding.skip') || 'Salta tour'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <p className="text-sm text-text-secondary mb-6">
            {step.content}
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full h-1 bg-bg-surface rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                className="h-full bg-accent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? handleSkip : handlePrevious}
              className="flex items-center gap-2"
            >
              {currentStep === 0 ? (
                <>
                  {t('onboarding.skip') || 'Salta'}
                </>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  {t('onboarding.previous') || 'Precedente'}
                </>
              )}
            </Button>
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {t('onboarding.complete') || 'Completa'}
                </>
              ) : (
                <>
                  {t('onboarding.next') || 'Successivo'}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </>
  );
}

