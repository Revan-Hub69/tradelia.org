'use client';

import { ComingSoon } from '@/components/ui/ComingSoon';

/**
 * Portfolio Manager
 * Coming Soon - Richiede API real-time per prezzi
 * 
 * Il codice originale è stato temporaneamente disabilitato perché richiede
 * integrazione con API real-time per prezzi di mercato.
 * 
 * Quando le API saranno disponibili, il codice originale può essere ripristinato
 * da git history o da backup.
 */
export function PortfolioManager() {
  return (
    <ComingSoon
      title="Portfolio Manager"
      description="Gestisci il tuo portafoglio con aggiornamenti real-time"
      reason="Questa funzionalità richiede integrazione con API real-time per prezzi di mercato. Stiamo lavorando per integrare provider gratuiti e affidabili."
      estimatedDate="Q2 2025"
    />
  );
}
