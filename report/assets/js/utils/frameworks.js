// /report/assets/js/utils/frameworks.js
// Canonical naming and descriptors for Tradelia research frameworks

export const FRAMEWORKS = {
  swing_master_5_0: {
    code: 'SRD v5.0',
    label: 'Tradelia SRD v5.0 — Swing Research Deck',
    short: 'SRD v5.0',
    description:
      'Deck di ricerca swing a orizzonte 3–10 giorni. Modelli quantitativi proprietari, regime detection e scoring multi-fattore per operatività tattica.',
    tone: 'Analisi swing quantitativa'
  },
  daily_market_intel_3_1: {
    code: 'MTB v3.1',
    label: 'Tradelia MTB v3.1 — Macro Tactical Briefing',
    short: 'MTB v3.1',
    description:
      'Briefing macro cross-asset quotidiano. Sintesi di indicatori di regime, curva dei tassi, volatilità implicita e leading indicator settoriali.',
    tone: 'Executive macro briefing'
  },
  custom: {
    code: 'CRD',
    label: 'Tradelia CRD — Custom Research Deck',
    short: 'CRD',
    description:
      'Analisi su richiesta con pipeline modulare SRD/MTB. Ideale per desk istituzionali che necessitano report dedicati e integrazione dei propri dataset.',
    tone: 'Ricerca su misura'
  },
  legacy: {
    code: 'Research Deck',
    label: 'Tradelia Research Deck',
    short: 'Research Deck',
    description:
      'Composite deck di ricerca Tradelia. Alcune funzionalità potrebbero essere limitate nella versione legacy.',
    tone: 'Ricerca'
  }
};

export function getFrameworkInfo(type) {
  if (!type) return FRAMEWORKS.legacy;
  return FRAMEWORKS[type] || FRAMEWORKS.legacy;
}

export function formatFrameworkTitle(type, ticker) {
  const info = getFrameworkInfo(type);
  return ticker ? `${info.label} · ${ticker}` : info.label;
}

export function formatFrameworkDescription(type, companyName, ticker) {
  const info = getFrameworkInfo(type);
  const subject = companyName || ticker || 'asset analizzato';
  return `${info.description} · Focus: ${subject}`;
}


