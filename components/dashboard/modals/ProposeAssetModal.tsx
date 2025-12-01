'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from '@/lib/i18n/use-translations';
import { toast } from '@/components/ui/Toast';
import { Vote, Loader2 } from 'lucide-react';

interface ProposeAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Propose Asset Modal
 * Form per proporre nuovo asset per analisi community
 */
export function ProposeAssetModal({
  isOpen,
  onClose,
  onSuccess,
}: ProposeAssetModalProps) {
  const { t } = useTranslations();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    asset_symbol: '',
    asset_name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Riferimento: Norman (2013) - Error Prevention, Nielsen (1994) - Error Prevention
    // Validazione client-side prima dell'invio
    
    // Validazione simbolo
    if (!formData.asset_symbol.trim()) {
      toast.error(t('dashboard.voting.errors.symbolRequired') || 'Il simbolo asset è obbligatorio.');
      const symbolInput = document.getElementById('asset_symbol');
      if (symbolInput) {
        symbolInput.focus();
      }
      return;
    }

    const symbol = formData.asset_symbol.trim().toUpperCase().slice(0, 10);
    if (!/^[A-Z]{1,10}$/.test(symbol)) {
      toast.error(t('dashboard.voting.errors.invalidSymbol') || 'Simbolo non valido. Usa solo lettere maiuscole (max 10 caratteri).');
      const symbolInput = document.getElementById('asset_symbol');
      if (symbolInput) {
        symbolInput.focus();
        (symbolInput as HTMLInputElement).select();
      }
      return;
    }

    if (!formData.asset_name.trim()) {
      toast.error(t('dashboard.voting.errors.nameRequired') || 'Il nome asset è obbligatorio.');
      const nameInput = document.getElementById('asset_name');
      if (nameInput) {
        nameInput.focus();
      }
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/voting/propose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asset_symbol: symbol,
          asset_name: formData.asset_name.trim(),
          description: formData.description.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Errore durante la proposta');
      }

      toast.success(t('dashboard.voting.proposeSuccess') || 'Proposta inviata con successo!');
      setFormData({ asset_symbol: '', asset_name: '', description: '' });
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error proposing asset:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('dashboard.voting.proposeError') || 'Errore durante l\'invio della proposta'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('dashboard.voting.propose') || 'Proponi Asset'}
      description={t('dashboard.voting.proposeDescription') || 'Proponi un nuovo asset per l\'analisi della community'}
      size="md"
    >
      {/* Riferimento: WCAG 2.1 - Forms, Norman (2013) - Affordance, Nielsen (1994) - Error Prevention */}
      <form 
        onSubmit={handleSubmit} 
        className="space-y-4"
        noValidate
        aria-label={t('dashboard.voting.formLabel') || 'Form proposta asset'}
      >
        <div>
          <Label htmlFor="asset_symbol">
            {t('dashboard.voting.symbol') || 'Simbolo Asset'} *
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
            autoComplete="off"
            spellCheck="false"
          />
          <p id="symbol-hint" className="text-xs text-text-tertiary mt-1" role="note">
            {t('dashboard.voting.symbolHint') || 'Es: AAPL, MSFT, BTC'}
          </p>
        </div>

        <div>
          <Label htmlFor="asset_name">
            {t('dashboard.voting.name') || 'Nome Asset'} *
            <span className="sr-only"> (obbligatorio)</span>
          </Label>
          <Input
            id="asset_name"
            type="text"
            value={formData.asset_name}
            onChange={(e) =>
              setFormData({ ...formData, asset_name: e.target.value })
            }
            placeholder="Apple Inc."
            required
            className="mt-1"
            aria-required="true"
            autoComplete="off"
          />
        </div>

        <div>
          <Label htmlFor="description">
            {t('dashboard.voting.description') || 'Descrizione (opzionale)'}
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder={t('dashboard.voting.descriptionPlaceholder') || 'Spiega perché questo asset dovrebbe essere analizzato...'}
            rows={4}
            className="mt-1"
            maxLength={500}
            aria-describedby="description-counter"
          />
          <p id="description-counter" className="text-xs text-text-tertiary mt-1" role="status" aria-live="polite">
            {formData.description.length}/500
            <span className="sr-only"> caratteri rimanenti</span>
          </p>
        </div>

        {/* Riferimento: Nielsen (1994) - Consistency, Material Design Dialog Actions */}
        <div className="flex items-center justify-end gap-3 pt-4" role="group" aria-label="Form actions">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            aria-label={t('common.cancel') || 'Annulla e chiudi'}
          >
            {t('common.cancel') || 'Annulla'}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
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
                <Vote className="w-4 h-4" aria-hidden="true" />
                {t('dashboard.voting.submit') || 'Invia Proposta'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

