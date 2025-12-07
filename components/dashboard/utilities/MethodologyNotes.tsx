'use client';

import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MethodologyNotesProps {
  toolName: string;
  formulas: Array<{ name: string; formula: string; description: string }>;
  assumptions: string[];
  references: string[];
  version: string;
  lastUpdated: string;
}

/**
 * Methodology Notes Component
 * Mostra note metodologiche, formule e riferimenti per audit
 */
export function MethodologyNotes({
  toolName,
  formulas,
  assumptions,
  references,
  version,
  lastUpdated,
}: MethodologyNotesProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-bg-soft border border-border-subtle rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-bg-surface transition-colors"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-400" />
          <div className="text-left">
            <h3 className="text-sm font-semibold text-text-primary">Note Metodologiche</h3>
            <p className="text-xs text-text-secondary">Formule, assunzioni e riferimenti per audit</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-text-secondary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-secondary" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-border-subtle p-4 space-y-4">
          {/* Version Info */}
          <div className="flex items-center justify-between text-xs text-text-secondary pb-2 border-b border-border-subtle">
            <span>Versione: {version}</span>
            <span>Aggiornato: {lastUpdated}</span>
          </div>

          {/* Formulas */}
          {formulas.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2">Formule Utilizzate</h4>
              <div className="space-y-3">
                {formulas.map((formula, idx) => (
                  <div key={idx} className="bg-bg-surface border border-border-subtle rounded-lg p-3">
                    <div className="text-xs font-medium text-text-secondary mb-1">{formula.name}</div>
                    <div className="text-xs font-mono text-blue-400 mb-1 bg-bg-soft px-2 py-1 rounded">
                      {formula.formula}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">{formula.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assumptions */}
          {assumptions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2">Assunzioni</h4>
              <ul className="space-y-1">
                {assumptions.map((assumption, idx) => (
                  <li key={idx} className="text-xs text-text-secondary flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>{assumption}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* References */}
          {references.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2">Riferimenti</h4>
              <ul className="space-y-1">
                {references.map((ref, idx) => (
                  <li key={idx} className="text-xs text-text-secondary">
                    {ref}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="pt-3 border-t border-border-subtle">
            <p className="text-xs text-text-secondary italic">
              <strong>Nota:</strong> I calcoli sono basati su formule matematiche standard verificate. 
              I risultati sono indicativi e non costituiscono consulenza finanziaria. 
              Per audit e verifica, tutte le formule sono documentate e tracciabili.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
