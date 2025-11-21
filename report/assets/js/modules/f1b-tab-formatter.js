// F1B Tab Formatter - Genera rows + parts per ogni tab (formato header-ticker)
// Ogni tab usa la stessa logica di header-ticker per metriche cliccabili

/**
 * Formatta sezione Regime & Rischio in rows + parts
 */
export function formatRegimeTabToRows(regimeData) {
  const rows = [];
  if (!regimeData || Object.keys(regimeData).length === 0) return rows;

  // ROW 1: StrategyMode + RegimeScore
  rows.push({
    id: 'regime-strategy-line',
    parts: [
      { kind: 'text', text: 'StrategyMode: ' },
      {
        kind: 'metric',
        key: 'StrategyMode_macro',
        value: regimeData.StrategyMode_macro?.raw || '—',
        label: 'StrategyMode',
        tone: getToneForStrategyMode(regimeData.StrategyMode_macro?.raw),
      },
      { kind: 'text', text: ' · RegimeScore: ' },
      {
        kind: 'metric',
        key: 'RegimeScore',
        value: formatRegimeScore(regimeData.RegimeScore?.raw),
        label: 'RegimeScore',
        tone: getToneForRegimeScore(regimeData.RegimeScore?.raw),
      },
    ],
  });

  // ROW 2: VolRegime + Liquidity
  rows.push({
    id: 'regime-vol-liquidity-line',
    parts: [
      { kind: 'text', text: 'Volatilità: ' },
      {
        kind: 'metric',
        key: 'VolRegime',
        value: regimeData.VolRegime?.raw || '—',
        label: 'VolRegime',
        tone: 'neutral',
      },
      { kind: 'text', text: ' · Liquidità: ' },
      {
        kind: 'metric',
        key: 'LiquidityRegimeScore',
        value: formatRegimeScore(regimeData.LiquidityRegimeScore?.raw),
        label: 'LiquidityRegimeScore',
        tone: 'neutral',
      },
    ],
  });

  // ROW 3: Credit + FX
  rows.push({
    id: 'regime-credit-fx-line',
    parts: [
      { kind: 'text', text: 'Credito: ' },
      {
        kind: 'metric',
        key: 'CreditRiskBlock',
        value: regimeData.CreditRiskBlock?.raw || '—',
        label: 'CreditRiskBlock',
        tone: 'neutral',
      },
      { kind: 'text', text: ' · FX: ' },
      {
        kind: 'metric',
        key: 'FX_Regime',
        value: regimeData.FX_Regime?.raw || '—',
        label: 'FX_Regime',
        tone: 'neutral',
      },
    ],
  });

  // ROW 4: RiskWindow
  if (regimeData.RiskWindow?.raw) {
    rows.push({
      id: 'regime-risk-window-line',
      parts: [
        { kind: 'text', text: 'Risk Window (3–10g): ' },
        {
          kind: 'metric',
          key: 'RiskWindow',
          value: regimeData.RiskWindow.raw,
          label: 'RiskWindow',
          tone: 'yellow',
        },
      ],
    });
  }

  return rows;
}

/**
 * Formatta sezione Breadth & Rotazione in rows + parts
 */
export function formatBreadthTabToRows(breadthData) {
  const rows = [];
  if (!breadthData || Object.keys(breadthData).length === 0) return rows;

  // ROW 1: Breadth + RiskTilt
  rows.push({
    id: 'breadth-breadth-tilt-line',
    parts: [
      { kind: 'text', text: 'Breadth 1M: ' },
      {
        kind: 'metric',
        key: 'Breadth_1M',
        value: formatBreadth(breadthData.Breadth_1M?.raw),
        label: 'Breadth 1M',
        tone: getToneForBreadth(breadthData.Breadth_1M?.raw),
      },
      { kind: 'text', text: ' · RiskTilt: ' },
      {
        kind: 'metric',
        key: 'RiskTilt_1M',
        value: breadthData.RiskTilt_1M?.raw || '—',
        label: 'RiskTilt 1M',
        tone: getToneForRiskTilt(breadthData.RiskTilt_1M?.raw),
      },
    ],
  });

  // ROW 2: SmallCap + Index Momentum
  rows.push({
    id: 'breadth-smallcap-momentum-line',
    parts: [
      { kind: 'text', text: 'SmallCap Pressure: ' },
      {
        kind: 'metric',
        key: 'SmallCapPressure_1W',
        value: formatSmallCapPressure(breadthData.SmallCapPressure_1W?.raw),
        label: 'SmallCap Pressure 1W',
        tone: getToneForSmallCap(breadthData.SmallCapPressure_1W?.raw),
      },
      { kind: 'text', text: ' · Index Momentum: ' },
      {
        kind: 'metric',
        key: 'IndexMomentum_1W',
        value: formatRegimeScore(breadthData.IndexMomentum_1W?.raw),
        label: 'Index Momentum 1W',
        tone: 'neutral',
      },
    ],
  });

  // ROW 3: Size Bias
  if (breadthData.SizeBias?.raw) {
    rows.push({
      id: 'breadth-size-bias-line',
      parts: [
        { kind: 'text', text: 'Size Bias: ' },
        {
          kind: 'metric',
          key: 'SizeBias',
          value: breadthData.SizeBias.raw,
          label: 'SizeBias',
          tone: 'neutral',
        },
      ],
    });
  }

  // ROW 4: Leaders
  if (breadthData.Leadership?.LeadersMultiTF?.items) {
    const leaders = breadthData.Leadership.LeadersMultiTF.items.slice(0, 3).join(', ');
    rows.push({
      id: 'breadth-leaders-line',
      parts: [
        { kind: 'text', text: 'Leaders: ' },
        { kind: 'text', text: leaders },
      ],
    });
  }

  // ROW 5: Defensivi + Lagging
  const defensive = breadthData.Leadership?.DefensiveLeadership?.items || [];
  const lagging = breadthData.Leadership?.Lagging?.items || [];
  if (defensive.length > 0 || lagging.length > 0) {
    rows.push({
      id: 'breadth-defensive-lagging-line',
      parts: [
        { kind: 'text', text: 'Defensivi: ' },
        { kind: 'text', text: defensive.slice(0, 2).join(', ') || '—' },
        { kind: 'text', text: ' · In ritardo: ' },
        { kind: 'text', text: lagging.slice(0, 2).join(', ') || '—' },
      ],
    });
  }

  return rows;
}

