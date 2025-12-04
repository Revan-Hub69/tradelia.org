'use client';

import { Clock, Zap, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ComingSoonProps {
  title: string;
  description?: string;
  reason?: string;
  estimatedDate?: string;
}

/**
 * Coming Soon Component
 * Mostra un messaggio per funzionalità in arrivo
 */
export function ComingSoon({ 
  title, 
  description,
  reason = 'Questa funzionalità richiede integrazione con API real-time per prezzi di mercato.',
  estimatedDate 
}: ComingSoonProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-6"
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
            <Clock className="w-10 h-10 text-accent" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-text-secondary text-sm sm:text-base">
              {description}
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                In Arrivo
              </h3>
              <p className="text-sm text-text-secondary">
                {reason}
              </p>
            </div>
          </div>

          {estimatedDate && (
            <div className="flex items-start gap-3 pt-3 border-t border-border-subtle">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Stima disponibilità:</strong> {estimatedDate}
                </p>
              </div>
            </div>
          )}

          {/* Alternative */}
          <div className="pt-3 border-t border-border-subtle">
            <p className="text-xs text-text-tertiary">
              <strong className="text-text-primary">Nel frattempo:</strong> Puoi utilizzare i nostri{' '}
              <strong className="text-accent">12 strumenti finanziari avanzati</strong> disponibili nella sezione Utilities.
              Tutti completamente gratuiti e funzionanti senza dipendenze esterne.
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Cosa troverai quando sarà disponibile:
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-accent mt-1">✓</span>
              <span>Monitoraggio real-time dei tuoi asset preferiti</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-accent mt-1">✓</span>
              <span>Alert personalizzati per target di prezzo</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-accent mt-1">✓</span>
              <span>Gestione portfolio con aggiornamenti automatici</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-accent mt-1">✓</span>
              <span>Analisi performance e statistiche avanzate</span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
