// F1B Formatter - Genera formato rows + parts per header-ticker rendering
// Usa tutte le metriche del prompt originale F1B v19-Dynamic

/**
 * Converte output F1B in formato rows + parts (come header-ticker)
 * Include tutte le metriche del prompt originale
 */
export function formatF1BToRows(f1bData) {
  const rows = [];
  const d = f1bData;
  
  // Estrai valori da struttura originale o nuova
  const getValue = (path, fallback = '—') => {
    const paths = path.split('|');
    for (const p of paths) {
      const keys = p.split('.');
      let val = d;
      for (const key of keys) {
        if (val && typeof val === 'object') {
          val = val[key]?.raw || val[key];
        } else {
          val = null;
          break;
        }
      }
      if (val !== null && val !== undefined && val !== '') return val;
    }
    return fallback;
  };
  
  // === ROW 1: StrategyMode + RegimeScore ===
  const strategyMode = getValue('regime_and_risk.StrategyMode_macro.raw|f1bSnapshot.regime_state.StrategyMode_macro');
  const regimeScore = getValue('regime_and_risk.RegimeScore.raw|f1bSnapshot.regime_state.RegimeScore');
  
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
  const volRegime = getValue('regime_and_risk.VolRegime.raw|f1bSnapshot.market_microstructure.VolRegime_comment');
  const breadth = getValue('breadth_rotation.Breadth_1M.raw|f1bSnapshot.breadth_and_rotation.Breadth_1M_pctSectorsGreen');
  
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
  const riskTilt = getValue('breadth_rotation.RiskTilt_1M.raw|f1bSnapshot.breadth_and_rotation.RiskTilt_1M');
  const leaders = d.breadth_rotation?.Leadership?.LeadersMultiTF?.items || 
                  d.f1bSnapshot?.breadth_and_rotation?.LeadersMultiTF || [];
  const leadersText = Array.isArray(leaders) ? leaders.slice(0, 3).join(', ') : '—';
  
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
      { kind: 'text', text: leadersText }
    ]
  });
  
  // === ROW 4: Size Bias + SmallCap Pressure ===
  const sizeBias = getValue('breadth_rotation.SizeBias.raw|f1bSnapshot.size_distribution.SizeBiasPattern');
  const smallCapPressure = getValue('breadth_rotation.SmallCapPressure_1W.raw|f1bSnapshot.breadth_and_rotation.SmallCapPressure_1W');
  
  rows.push({
    id: 'size-bias-line',
    parts: [
      { kind: 'text', text: 'Size Bias: ' },
      {
        kind: 'metric',
        key: 'SizeBias',
        value: sizeBias,
        label: 'SizeBias',
        tone: 'neutral'
      },
      { kind: 'text', text: ' · SmallCap Pressure: ' },
      {
        kind: 'metric',
        key: 'SmallCapPressure_1W',
        value: formatSmallCapPressure(smallCapPressure),
        label: 'SmallCap Pressure 1W',
        tone: getToneForSmallCap(smallCapPressure)
      }
    ]
  });
  
  // === ROW 5: Credit + FX ===
  const credit = getValue('regime_and_risk.CreditRiskBlock.raw|f1bSnapshot.regime_state.CreditRiskBlock');
  const fx = getValue('regime_and_risk.FX_Regime.raw|f1bSnapshot.market_microstructure.FX_Regime_comment');
  
  rows.push({
    id: 'credit-fx-line',
    parts: [
      { kind: 'text', text: 'Credito: ' },
      {
        kind: 'metric',
        key: 'CreditRiskBlock',
        value: credit,
        label: 'CreditRiskBlock',
        tone: 'neutral'
      },
      { kind: 'text', text: ' · FX: ' },
      {
        kind: 'metric',
        key: 'FX_Regime',
        value: fx,
        label: 'FX_Regime',
        tone: 'neutral'
      }
    ]
  });
  
  // === ROW 6: Risk Window ===
  const riskWindow = getValue('regime_and_risk.RiskWindow.raw|f1bSnapshot.risk_window.RiskWindow_F1');
  
  rows.push({
    id: 'risk-window-line',
    parts: [
      { kind: 'text', text: 'Risk Window (3–10g): ' },
      {
        kind: 'metric',
        key: 'RiskWindow',
        value: riskWindow,
        label: 'RiskWindow',
          tone: 'warn' // yellow -> warn
      }
    ]
  });
  
  // === ROW 7: Liquidity + Index Momentum ===
  const liquidity = getValue('regime_and_risk.LiquidityRegimeScore.raw|f1bSnapshot.regime_state.LiquidityRegimeScore');
  const indexMomentum = getValue('breadth_rotation.IndexMomentum_1W.raw|f1bSnapshot.breadth_and_rotation.IndexMomentum_1W');
  
  rows.push({
    id: 'liquidity-momentum-line',
    parts: [
      { kind: 'text', text: 'Liquidity: ' },
      {
        kind: 'metric',
        key: 'LiquidityRegimeScore',
        value: formatRegimeScore(liquidity),
        label: 'LiquidityRegimeScore',
        tone: 'neutral'
      },
      { kind: 'text', text: ' · Index Momentum 1W: ' },
      {
        kind: 'metric',
        key: 'IndexMomentum_1W',
        value: formatRegimeScore(indexMomentum),
        label: 'IndexMomentum 1W',
        tone: 'neutral'
      }
    ]
  });
  
  // === ROW 8: Defensive Leadership + Lagging ===
  const defensive = d.breadth_rotation?.Leadership?.DefensiveLeadership?.items || [];
  const lagging = d.breadth_rotation?.Leadership?.Lagging?.items || 
                  d.f1bSnapshot?.breadth_and_rotation?.LaggingSectors || [];
  const defensiveText = Array.isArray(defensive) ? defensive.slice(0, 2).join(', ') : '—';
  const laggingText = Array.isArray(lagging) ? lagging.slice(0, 2).join(', ') : '—';
  
  if (defensiveText !== '—' || laggingText !== '—') {
    rows.push({
      id: 'defensive-lagging-line',
      parts: [
        { kind: 'text', text: 'Defensivi: ' },
        { kind: 'text', text: defensiveText || '—' },
        { kind: 'text', text: ' · In ritardo: ' },
        { kind: 'text', text: laggingText || '—' }
      ]
    });
  }
  
  // === ROW 9: T1 Headlines (Street View) ===
  const t1MacroNews = d.street_view?.T1_MacroNews || '';
  if (t1MacroNews) {
    const newsPreview = t1MacroNews.length > 80 ? t1MacroNews.substring(0, 80) + '...' : t1MacroNews;
    rows.push({
      id: 't1-headlines-line',
      parts: [
        { kind: 'text', text: 'Street View: ' },
        { kind: 'text', text: newsPreview }
      ]
    });
  }
  
  // === ROW 10: Finviz Query (se disponibile) ===
  const finvizQuery = d.finvizFilters?.QueryString || '';
  if (finvizQuery) {
    rows.push({
      id: 'finviz-query-line',
      parts: [
        { kind: 'text', text: 'Finviz Query: ' },
        {
          kind: 'metric',
          key: 'FinvizQuery',
          value: finvizQuery.substring(0, 50) + (finvizQuery.length > 50 ? '...' : ''),
          label: 'Finviz Query',
          tone: 'neutral'
        }
      ]
    });
  }
  
  return rows;
}

