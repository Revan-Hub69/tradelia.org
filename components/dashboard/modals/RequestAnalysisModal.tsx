'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useTranslations } from '@/lib/i18n/use-translations';
import { toast } from '@/components/ui/Toast';
import { TrendingUp, Loader2 } from 'lucide-react';

interface RequestAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Request Analysis Modal
 * Form per richiedere analisi personalizzate su asset
 */
export function RequestAnalysisModal({
  isOpen,
  onClose,
  onSuccess,
}: RequestAnalysisModalProps) {
  const { t } = useTranslations();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    asset_symbol: '',
    asset_name: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Riferimento: Norman (2013) - Error Prevention, Nielsen (1994) - Error Prevention
    // Validazione client-side prima dell'invio (prevenzione errori)
    
    // Validazione simbolo
    if (!formData.asset_symbol.trim()) {
      toast.error(t('dashboard.requests.errors.symbolRequired') || 'Il simbolo asset è obbligatorio.');
      // Focus sul campo errore (WCAG 2.4.3 - Focus Order, Norman - Feedback)
      const symbolInput = document.getElementById('asset_symbol');
      if (symbolInput) {
        symbolInput.focus();
      }
      return;
    }

    const symbol = formData.asset_symbol.trim().toUpperCase().slice(0, 10);
    if (!/^[A-Z]{1,10}$/.test(symbol)) {
      toast.error(t('dashboard.requests.errors.invalidSymbol') || 'Simbolo non valido. Usa solo lettere maiuscole (max 10 caratteri).');
      const symbolInput = document.getElementById('asset_symbol');
      if (symbolInput) {
        symbolInput.focus();
        (symbolInput as HTMLInputElement).select();
      }
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/analysis-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asset_symbol: symbol,
          asset_name: formData.asset_name.trim() || symbol,
          priority: formData.priority,
          notes: formData.notes.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Errore durante la richiesta');
      }

      toast.success(t('dashboard.requests.success') || 'Richiesta inviata con successo!');
      setFormData({ asset_symbol: '', asset_name: '', priority: 'normal', notes: '' });
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error requesting analysis:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('dashboard.requests.error') || 'Errore durante l\'invio della richiesta'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('dashboard.requests.newRequest') || 'Richiedi Analisi'}
      size="md"
    >
      {/* Riferimento: WCAG 2.1 - Forms, Norman (2013) - Affordance, Nielsen (1994) - Error Prevention */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {t('dashboard.requests.modalDescription') || 'Richiedi un\'analisi personalizzata su un asset specifico'}
      </p>
      <form 
        onSubmit={handleSubmit} 
        className="space-y-4"
        noValidate // We handle validation manually for better UX
        aria-label={t('dashboard.requests.formLabel') || 'Form richiesta analisi'}
      >
        <div>
          <Label htmlFor="asset_symbol">
            {t('dashboard.requests.symbol') || 'Simbolo Asset'} *
            <span className="sr-only"> (obbligatorio)</span>
          </Label>
          <Input
            id="asset_symbol"
            type="text"
            value={formData.asset_symbol}
            onChange={(e) =>
              setFormData({ ...formData, asset_symbol: e.target.value.toUpperCase() })
            }
            placeholder="AAPL"
            required
            maxLength={10}
            className="mt-1"
            aria-required="true"
            aria-describedby="symbol-hint"
            // Norman - Affordance: Auto-uppercase suggests format
            autoComplete="off"
            spellCheck="false"
          />
          <p id="symbol-hint" className="text-xs text-text-tertiary mt-1" role="note">
            {t('dashboard.requests.symbolHint') || 'Es: AAPL, MSFT, BTC'}
          </p>
        </div>

        <div>
          <Label htmlFor="asset_name">
            {t('dashboard.requests.name') || 'Nome Asset (opzionale)'}
          </Label>
          <Input
            id="asset_name"
            type="text"
            value={formData.asset_name}
            onChange={(e) =>
              setFormData({ ...formData, asset_name: e.target.value })
            }
            placeholder="Apple Inc."
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="priority">
            {t('dashboard.requests.priority') || 'Priorità'}
          </Label>
          <Select
            id="priority"
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value as 'low' | 'normal' | 'high' })
            }
            className="mt-1"
          >
            <option value="low">{t('dashboard.requests.priorityLow') || 'Bassa'}</option>
            <option value="normal">{t('dashboard.requests.priorityNormal') || 'Normale'}</option>
            <option value="high">{t('dashboard.requests.priorityHigh') || 'Alta'}</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="notes">
            {t('dashboard.requests.notes') || 'Note (opzionale)'}
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder={t('dashboard.requests.notesPlaceholder') || 'Aggiungi dettagli o contesto per l\'analisi...'}
            rows={4}
            className="mt-1"
            maxLength={500}
            aria-describedby="notes-counter"
            // Norman - Feedback: Character counter provides immediate feedback
          />
          <p id="notes-counter" className="text-xs text-text-tertiary mt-1" role="status" aria-live="polite">
            {formData.notes.length}/500
            <span className="sr-only"> caratteri rimanenti</span>
          </p>
        </div>

        {/* Riferimento: Nielsen (1994) - Consistency, Material Design Dialog Actions */}
        {/* Button order: Cancel first, Submit last (primary action) */}
        <div className="flex items-center justify-end gap-3 pt-4" role="group" aria-label="Form actions">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            // WCAG 2.1.1 - Keyboard: Cancel accessible via keyboard
            aria-label={t('common.cancel') || 'Annulla e chiudi'}
          >
            {t('common.cancel') || 'Annulla'}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
            // Norman - Feedback: Loading state provides system status
            aria-busy={loading}
            aria-disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>{t('common.sending') || 'Invio...'}</span>
                <span className="sr-only">Invio in corso</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" aria-hidden="true" />
                {t('dashboard.requests.submit') || 'Invia Richiesta'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

