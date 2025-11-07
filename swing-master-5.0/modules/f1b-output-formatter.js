// F1B Output Formatter - Formatta output F1B con spiegazioni inline
// Genera formato compatibile con header-ticker system

import { getExplanation, toMetricPopupFormat } from './f1b-explanations.js';

/**
 * Formatta output F1B con spiegazioni inline (formato header-ticker)
 * Ogni metrica è cliccabile e apre popup con spiegazione
 */
export function formatF1BWithExplanations(f1bOutput) {
  const rows = [];
  
  // === ROW 1: StrategyMode + RegimeScore ===
  const strategyMode = f1bOutput.f1bSnapshot?.regime_state?.StrategyMode_macro || 
                       f1bOutput.regime_and_risk?.StrategyMode_macro?.raw || '—';
  const regimeScore = f1bOutput.f1bSnapshot?.regime_state?.RegimeScore || 
                      f1bOutput.regime_and_risk?.RegimeScore?.raw || '—';
  
  rows.push({
    id: 'strategy-mode-line',
    parts: [
      { kind: 'text', text: 'StrategyMode: ' },
      { 
        kind: 'metric', 
        key: 'StrategyMode_macro', 
        value: strategyMode,
        label: 'StrategyMode',
        tone: getToneForStrategyMode(strategyMode)
      },
      { kind: 'text', text: ' · RegimeScore: ' },
      { 
        kind: 'metric', 
        key: 'RegimeScore', 
        value: formatRegimeScore(regimeScore),
        label: 'RegimeScore',
        tone: getToneForRegimeScore(regimeScore)
      }
    ]
  });
  
  // === ROW 2: Volatility + Breadth ===
  const volRegime = f1bOutput.f1bSnapshot?.market_microstructure?.VolRegime_comment || 
                    f1bOutput.regime_and_risk?.VolRegime?.raw || '—';
  const breadth = f1bOutput.f1bSnapshot?.breadth_and_rotation?.Breadth_1M_pctSectorsGreen || 
                  f1bOutput.breadth_rotation?.Breadth_1M?.raw || '—';
  
  rows.push({
    id: 'vol-breadth-line',
    parts: [
      { kind: 'text', text: 'Volatilità: ' },
      { 
        kind: 'metric', 
        key: 'VolRegime', 
        value: volRegime,
        label: 'VolRegime',
        tone: 'neutral'
      },
      { kind: 'text', text: ' · Breadth 1M: ' },
      { 
        kind: 'metric', 
        key: 'Breadth_1M', 
        value: formatBreadth(breadth),
        label: 'Breadth 1M',
        tone: getToneForBreadth(breadth)
      }
    ]
  });
  
  // === ROW 3: RiskTilt + Leaders ===
  const riskTilt = f1bOutput.f1bSnapshot?.breadth_and_rotation?.RiskTilt_1M || 
                   f1bOutput.breadth_rotation?.RiskTilt_1M?.raw || '—';
  const leaders = f1bOutput.f1bSnapshot?.breadth_and_rotation?.LeadersMultiTF || [];
  
  rows.push({
    id: 'risk-tilt-line',
    parts: [
      { kind: 'text', text: 'RiskTilt: ' },
      { 
        kind: 'metric', 
        key: 'RiskTilt_1M', 
        value: riskTilt,
        label: 'RiskTilt 1M',
        tone: getToneForRiskTilt(riskTilt)
      },
      { kind: 'text', text: ' · Leaders: ' },
      { kind: 'text', text: leaders.slice(0, 3).join(', ') || '—' }
    ]
  });
  
  // === ROW 4: Size Bias + SmallCap Pressure ===
  const sizeBias = f1bOutput.f1bSnapshot?.size_distribution?.SizeBiasPattern || 
                   f1bOutput.breadth_rotation?.SizeBias?.raw || '—';
  const smallCapPressure = f1bOutput.f1bSnapshot?.breadth_and_rotation?.SmallCapPressure_1W || 
                           f1bOutput.breadth_rotation?.SmallCapPressure_1W?.raw || '—';
  
  rows.push({
    id: 'size-bias-line',
    parts: [
      { kind: 'text', text: 'Size Bias: ' },
      { 
        kind: 'metric', 
        key: 'SizeBias', 
        value: sizeBias,
        label: 'Size Bias',
        tone: 'neutral'
      },
      { kind: 'text', text: ' · SmallCap Pressure: ' },
      { 
        kind: 'metric', 
        key: 'SmallCapPressure_1W', 
        value: formatSmallCapPressure(smallCapPressure),
        label: 'SmallCap Pressure',
        tone: getToneForSmallCapPressure(smallCapPressure)
      }
    ]
  });
  
  // === ROW 5: Finviz Query (if available) ===
  const finvizQuery = f1bOutput.finvizFilters?.QueryString || 
                      f1bOutput.bridgeF2?.universe_for_F2?.FinvizQuery || null;
  
  if (finvizQuery) {
    rows.push({
      id: 'finviz-query-line',
      parts: [
        { kind: 'text', text: 'Finviz Query: ' },
        { 
          kind: 'metric', 
          key: 'FinvizQuery', 
          value: finvizQuery.substring(0, 80) + '...',
          label: 'Finviz Query',
          tone: 'neutral'
        }
      ]
    });
  }
  
  // === ROW 6: Risk Window ===
  const riskWindow = f1bOutput.f1bSnapshot?.risk_window?.RiskWindow_F1?.Event || 
                     f1bOutput.regime_and_risk?.RiskWindow?.raw || '—';
  
  rows.push({
    id: 'risk-window-line',
    parts: [
      { kind: 'text', text: 'Risk Window (3-10g): ' },
      { 
        kind: 'metric', 
        key: 'RiskWindow', 
        value: riskWindow,
        label: 'Risk Window',
        tone: 'yellow'
      }
    ]
  });
  
  // === METRICS PANEL (per popup) ===
  const metricsPanel = [];
  
  // Aggiungi tutte le metriche con spiegazioni
  const metrics = [
    'StrategyMode_macro', 'RegimeScore', 'VolRegime', 'Breadth_1M',
    'RiskTilt_1M', 'SmallCapPressure_1W', 'LeadersMultiTF', 'SizeBias',
    'CreditRiskBlock', 'FX_Regime', 'LiquidityRegimeScore', 'RiskWindow',
    'FinvizQuery', 'StressMicroCap'
  ];
  
  metrics.forEach(key => {
    const exp = getExplanation(key);
    if (exp) {
      const value = getMetricValue(f1bOutput, key);
      metricsPanel.push({
        key,
        label: exp.nomeTecnico,
        value: value,
        what: exp.what,
        how: exp.how,
        source: exp.fonte,
        esempio: exp.esempio
      });
    }
  });
  
  return {
    rows,
    metricsPanel,
    meta: f1bOutput.meta || {}
  };
}