// Helper functions
function getToneForStrategyMode(mode) {
  if (typeof mode !== 'string') return 'neutral';
  if (mode.includes('Momentum')) return 'ok'; // green -> ok
  if (mode.includes('Pullback')) return 'err'; // red -> err
  return 'neutral';
}

function getToneForRegimeScore(score) {
  if (typeof score === 'string') {
    const num = parseFloat(score.replace(/[^0-9.-]/g, ''));
    if (num > 0.3) return 'ok'; // green -> ok
    if (num < -0.3) return 'err'; // red -> err
    return 'neutral';
  }
  if (typeof score === 'number') {
    if (score > 0.3) return 'ok'; // green -> ok
    if (score < -0.3) return 'err'; // red -> err
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
    if (breadth > 0.6) return 'ok'; // green -> ok
    if (breadth < 0.4) return 'err'; // red -> err
    return 'neutral';
  }
  return 'neutral';
}

function getToneForRiskTilt(tilt) {
  if (typeof tilt !== 'string') return 'neutral';
  if (tilt.includes('Pro-rischio') || tilt.includes('risk-on')) return 'ok'; // green -> ok
  if (tilt.includes('Difensivo') || tilt.includes('risk-off')) return 'err'; // red -> err
  return 'neutral';
}

function formatSmallCapPressure(pressure) {
  if (pressure === null || pressure === undefined || pressure === '—') return '—';
  return String(pressure);
}

function getToneForSmallCap(pressure) {
  if (typeof pressure === 'string') {
    const num = parseFloat(pressure.replace(/[^0-9.-]/g, ''));
    if (num < -0.1) return 'err'; // red -> err
    if (num > 0.1) return 'ok'; // green -> ok
    return 'neutral';
  }
  return 'neutral';
}