/**
 * Formatta sezione Street View in rows + parts
 */
export function formatStreetTabToRows(streetData) {
  const rows = [];
  if (!streetData || Object.keys(streetData).length === 0) return rows;

  // ROW 1: Macro News (troncato se troppo lungo)
  if (streetData.T1_MacroNews) {
    const news =
      streetData.T1_MacroNews.length > 100
        ? streetData.T1_MacroNews.substring(0, 100) + '...'
        : streetData.T1_MacroNews;
    rows.push({
      id: 'street-macro-news-line',
      parts: [
        { kind: 'text', text: 'Macro News: ' },
        { kind: 'text', text: news },
      ],
    });
  }

  // ROW 2: Sell-Side Notes (troncato se troppo lungo)
  if (streetData.T1_SellSideNotes) {
    const notes =
      streetData.T1_SellSideNotes.length > 100
        ? streetData.T1_SellSideNotes.substring(0, 100) + '...'
        : streetData.T1_SellSideNotes;
    rows.push({
      id: 'street-sellside-line',
      parts: [
        { kind: 'text', text: 'Sell-Side: ' },
        { kind: 'text', text: notes },
      ],
    });
  }

  // ROW 3: Consensus Tone
  if (streetData.T1_ConsensusTone?.raw) {
    rows.push({
      id: 'street-consensus-line',
      parts: [
        { kind: 'text', text: 'Consensus Tone: ' },
        {
          kind: 'metric',
          key: 'T1_ConsensusTone',
          value: streetData.T1_ConsensusTone.raw,
          label: 'Consensus Tone',
          tone: streetData.T1_ConsensusTone.tone || 'neutral',
        },
      ],
    });
  }

  return rows;
}

// Helper functions (riutilizzate da f1b-formatter.js)
function getToneForStrategyMode(mode) {
  if (typeof mode !== 'string') return 'neutral';
  if (mode.includes('Momentum')) return 'green';
  if (mode.includes('Pullback')) return 'red';
  return 'neutral';
}

function getToneForRegimeScore(score) {
  if (typeof score === 'string') {
    const num = parseFloat(score.replace(/[^0-9.-]/g, ''));
    if (num > 0.3) return 'green';
    if (num < -0.3) return 'red';
    return 'neutral';
  }
  if (typeof score === 'number') {
    if (score > 0.3) return 'green';
    if (score < -0.3) return 'red';
    return 'neutral';
  }
  return 'neutral';
}

function formatRegimeScore(score) {
  if (score === null || score === undefined || score === '—') return '—';
  if (typeof score === 'number') {
    return score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2);
  }
  if (typeof score === 'string') {
    return score;
  }
  return String(score);
}

function formatBreadth(breadth) {
  if (breadth === null || breadth === undefined || breadth === '—') return '—';
  if (typeof breadth === 'number') {
    return (breadth * 100).toFixed(0) + '%';
  }
  if (typeof breadth === 'string') {
    return breadth;
  }
  return String(breadth);
}

function getToneForBreadth(breadth) {
  if (typeof breadth === 'number') {
    if (breadth > 0.6) return 'green';
    if (breadth < 0.4) return 'red';
    return 'neutral';
  }
  return 'neutral';
}

function getToneForRiskTilt(tilt) {
  if (typeof tilt !== 'string') return 'neutral';
  if (tilt.includes('Pro-rischio') || tilt.includes('risk-on')) return 'green';
  if (tilt.includes('Difensivo') || tilt.includes('risk-off')) return 'red';
  return 'neutral';
}

function formatSmallCapPressure(pressure) {
  if (pressure === null || pressure === undefined || pressure === '—') return '—';
  return String(pressure);
}

function getToneForSmallCap(pressure) {
  if (typeof pressure === 'string') {
    const num = parseFloat(pressure.replace(/[^0-9.-]/g, ''));
    if (num < -0.1) return 'red';
    if (num > 0.1) return 'green';
    return 'neutral';
  }
  return 'neutral';
}