// === HELPER FUNCTIONS ===

function getToneForStrategyMode(mode) {
  if (typeof mode !== 'string') return 'neutral';
  const m = mode.toLowerCase();
  if (m.includes('momentum') && !m.includes('light')) return 'ok';
  if (m.includes('pullback')) return 'err';
  return 'warn';
}

function getToneForRegimeScore(score) {
  if (typeof score === 'number') {
    if (score > 0.3) return 'ok';
    if (score < -0.2) return 'err';
    return 'warn';
  }
  if (typeof score === 'string') {
    const num = parseFloat(score.replace(/[^\d.-]/g, ''));
    if (!isNaN(num)) return getToneForRegimeScore(num);
  }
  return 'neutral';
}

function getToneForBreadth(breadth) {
  if (typeof breadth === 'number') {
    if (breadth > 0.6) return 'ok';
    if (breadth < 0.4) return 'err';
    return 'warn';
  }
  return 'neutral';
}

function getToneForRiskTilt(tilt) {
  if (typeof tilt === 'string') {
    if (tilt.toLowerCase().includes('pro-rischio')) return 'ok';
    if (tilt.toLowerCase().includes('difensivo')) return 'err';
  }
  return 'neutral';
}

function getToneForSmallCapPressure(pressure) {
  if (typeof pressure === 'number') {
    if (pressure < -0.1) return 'err';
    if (pressure > 0.1) return 'ok';
    return 'warn';
  }
  return 'neutral';
}

function formatRegimeScore(score) {
  if (typeof score === 'number') {
    return `${score >= 0 ? '+' : ''}${score.toFixed(2)}`;
  }
  return String(score || '—');
}

function formatBreadth(breadth) {
  if (typeof breadth === 'number') {
    return `${(breadth * 100).toFixed(0)}%`;
  }
  return String(breadth || '—');
}

function formatSmallCapPressure(pressure) {
  if (typeof pressure === 'number') {
    return `${pressure >= 0 ? '+' : ''}${pressure.toFixed(2)}`;
  }
  return String(pressure || '—');
}

function getMetricValue(f1bOutput, key) {
  // Try different paths to find value
  const paths = [
    `f1bSnapshot.regime_state.${key}`,
    `f1bSnapshot.breadth_and_rotation.${key}`,
    `f1bSnapshot.market_microstructure.${key}`,
    `regime_and_risk.${key}.raw`,
    `breadth_rotation.${key}.raw`,
    `finvizFilters.${key}`,
    `bridgeF2.universe_for_F2.${key}`
  ];
  
  for (const path of paths) {
    const value = getNestedValue(f1bOutput, path);
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  
  return '—';
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

