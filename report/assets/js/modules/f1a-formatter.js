// F1A Formatter - Genera formato rows + parts per header-ticker rendering
// F1A = Ticker Macro Context (dati macro contestuali per il ticker)

/**
 * Converte output F1A in formato rows + parts (come header-ticker)
 * Include tutte le metriche del Ticker Macro Context
 */
export function formatF1AToRows(f1aData) {
  const rows = [];
  const d = f1aData;
  
  // Estrai valori da struttura F1A
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
  
  // === ROW 1: Ticker + Sector + Market Cap ===
  const ticker = getValue('ticker|meta.ticker');
  const sector = getValue('sector|ticker_context.sector');
  const marketCap = getValue('marketCap|ticker_context.marketCap');
  
  rows.push({
    id: 'ticker-context-line',
    parts: [
      { kind: 'text', text: 'Ticker: ' },
      {
        kind: 'metric',
        key: 'Ticker',
        value: ticker,
        label: 'Ticker',
        tone: 'neutral'
      },
      { kind: 'text', text: ' · Settore: ' },
      {
        kind: 'metric',
        key: 'Sector',
        value: sector,
        label: 'Sector',
        tone: 'neutral'
      },
      { kind: 'text', text: ' · Market Cap: ' },
      {
        kind: 'metric',
        key: 'MarketCap',
        value: formatMarketCap(marketCap),
        label: 'MarketCap',
        tone: 'neutral'
      }
    ]
  });
  
  // === ROW 2: Price + Change + Volume ===
  const price = getValue('price|ticker_context.price');
  const changePct = getValue('changePct|ticker_context.changePct');
  const volume = getValue('volume|ticker_context.volume');
  
  rows.push({
    id: 'price-volume-line',
    parts: [
      { kind: 'text', text: 'Prezzo: ' },
      {
        kind: 'metric',
        key: 'Price',
        value: formatPrice(price),
        label: 'Price',
        tone: 'ok'
      },
      { kind: 'text', text: ' · Variazione: ' },
      {
        kind: 'metric',
        key: 'ChangePct',
        value: formatChangePct(changePct),
        label: 'ChangePct',
        tone: getToneForChange(changePct)
      },
      { kind: 'text', text: ' · Volume: ' },
      {
        kind: 'metric',
        key: 'Volume',
        value: formatVolume(volume),
        label: 'Volume',
        tone: 'neutral'
      }
    ]
  });
  
  // === ROW 3: Beta + Sector Performance ===
  const beta = getValue('beta|ticker_context.beta');
  const sectorPerf = getValue('sectorPerformance_1M|ticker_context.sectorPerformance_1M');
  
  rows.push({
    id: 'beta-sector-line',
    parts: [
      { kind: 'text', text: 'Beta: ' },
      {
        kind: 'metric',
        key: 'Beta',
        value: formatBeta(beta),
        label: 'Beta',
        tone: 'neutral'
      },
      { kind: 'text', text: ' · Performance Settore 1M: ' },
      {
        kind: 'metric',
        key: 'SectorPerformance_1M',
        value: formatPercentage(sectorPerf),
        label: 'Sector Performance 1M',
        tone: getToneForPercentage(sectorPerf)
      }
    ]
  });
  
  // === ROW 4: Relative Strength + Index Exposure ===
  const relativeStrength = getValue('relativeStrength|ticker_context.relativeStrength');
  const indexExposure = getValue('indexExposure|ticker_context.indexExposure');
  
  rows.push({
    id: 'strength-exposure-line',
    parts: [
      { kind: 'text', text: 'Relative Strength: ' },
      {
        kind: 'metric',
        key: 'RelativeStrength',
        value: formatRelativeStrength(relativeStrength),
        label: 'RelativeStrength',
        tone: getToneForRelativeStrength(relativeStrength)
      },
      { kind: 'text', text: ' · Esposizione Indici: ' },
      {
        kind: 'metric',
        key: 'IndexExposure',
        value: indexExposure,
        label: 'IndexExposure',
        tone: 'neutral'
      }
    ]
  });
  
  return rows;
}

// Helper functions
function formatPrice(price) {
  if (price === null || price === undefined || price === '—') return '—';
  if (typeof price === 'number') {
    return '$' + price.toFixed(2);
  }
  return String(price);
}

function formatChangePct(change) {
  if (change === null || change === undefined || change === '—') return '—';
  if (typeof change === 'number') {
    return (change > 0 ? '+' : '') + change.toFixed(2) + '%';
  }
  if (typeof change === 'string') {
    return change;
  }
  return String(change);
}

function getToneForChange(change) {
  if (typeof change === 'string') {
    if (change.includes('+') || parseFloat(change) > 0) return 'green';
    if (change.includes('-') || parseFloat(change) < 0) return 'red';
    return 'neutral';
  }
  if (typeof change === 'number') {
    if (change > 0) return 'green';
    if (change < 0) return 'red';
    return 'neutral';
  }
  return 'neutral';
}

function formatVolume(volume) {
  if (volume === null || volume === undefined || volume === '—') return '—';
  if (typeof volume === 'number') {
    if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
    if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
    if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
    return volume.toString();
  }
  return String(volume);
}

function formatMarketCap(marketCap) {
  if (marketCap === null || marketCap === undefined || marketCap === '—') return '—';
  if (typeof marketCap === 'string') {
    return marketCap;
  }
  if (typeof marketCap === 'number') {
    if (marketCap >= 1e12) return '$' + (marketCap / 1e12).toFixed(2) + 'T';
    if (marketCap >= 1e9) return '$' + (marketCap / 1e9).toFixed(2) + 'B';
    if (marketCap >= 1e6) return '$' + (marketCap / 1e6).toFixed(2) + 'M';
    return '$' + marketCap.toFixed(2);
  }
  return String(marketCap);
}

function formatBeta(beta) {
  if (beta === null || beta === undefined || beta === '—') return '—';
  if (typeof beta === 'number') {
    return beta.toFixed(2);
  }
  return String(beta);
}

function formatPercentage(value) {
  if (value === null || value === undefined || value === '—') return '—';
  if (typeof value === 'number') {
    return (value > 0 ? '+' : '') + (value * 100).toFixed(2) + '%';
  }
  if (typeof value === 'string') {
    return value;
  }
  return String(value);
}

function getToneForPercentage(value) {
  if (typeof value === 'number') {
    if (value > 0.05) return 'green';
    if (value < -0.05) return 'red';
    return 'neutral';
  }
  return 'neutral';
}

function formatRelativeStrength(strength) {
  if (strength === null || strength === undefined || strength === '—') return '—';
  if (typeof strength === 'number') {
    return strength.toFixed(2);
  }
  return String(strength);
}

function getToneForRelativeStrength(strength) {
  if (typeof strength === 'number') {
    if (strength > 1.0) return 'green';
    if (strength < 1.0) return 'red';
    return 'neutral';
  }
  return 'neutral';
}

