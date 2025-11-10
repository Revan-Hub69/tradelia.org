// /report/assets/js/components/market-context-snapshot.js
// Market Context Snapshot - Gradient Band Regime
// Versione 2025 - Design Istituzionale
//
// DESCRIZIONE:
// Questo componente mostra una fascia gradient che va da risk-off (rosso) a risk-on (verde)
// con un marker che indica la posizione corrente del RegimeScore.
//
// FONTE DATI:
// I dati vengono caricati da: /report/reports/{reportId}/f1b.json
// Percorso dati: f1bData.regime_and_risk.RegimeScore
//   - Valore: numero tra -1 (risk-off) e +1 (risk-on)
//   - Esempio: "+0.60" (risk-on) o "-0.30" (risk-off)
//   - Struttura alternativa: f1bData.f1bSnapshot.regime_state.RegimeScore
//
// COMPORTAMENTO:
// - Se RegimeScore è disponibile: mostra marker posizionato sulla gradient band
// - Se RegimeScore non è disponibile: mostra solo gradient band senza marker
// - Il marker cambia colore: rosso (risk-off), arancione (neutro), verde (risk-on)

import Logger from '../utils/logger.js';

const MARKET_CONTEXT_SNAPSHOT = {
  // ===== MOUNT =====
  mount(containerEl, options = {}) {
    if (!containerEl) {
      Logger.error('MarketContextSnapshot', 'Container non fornito');
      return null;
    }

    // Verifica se è già stato montato (evita duplicati)
    const existing = containerEl.querySelector('.market-context-snapshot');
    if (existing) {
      Logger.warn('MarketContextSnapshot', 'Widget già montato, aggiorno invece di duplicare');
      this._render(existing, options);
      return existing;
    }

    const root = document.createElement('div');
    root.className = 'market-context-snapshot';
    
    // Carica dati e renderizza
    this._render(root, options);
    
    containerEl.appendChild(root);
    Logger.debug('MarketContextSnapshot', 'Widget montato');
    return root;
  },

  // ===== RENDER =====
  _render(root, options = {}) {
    const { 
      regimeScore = null,
      strategyMode = null,
      timestamp = null
    } = options;

    // Pulisci root prima di renderizzare (evita duplicati)
    root.innerHTML = '';

    // Se non ci sono dati, mostra placeholder minimale
    if (regimeScore === null && strategyMode === null) {
      root.innerHTML = `
        <div class="market-context-snapshot-label">Regime di mercato — Appetito al rischio</div>
        <div class="market-context-snapshot-gradient">
          <div class="market-context-snapshot-band"></div>
        </div>
      `;
      return;
    }

    // Normalizza RegimeScore (-1 a +1) a percentuale (0 a 100%)
    const scorePercent = regimeScore !== null 
      ? Math.max(0, Math.min(100, ((regimeScore + 1) / 2) * 100))
      : 50; // Default centro se non disponibile

    // Determina colore del marker in base al score
    const markerColor = this._getMarkerColor(regimeScore);

    // Determina descrizione in base al RegimeScore
    let description = '';
    if (regimeScore !== null) {
      if (regimeScore < -0.3) {
        description = 'Risk-off (avversione al rischio)';
      } else if (regimeScore > 0.3) {
        description = 'Risk-on (appetito al rischio)';
      } else {
        description = 'Neutro';
      }
    }

    root.innerHTML = `
      <div class="market-context-snapshot-label">Regime di mercato — ${description}</div>
      <div class="market-context-snapshot-gradient">
        <div class="market-context-snapshot-band">
          <div 
            class="market-context-snapshot-marker" 
            style="left: ${scorePercent}%; background-color: ${markerColor};"
            aria-label="Regime score: ${regimeScore !== null ? regimeScore.toFixed(2) : 'N/A'}"
          ></div>
        </div>
      </div>
    `;

    Logger.debug('MarketContextSnapshot', `RegimeScore: ${regimeScore}, Position: ${scorePercent}%`);
  },

  // ===== GET MARKER COLOR =====
  _getMarkerColor(regimeScore) {
    if (regimeScore === null) {
      return 'var(--neutral)'; // Grigio neutro
    }

    // Risk-off (rosso): -1 a -0.3
    if (regimeScore < -0.3) {
      return 'var(--err)'; // Rosso
    }
    
    // Risk-on (verde): +0.3 a +1
    if (regimeScore > 0.3) {
      return 'var(--ok)'; // Verde
    }
    
    // Neutro (giallo/arancione): -0.3 a +0.3
    return 'var(--warn)'; // Arancione/giallo
  },

  // ===== UPDATE =====
  update(node, options = {}) {
    if (!node) {
      Logger.error('MarketContextSnapshot', 'Node non fornito');
      return;
    }

    this._render(node, options);
  }
};

export { MARKET_CONTEXT_SNAPSHOT as marketContextSnapshot };

