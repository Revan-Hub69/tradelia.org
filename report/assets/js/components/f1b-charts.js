// /report/assets/js/components/f1b-charts.js
// Chart renderers per F1B v19 Dynamic: due chart principali on-card +
// chart dedicato per ogni drawer section.

import Logger from '../utils/logger.js';

const CHART_JS_SRC = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';

const COLORS = {
  ok: 'rgba(22, 163, 74, 0.88)',
  warn: 'rgba(234, 88, 12, 0.88)',
  err: 'rgba(220, 38, 38, 0.88)',
  neutral: '#64748b',
  primary: '#2563eb',
  backdrop: 'rgba(15, 23, 42, 0.85)',
  grid: 'rgba(148, 163, 184, 0.15)',
  text: '#f8fafc',
  textMuted: '#cbd5f5',
};

let chartJsPromise = null;

function ensureChartJs() {
  if (window.Chart) return Promise.resolve();
  if (chartJsPromise) return chartJsPromise;
  chartJsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${CHART_JS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () =>
        window.Chart ? resolve() : reject(new Error('Chart.js non disponibile'))
      );
      existing.addEventListener('error', () => reject(new Error('Errore caricamento Chart.js')));
      return;
    }
    const script = document.createElement('script');
    script.src = CHART_JS_SRC;
    script.async = false;
    script.onload = () =>
      window.Chart ? resolve() : reject(new Error('Chart.js non disponibile'));
    script.onerror = () => reject(new Error('Errore caricamento Chart.js'));
    document.head.appendChild(script);
  });
  return chartJsPromise;
}

function uniqueId(prefix) {
  return `${prefix}-${Math.random().toString(16).slice(2, 8)}`;
}

function parseNumber(value, fallback = 0) {
  if (value == null || value === '' || value === '—') return fallback;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  const parsed = parseFloat(String(value).replace(/[^0-9+-.]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parsePercentString(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;
  if (value.includes('%')) {
    const parsed = parseFloat(value.replace(/[^0-9+-.]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  const parsed = parseFloat(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed > 1 ? parsed : parsed * 100;
}

function computeToneColor(value) {
  if (value > 0.3) return COLORS.ok;
  if (value < -0.3) return COLORS.err;
  if (Math.abs(value) < 0.15) return COLORS.warn;
  return COLORS.neutral;
}

// ---------------------------------------------------------------------------
// Primary charts
// ---------------------------------------------------------------------------

async function renderRegimePrimary(chartNode, data) {
  const canvasId = uniqueId('f1b-regime-primary');
  const regimeScore = parseNumber(data?.regime_and_risk?.RegimeScore?.raw, 0);
  const strategy =
    data?.regime_and_risk?.StrategyMode_macro?.raw ||
    data?.regime_and_risk?.StrategyMode_macro ||
    '—';
  const color = computeToneColor(regimeScore);

  chartNode.innerHTML = `
    <canvas id="${canvasId}" aria-label="RegimeScore gauge" role="img"></canvas>
  `;

  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['RegimeScore'],
      datasets: [
        {
          data: [regimeScore],
          backgroundColor: color,
          borderColor: color,
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: {
          min: -1,
          max: 1,
          ticks: {
            color: COLORS.textMuted,
            callback: (value) => {
              if (value === -1) return 'Risk-off (-1)';
              if (value === 0) return 'Neutro (0)';
              if (value === 1) return 'Risk-on (+1)';
              return value.toFixed(2);
            },
          },
          grid: {
            color: COLORS.grid,
          },
        },
        y: {
          ticks: { display: false },
          grid: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: COLORS.backdrop,
          titleColor: COLORS.text,
          bodyColor: COLORS.text,
          callbacks: {
            label: () => `RegimeScore ${regimeScore.toFixed(2)} · Mode ${strategy}`,
          },
        },
        title: {
          display: true,
          text: `Strategy Mode ${strategy}`,
          color: COLORS.text,
          padding: { bottom: 12 },
          font: { size: 14, weight: '600' },
        },
      },
    },
  });
}

async function renderBreadthPrimary(chartNode, data) {
  const canvasId = uniqueId('f1b-breadth-primary');
  const breadthRaw = data?.breadth_rotation?.Breadth_1M?.raw;
  const breadthPercent = parsePercentString(
    typeof breadthRaw === 'number' ? breadthRaw * 100 : breadthRaw
  );
  const pct = Number.isFinite(breadthPercent) ? breadthPercent : 50;
  const riskTilt =
    data?.breadth_rotation?.RiskTilt_1M?.raw || data?.breadth_rotation?.RiskTilt_1M || '—';

  chartNode.innerHTML = `
    <canvas id="${canvasId}" aria-label="Breadth 1M" role="img"></canvas>
  `;

  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new window.Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Settori in rialzo', 'Settori in calo/neutri'],
      datasets: [
        {
          data: [pct, Math.max(0, 100 - pct)],
          backgroundColor: [
            pct >= 60 ? COLORS.ok : pct <= 40 ? COLORS.err : COLORS.warn,
            COLORS.neutral,
          ],
          borderColor: '#0f172a',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: COLORS.text,
            padding: 12,
          },
        },
        title: {
          display: true,
          text: `RiskTilt ${riskTilt}`,
          color: COLORS.text,
          padding: { bottom: 10 },
          font: { size: 14, weight: '600' },
        },
        tooltip: {
          backgroundColor: COLORS.backdrop,
          titleColor: COLORS.text,
          bodyColor: COLORS.text,
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed.toFixed(1)}%`,
          },
        },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Section charts
// ---------------------------------------------------------------------------

async function renderRegimeSection(chartNode, data) {
  return renderRegimePrimary(chartNode, data);
}

async function renderBreadthSection(chartNode, data) {
  const canvasId = uniqueId('f1b-leadership');
  const leaders = data?.breadth_rotation?.Leadership?.LeadersMultiTF?.items || [];
  const defensive = data?.breadth_rotation?.Leadership?.DefensiveLeadership?.items || [];
  const lagging = data?.breadth_rotation?.Leadership?.Lagging?.items || [];

  const bars = [
    ...leaders.map((sector) => ({ label: sector, value: 1, color: COLORS.ok })),
    ...defensive.map((sector) => ({ label: sector, value: 0.4, color: COLORS.warn })),
    ...lagging.map((sector) => ({ label: sector, value: -0.6, color: COLORS.err })),
  ];

  if (bars.length === 0) {
    chartNode.innerHTML = `
      <div class="empty-state">
        Leadership settoriale non disponibile in questo snapshot.
      </div>
    `;
    return;
  }

  chartNode.innerHTML = `<canvas id="${canvasId}" role="img"></canvas>`;
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: bars.map((b) => b.label),
      datasets: [
        {
          label: 'Leadership relativa',
          data: bars.map((b) => b.value),
          backgroundColor: bars.map((b) => b.color),
          borderColor: bars.map((b) => b.color),
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: {
          min: -1,
          max: 1,
          grid: { color: COLORS.grid },
          ticks: {
            color: COLORS.textMuted,
            callback: (value) => {
              if (value > 0) return 'Leader';
              if (value < 0) return 'Lagging';
              return 'Neutro';
            },
          },
        },
        y: {
          grid: { display: false },
          ticks: { color: COLORS.text },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: COLORS.backdrop,
          titleColor: COLORS.text,
          bodyColor: COLORS.text,
        },
      },
    },
  });
}

async function renderVolatilitySection(chartNode, data) {
  const canvasId = uniqueId('f1b-volatility');
  const vix = parseNumber(data?.market_microstructure?.VIX_level, 18);
  const curveComment = data?.market_microstructure?.Curve_state?.CurveShape_comment || '';
  const spreadMatch = curveComment.match(/([-+]?\d+\.?\d*)/);
  const curveSpread = spreadMatch ? parseFloat(spreadMatch[1]) : 0;

  chartNode.innerHTML = `<canvas id="${canvasId}" role="img"></canvas>`;
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['VIX', '2s10s spread'],
      datasets: [
        {
          data: [vix, Math.abs(curveSpread)],
          backgroundColor: [
            vix < 20 ? COLORS.ok : vix > 30 ? COLORS.err : COLORS.warn,
            COLORS.primary,
          ],
          borderColor: [vix < 20 ? COLORS.ok : vix > 30 ? COLORS.err : COLORS.warn, COLORS.primary],
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: COLORS.text },
        },
        y: {
          beginAtZero: true,
          grid: { color: COLORS.grid },
          ticks: { color: COLORS.textMuted },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: COLORS.backdrop,
          titleColor: COLORS.text,
          bodyColor: COLORS.text,
          callbacks: {
            label: (ctx) => {
              if (ctx.label === 'VIX') {
                const tone = vix < 20 ? 'Calma' : vix > 30 ? 'Stress' : 'Moderato';
                return `VIX ${ctx.parsed.y.toFixed(1)} (${tone})`;
              }
              return `Spread ${curveSpread.toFixed(2)}bp`;
            },
          },
        },
      },
    },
  });
}

async function renderSizeSection(chartNode, data) {
  const canvasId = uniqueId('f1b-size');
  const bias = data?.size_distribution?.SizeBiasPattern || 'Mixed';
  const stress = data?.size_distribution?.StressMicroCap === true ? 1 : 0;
  const biasPoints = bias.split('/').map((part) => part.trim());

  const categories = ['Mega/Large', 'Mid', 'Small/Micro'];
  const values = categories.map((category) =>
    biasPoints.some((point) => point.toLowerCase().includes(category.split('/')[0].toLowerCase()))
      ? 1
      : 0.2
  );

  chartNode.innerHTML = `<canvas id="${canvasId}" role="img"></canvas>`;
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new window.Chart(ctx, {
    type: 'radar',
    data: {
      labels: categories,
      datasets: [
        {
          label: 'Bias dimensionale',
          data: values,
          backgroundColor: 'rgba(37, 99, 235, 0.25)',
          borderColor: COLORS.primary,
          borderWidth: 2,
          pointBackgroundColor: COLORS.primary,
        },
        {
          label: 'Stress microcap',
          data: categories.map((category) => (category.includes('Small') ? stress : 0.1)),
          backgroundColor: 'rgba(220, 38, 38, 0.15)',
          borderColor: COLORS.err,
          borderWidth: 1.5,
          borderDash: [6, 6],
          pointBackgroundColor: COLORS.err,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 1.2,
          grid: { color: COLORS.grid },
          angleLines: { color: COLORS.grid },
          pointLabels: { color: COLORS.text },
          ticks: { display: false },
        },
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: COLORS.text },
        },
        tooltip: {
          backgroundColor: COLORS.backdrop,
          titleColor: COLORS.text,
          bodyColor: COLORS.text,
        },
      },
    },
  });
}

async function renderRiskWindowSection(chartNode, data) {
  const canvasId = uniqueId('f1b-risk');
  const snapshot = data?.risk_window?.RiskWindow_F1 || {};
  const metrics = [
    { label: 'Score', value: parseNumber(snapshot.Score, 0) },
    { label: 'Vol', value: parseNumber(snapshot.Vol, 0) },
    { label: 'Rates', value: parseNumber(snapshot.Rates, 0) },
    { label: 'Commodities', value: parseNumber(snapshot.Commodities, 0) },
    { label: 'Event', value: parseNumber(snapshot.Event, 0) },
  ];

  chartNode.innerHTML = `<canvas id="${canvasId}" role="img"></canvas>`;
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: metrics.map((m) => m.label),
      datasets: [
        {
          label: 'Risk Window Components',
          data: metrics.map((m) => m.value),
          fill: true,
          tension: 0.35,
          backgroundColor: 'rgba(234, 88, 12, 0.18)',
          borderColor: COLORS.warn,
          borderWidth: 2,
          pointBackgroundColor: COLORS.warn,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: COLORS.text },
        },
        y: {
          grid: { color: COLORS.grid },
          ticks: { color: COLORS.textMuted },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: COLORS.backdrop,
          titleColor: COLORS.text,
          bodyColor: COLORS.text,
        },
      },
    },
  });
}

async function renderStreetSection(chartNode, data) {
  const canvasId = uniqueId('f1b-street');
  const toneRaw = data?.analysis_headlines?.T1_ConsensusTone || '';
  const toneLower = toneRaw.toLowerCase();
  let toneScore = 0;
  if (toneLower.includes('pos')) toneScore = 1;
  if (toneLower.includes('neg')) toneScore = -1;

  chartNode.innerHTML = `<canvas id="${canvasId}" role="img"></canvas>`;
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Consensus Tone'],
      datasets: [
        {
          data: [toneScore],
          backgroundColor: [toneScore >= 0 ? COLORS.ok : COLORS.err],
          borderColor: [toneScore >= 0 ? COLORS.ok : COLORS.err],
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: {
          min: -1,
          max: 1,
          ticks: {
            color: COLORS.textMuted,
            callback: (value) => {
              if (value === -1) return 'Negativo';
              if (value === 0) return 'Neutro';
              if (value === 1) return 'Positivo';
              return value;
            },
          },
          grid: { color: COLORS.grid },
        },
        y: {
          ticks: { color: COLORS.text },
          grid: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: COLORS.backdrop,
          titleColor: COLORS.text,
          bodyColor: COLORS.text,
          callbacks: {
            label: () => `Tone ${toneRaw || 'Neutro'}`,
          },
        },
      },
    },
  });
}

async function renderFinvizSection(chartNode, data) {
  const canvasId = uniqueId('f1b-finviz');
  const query = data?.finvizFilters?.QueryString || '';
  const filters = {
    Momentum: /momentum/i.test(query) ? 1 : 0,
    Value: /value/i.test(query) ? 1 : 0,
    Pullback: /pullback/i.test(query) || /WeekDown/i.test(query) ? 1 : 0,
    LargeCap: /Large|Mega/i.test(query) ? 1 : 0,
    MidCap: /Mid/i.test(query) ? 1 : 0,
    SmallCap: /Small|Micro/i.test(query) ? 1 : 0,
  };

  chartNode.innerHTML = `<canvas id="${canvasId}" role="img"></canvas>`;
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new window.Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: Object.keys(filters),
      datasets: [
        {
          data: Object.values(filters).map((v) => v || 0.15),
          backgroundColor: [COLORS.primary, COLORS.ok, COLORS.err, '#0ea5e9', '#6366f1', '#f97316'],
          borderColor: '#0f172a',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          ticks: { display: false },
          grid: { color: COLORS.grid },
        },
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: COLORS.text },
        },
        tooltip: {
          backgroundColor: COLORS.backdrop,
          titleColor: COLORS.text,
          bodyColor: COLORS.text,
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed.toFixed(2)}`,
          },
        },
      },
    },
  });
}

async function renderBridgeSection(chartNode, data) {
  const canvasId = uniqueId('f1b-bridge');
  const handoff = data?.bridgeF2?.handoffSignals || {};
  const metrics = [
    { label: 'RegimeScore', value: parseNumber(handoff.RegimeScore, 0) },
    { label: 'Breadth 1M', value: parseNumber(handoff.Breadth_1M_pctSectorsGreen, 0) },
    { label: 'Stress MicroCap', value: handoff.StressMicroCap === true ? -0.5 : 0.2 },
    { label: 'RiskWindowScore', value: parseNumber(handoff.RiskWindowScore, 0) },
  ];

  chartNode.innerHTML = `<canvas id="${canvasId}" role="img"></canvas>`;
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: metrics.map((m) => m.label),
      datasets: [
        {
          data: metrics.map((m) => m.value),
          backgroundColor: metrics.map((m) => (m.value >= 0 ? COLORS.ok : COLORS.err)),
          borderColor: metrics.map((m) => (m.value >= 0 ? COLORS.ok : COLORS.err)),
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: COLORS.text },
        },
        y: {
          grid: { color: COLORS.grid },
          ticks: { color: COLORS.textMuted },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: COLORS.backdrop,
          titleColor: COLORS.text,
          bodyColor: COLORS.text,
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed.y.toFixed(2)}`,
          },
        },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Public exports
// ---------------------------------------------------------------------------

export async function renderF1BPrimaryChart(chartId, container, chartContext) {
  if (!container) return;
  try {
    await ensureChartJs();
    switch (chartId) {
      case 'regime-overview':
        return renderRegimePrimary(container, chartContext);
      case 'breadth-overview':
        return renderBreadthPrimary(container, chartContext);
      default:
        container.innerHTML = '<div class="empty-state">Chart non disponibile.</div>';
    }
  } catch (error) {
    Logger.error('F1B Charts', `Errore render primary chart ${chartId}`, error);
    container.innerHTML = `
      <div class="error-state">
        <div class="error-state-title">Errore rendering chart</div>
        <div class="error-state-message">${error?.message || 'Errore sconosciuto'}</div>
      </div>
    `;
  }
}

export async function renderF1BSectionChart(chartType, container, chartContext) {
  if (!container) return;
  try {
    await ensureChartJs();
    switch (chartType) {
      case 'regime-gauge':
        return renderRegimeSection(container, chartContext);
      case 'breadth-leadership':
        return renderBreadthSection(container, chartContext);
      case 'volatility-curve':
        return renderVolatilitySection(container, chartContext);
      case 'size-distribution':
        return renderSizeSection(container, chartContext);
      case 'risk-window':
        return renderRiskWindowSection(container, chartContext);
      case 'street-tone':
        return renderStreetSection(container, chartContext);
      case 'finviz-focus':
        return renderFinvizSection(container, chartContext);
      case 'bridge-handsoff':
        return renderBridgeSection(container, chartContext);
      default:
        container.innerHTML = '<div class="empty-state">Chart non disponibile.</div>';
    }
  } catch (error) {
    Logger.error('F1B Charts', `Errore rendering section chart ${chartType}`, error);
    container.innerHTML = `
      <div class="error-state">
        <div class="error-state-title">Errore rendering chart</div>
        <div class="error-state-message">${error?.message || 'Errore sconosciuto'}</div>
      </div>
    `;
  }
}
// /report/assets/js/components/f1b-charts.js
// F1B Charts Component - Chart Visualizations for Market Regime Analysis
// Versione 2025 - Design Istituzionale
// Tutto dinamico, dati dal JSON, spiegazioni AI integrate

import Logger from '../utils/logger.js';

// ===== COLORS PALETTE =====
const CHART_COLORS = {
  ok: 'rgba(22, 163, 74, 0.88)', // Verde (risk-on)
  warn: 'rgba(234, 88, 12, 0.88)', // Arancione (neutro)
  err: 'rgba(220, 38, 38, 0.88)', // Rosso (risk-off)
  neutral: '#64748b', // Grigio
  primary: '#2563eb', // Blu
  grid: 'rgba(255, 255, 255, 0.05)',
  text: '#f0f0f0',
  textMuted: '#b8b8b8',
  background: 'rgba(15, 15, 15, 0.5)',
};

// ===== HELPER FUNCTIONS =====
function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function parseRegimeScore(score) {
  if (typeof score === 'number') return score;
  if (typeof score === 'string') {
    const parsed = parseFloat(score.replace(/[+\s]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  if (score?.raw) return parseRegimeScore(score.raw);
  return 0;
}

function parseNumber(value, fallback = 0) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? fallback : parsed;
  }
  if (value?.raw) return parseNumber(value.raw, fallback);
  return fallback;
}

function getAINote(data, path, fallback = '') {
  const keys = path.split('.');
  let val = data;
  for (const key of keys) {
    if (val && typeof val === 'object') {
      val = val[key];
    } else {
      return fallback;
    }
  }
  return val?.ai_note || fallback;
}

function getToneColor(tone) {
  if (tone === 'green' || tone === 'ok') return CHART_COLORS.ok;
  if (tone === 'red' || tone === 'err') return CHART_COLORS.err;
  if (tone === 'yellow' || tone === 'warn') return CHART_COLORS.warn;
  return CHART_COLORS.neutral;
}

// ===== CHART 1: RegimeScore Gauge =====
async function renderRegimeScoreGauge(container, f1bData) {
  try {
    const regimeScoreObj = f1bData?.regime_and_risk?.RegimeScore;
    const regimeScore = parseRegimeScore(regimeScoreObj);
    const strategyMode =
      f1bData?.regime_and_risk?.StrategyMode_macro?.raw ||
      f1bData?.regime_and_risk?.StrategyMode_macro ||
      '—';
    const aiNote = getAINote(
      f1bData,
      'regime_and_risk.RegimeScore',
      "Score sintetico che misura l'appetito al rischio del mercato. Valori positivi indicano risk-on, valori negativi risk-off."
    );

    // Interpretazione
    let interpretation = 'Neutro';
    let color = CHART_COLORS.warn;
    if (regimeScore > 0.3) {
      interpretation = 'Risk-on';
      color = CHART_COLORS.ok;
    } else if (regimeScore < -0.3) {
      interpretation = 'Risk-off';
      color = CHART_COLORS.err;
    }

    const chartHTML = `
      <div class="chart-container" data-chart-id="regime-score-gauge">
        <div class="chart-title">RegimeScore</div>
        <div class="chart-description">
          <strong>Valore corrente: ${regimeScore.toFixed(2)}</strong> (${interpretation}) · StrategyMode: ${escapeHtml(String(strategyMode))}
          <br><br>
          <strong>Spiegazione AI:</strong> ${escapeHtml(aiNote)}
        </div>
        <div class="chart-wrapper" style="height: 120px; margin-top: 1rem;">
          <canvas id="regime-score-gauge"></canvas>
        </div>
      </div>
    `;

    container.innerHTML += chartHTML;

    const canvas = document.getElementById('regime-score-gauge');
    if (!canvas || !window.Chart) {
      Logger.error('F1B Charts', 'Canvas o Chart.js non disponibile per RegimeScore Gauge');
      return;
    }

    // Gauge chart: barra orizzontale che mostra il RegimeScore
    new window.Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['RegimeScore'],
        datasets: [
          {
            label: 'RegimeScore',
            data: [regimeScore],
            backgroundColor: color,
            borderColor: color,
            borderWidth: 2,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: -1,
            max: 1,
            ticks: {
              color: CHART_COLORS.textMuted,
              callback: function (value) {
                if (value === -1) return 'Risk-off (-1)';
                if (value === 0) return 'Neutro (0)';
                if (value === 1) return 'Risk-on (+1)';
                return value.toFixed(2);
              },
            },
            grid: {
              color: function (context) {
                if (context.tick.value === 0) return CHART_COLORS.neutral;
                return CHART_COLORS.grid;
              },
            },
          },
          y: {
            ticks: {
              display: false,
            },
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: CHART_COLORS.background,
            titleColor: CHART_COLORS.text,
            bodyColor: CHART_COLORS.text,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            callbacks: {
              label: function (context) {
                return `RegimeScore: ${regimeScore.toFixed(2)} (${interpretation})`;
              },
            },
          },
        },
      },
    });

    Logger.debug('F1B Charts', 'RegimeScore Gauge renderizzato');
  } catch (err) {
    Logger.error('F1B Charts', 'Errore rendering RegimeScore Gauge', err);
  }
}

// ===== CHART 2: Breadth 1M Visualization =====
async function renderBreadthChart(container, f1bData) {
  try {
    const breadthObj = f1bData?.breadth_rotation?.Breadth_1M;
    const breadth = parseNumber(breadthObj, 0.5);
    const breadthPercent = (breadth * 100).toFixed(0);
    const aiNote = getAINote(
      f1bData,
      'breadth_rotation.Breadth_1M',
      'Breadth 1M misura la quota di settori in rialzo negli ultimi 30 giorni. Valori >60% indicano rialzo diffuso.'
    );

    const riskTilt =
      f1bData?.breadth_rotation?.RiskTilt_1M?.raw || f1bData?.breadth_rotation?.RiskTilt_1M || '—';
    const riskTiltNote = getAINote(
      f1bData,
      'breadth_rotation.RiskTilt_1M',
      'RiskTilt indica la preferenza tra settori growth/ciclici (pro-rischio) vs settori difensivi (risk-off).'
    );

    const chartHTML = `
      <div class="chart-container" data-chart-id="breadth-chart">
        <div class="chart-title">Breadth 1M & RiskTilt</div>
        <div class="chart-description">
          <strong>Breadth 1M: ${breadthPercent}%</strong> settori in rialzo · <strong>RiskTilt:</strong> ${escapeHtml(String(riskTilt))}
          <br><br>
          <strong>Spiegazione AI - Breadth:</strong> ${escapeHtml(aiNote)}
          <br><br>
          <strong>Spiegazione AI - RiskTilt:</strong> ${escapeHtml(riskTiltNote)}
        </div>
        <div class="chart-wrapper" style="height: 200px; margin-top: 1rem;">
          <canvas id="breadth-chart"></canvas>
        </div>
      </div>
    `;

    container.innerHTML += chartHTML;

    const canvas = document.getElementById('breadth-chart');
    if (!canvas || !window.Chart) {
      Logger.error('F1B Charts', 'Canvas o Chart.js non disponibile per Breadth Chart');
      return;
    }

    // Doughnut chart per Breadth
    new window.Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Settori in rialzo', 'Settori in calo/neutri'],
        datasets: [
          {
            data: [breadthPercent, 100 - breadthPercent],
            backgroundColor: [
              breadth > 60 ? CHART_COLORS.ok : breadth > 40 ? CHART_COLORS.warn : CHART_COLORS.err,
              CHART_COLORS.neutral,
            ],
            borderColor: 'rgba(15, 15, 15, 1)',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: CHART_COLORS.text,
              padding: 15,
            },
          },
          tooltip: {
            backgroundColor: CHART_COLORS.background,
            titleColor: CHART_COLORS.text,
            bodyColor: CHART_COLORS.text,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${value.toFixed(1)}%`;
              },
            },
          },
        },
      },
    });

    Logger.debug('F1B Charts', 'Breadth Chart renderizzato');
  } catch (err) {
    Logger.error('F1B Charts', 'Errore rendering Breadth Chart', err);
  }
}

// ===== CHART 3: Leadership Settoriale =====
async function renderLeadershipChart(container, f1bData) {
  try {
    const leadership = f1bData?.breadth_rotation?.Leadership || {};
    const leaders = leadership?.LeadersMultiTF?.items || [];
    const defensive = leadership?.DefensiveLeadership?.items || [];
    const lagging = leadership?.Lagging?.items || [];
    const aiNote = getAINote(
      f1bData,
      'breadth_rotation.Leadership',
      'I settori in leadership guidano il mercato, mentre quelli in ritardo possono indicare rotazioni in corso.'
    );

    // Se non ci sono dati, mostra messaggio informativo
    if (leaders.length === 0 && lagging.length === 0 && defensive.length === 0) {
      const chartHTML = `
        <div class="chart-container" data-chart-id="leadership-chart">
          <div class="chart-title">Leadership Settoriale</div>
          <div class="chart-description">
            Dati settoriali non disponibili in questo report. I dati di leadership settoriale mostrano 
            quali settori guidano il mercato (leaders) e quali sono in ritardo (lagging).
          </div>
        </div>
      `;
      container.innerHTML += chartHTML;
      return;
    }

    const chartHTML = `
      <div class="chart-container" data-chart-id="leadership-chart">
        <div class="chart-title">Leadership Settoriale</div>
        <div class="chart-description">
          <strong>Leaders:</strong> ${leaders.length > 0 ? leaders.join(', ') : 'Nessuno'} · 
          <strong>Difensivi:</strong> ${defensive.length > 0 ? defensive.join(', ') : 'Nessuno'} · 
          <strong>In ritardo:</strong> ${lagging.length > 0 ? lagging.join(', ') : 'Nessuno'}
          <br><br>
          <strong>Spiegazione AI:</strong> ${escapeHtml(aiNote)}
        </div>
        <div class="chart-wrapper" style="height: ${Math.max(300, (leaders.length + defensive.length + lagging.length) * 40)}px; margin-top: 1rem;">
          <canvas id="leadership-chart"></canvas>
        </div>
      </div>
    `;

    container.innerHTML += chartHTML;

    const canvas = document.getElementById('leadership-chart');
    if (!canvas || !window.Chart) {
      Logger.error('F1B Charts', 'Canvas o Chart.js non disponibile per Leadership Chart');
      return;
    }

    // Prepara dati per chart a barre orizzontali
    const allSectors = [
      ...leaders.map((s) => ({ sector: s, type: 'leader', value: 1 })),
      ...defensive.map((s) => ({ sector: s, type: 'defensive', value: 0.5 })),
      ...lagging.map((s) => ({ sector: s, type: 'lagging', value: -0.5 })),
    ];

    new window.Chart(canvas, {
      type: 'bar',
      data: {
        labels: allSectors.map((s) => s.sector),
        datasets: [
          {
            label: 'Performance Relativa',
            data: allSectors.map((s) => s.value),
            backgroundColor: allSectors.map((s) =>
              s.type === 'leader'
                ? CHART_COLORS.ok
                : s.type === 'defensive'
                  ? CHART_COLORS.warn
                  : CHART_COLORS.err
            ),
            borderColor: allSectors.map((s) =>
              s.type === 'leader'
                ? CHART_COLORS.ok
                : s.type === 'defensive'
                  ? CHART_COLORS.warn
                  : CHART_COLORS.err
            ),
            borderWidth: 2,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: -1,
            max: 1,
            ticks: {
              color: CHART_COLORS.textMuted,
              callback: function (value) {
                if (value > 0) return 'Leader';
                if (value < 0) return 'Lagging';
                return 'Neutro';
              },
            },
            grid: {
              color: CHART_COLORS.grid,
            },
          },
          y: {
            ticks: {
              color: CHART_COLORS.text,
            },
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: CHART_COLORS.background,
            titleColor: CHART_COLORS.text,
            bodyColor: CHART_COLORS.text,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            callbacks: {
              label: function (context) {
                const sector = context.label;
                const type = allSectors[context.dataIndex].type;
                const typeLabel =
                  type === 'leader' ? 'Leader' : type === 'defensive' ? 'Difensivo' : 'In ritardo';
                return `${typeLabel}: ${sector}`;
              },
            },
          },
        },
      },
    });

    Logger.debug('F1B Charts', 'Leadership Chart renderizzato');
  } catch (err) {
    Logger.error('F1B Charts', 'Errore rendering Leadership Chart', err);
  }
}

// ===== CHART 4: Volatilità (VIX) =====
async function renderVolatilityChart(container, f1bData) {
  try {
    const volRegime =
      f1bData?.regime_and_risk?.VolRegime?.raw ||
      f1bData?.internals_raw?.Vol_USD?.items?.[0] ||
      'VIX ~17';
    const aiNote = getAINote(
      f1bData,
      'regime_and_risk.VolRegime',
      'VIX misura la volatilità attesa del mercato. VIX alto (>30) indica stress, VIX basso (<20) indica calma.'
    );

    // Estrai VIX da stringa
    const vixMatch = String(volRegime).match(/VIX[^\d]*(\d+\.?\d*)/);
    const vix = vixMatch ? parseFloat(vixMatch[1]) : 17;

    // Estrai spread curva (se disponibile)
    const curveItems = f1bData?.internals_raw?.Curve_UST?.items || [];
    let curveSpread = null;
    if (curveItems.length > 0) {
      const curveMatch = String(curveItems[0]).match(/(\d+\.?\d*)/);
      if (curveMatch) {
        curveSpread = parseFloat(curveMatch[1]);
      }
    }
    const curveNote = getAINote(
      f1bData,
      'internals_raw.Curve_UST',
      'La curva dei rendimenti (spread 2s10s) indica le aspettative economiche. Valori positivi indicano crescita attesa.'
    );

    const chartHTML = `
      <div class="chart-container" data-chart-id="volatility-chart">
        <div class="chart-title">Volatilità (VIX)${curveSpread !== null ? ' & Curva Rendimenti' : ''}</div>
        <div class="chart-description">
          <strong>VIX: ${vix.toFixed(1)}</strong> ${vix < 20 ? '(Calma)' : vix > 30 ? '(Stress)' : '(Moderato)'}
          ${curveSpread !== null ? ` · <strong>Spread 2s10s: ${curveSpread.toFixed(2)}%</strong>` : ''}
          <br><br>
          <strong>Spiegazione AI - VIX:</strong> ${escapeHtml(aiNote)}
          ${curveSpread !== null ? `<br><br><strong>Spiegazione AI - Curva:</strong> ${escapeHtml(curveNote)}` : ''}
        </div>
        <div class="chart-wrapper" style="height: 200px; margin-top: 1rem;">
          <canvas id="volatility-chart"></canvas>
        </div>
      </div>
    `;

    container.innerHTML += chartHTML;

    const canvas = document.getElementById('volatility-chart');
    if (!canvas || !window.Chart) {
      Logger.error('F1B Charts', 'Canvas o Chart.js non disponibile per Volatility Chart');
      return;
    }

    // Bar chart con VIX e eventualmente spread
    const labels = ['VIX'];
    const data = [vix];
    const colors = [vix < 20 ? CHART_COLORS.ok : vix > 30 ? CHART_COLORS.err : CHART_COLORS.warn];

    if (curveSpread !== null) {
      labels.push('Spread 2s10s (%)');
      data.push(Math.abs(curveSpread));
      colors.push(CHART_COLORS.primary);
    }

    new window.Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Valore',
            data: data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: CHART_COLORS.textMuted,
              callback: function (value) {
                return value.toFixed(1);
              },
            },
            grid: {
              color: CHART_COLORS.grid,
            },
          },
          x: {
            ticks: {
              color: CHART_COLORS.text,
            },
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: CHART_COLORS.background,
            titleColor: CHART_COLORS.text,
            bodyColor: CHART_COLORS.text,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            callbacks: {
              label: function (context) {
                const label = context.label;
                const value = context.parsed.y;
                if (label === 'VIX') {
                  const interpretation = value < 20 ? 'Calma' : value > 30 ? 'Stress' : 'Moderato';
                  return `VIX: ${value.toFixed(1)} (${interpretation})`;
                } else {
                  return `Spread 2s10s: ${value.toFixed(2)}%`;
                }
              },
            },
          },
        },
      },
    });

    Logger.debug('F1B Charts', 'Volatility Chart renderizzato');
  } catch (err) {
    Logger.error('F1B Charts', 'Errore rendering Volatility Chart', err);
  }
}

// ===== CHART 5: Confronto Metriche (Radar) =====
async function renderMetricsComparison(container, f1bData) {
  try {
    const regimeScore = parseRegimeScore(f1bData?.regime_and_risk?.RegimeScore);
    const breadth = parseNumber(f1bData?.breadth_rotation?.Breadth_1M, 0.5);
    const liquidity = parseRegimeScore(f1bData?.regime_and_risk?.LiquidityRegimeScore);
    const indexMomentum = parseRegimeScore(f1bData?.breadth_rotation?.IndexMomentum_1W);
    const smallCapPressure = parseNumber(f1bData?.breadth_rotation?.SmallCapPressure_1W, 0);

    // Normalizza valori su scala 0-1 per radar chart
    const normalize = (value, min, max) => {
      return Math.max(0, Math.min(1, (value - min) / (max - min)));
    };

    const chartHTML = `
      <div class="chart-container" data-chart-id="metrics-comparison">
        <div class="chart-title">Confronto Metriche F1B</div>
        <div class="chart-description">
          Visualizzazione comparativa delle principali metriche F1B. Valori più alti indicano condizioni più favorevoli al rischio.
          <br><br>
          <strong>Metriche:</strong> RegimeScore: ${regimeScore.toFixed(2)}, Breadth 1M: ${(breadth * 100).toFixed(0)}%, 
          Liquidità: ${liquidity.toFixed(2)}, Momentum: ${indexMomentum.toFixed(2)}, SmallCap: ${smallCapPressure.toFixed(2)}
        </div>
        <div class="chart-wrapper" style="height: 400px; margin-top: 1rem;">
          <canvas id="metrics-comparison"></canvas>
        </div>
      </div>
    `;

    container.innerHTML += chartHTML;

    const canvas = document.getElementById('metrics-comparison');
    if (!canvas || !window.Chart) {
      Logger.error('F1B Charts', 'Canvas o Chart.js non disponibile per Metrics Comparison');
      return;
    }

    // Radar chart
    new window.Chart(canvas, {
      type: 'radar',
      data: {
        labels: ['RegimeScore', 'Breadth 1M', 'Liquidità', 'Momentum', 'SmallCap'],
        datasets: [
          {
            label: 'Valori Normalizzati',
            data: [
              normalize(regimeScore, -1, 1),
              breadth, // già 0-1
              normalize(liquidity, -1, 1),
              normalize(indexMomentum, -1, 1),
              normalize(smallCapPressure, -1, 1),
            ],
            backgroundColor: 'rgba(22, 163, 74, 0.2)',
            borderColor: CHART_COLORS.ok,
            borderWidth: 2,
            pointBackgroundColor: CHART_COLORS.ok,
            pointBorderColor: CHART_COLORS.text,
            pointHoverBackgroundColor: CHART_COLORS.ok,
            pointHoverBorderColor: CHART_COLORS.text,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 1,
            ticks: {
              display: false,
            },
            grid: {
              color: CHART_COLORS.grid,
            },
            pointLabels: {
              color: CHART_COLORS.text,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: CHART_COLORS.background,
            titleColor: CHART_COLORS.text,
            bodyColor: CHART_COLORS.text,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    });

    Logger.debug('F1B Charts', 'Metrics Comparison renderizzato');
  } catch (err) {
    Logger.error('F1B Charts', 'Errore rendering Metrics Comparison', err);
  }
}

// ===== CHART 6: RiskTilt vs VolRegime Scatter =====
async function renderRiskTiltVsVolRegime(container, f1bData) {
  try {
    const riskTilt =
      f1bData?.breadth_rotation?.RiskTilt_1M?.raw ||
      f1bData?.breadth_rotation?.RiskTilt_1M ||
      'Neutro';
    const riskTiltNote = getAINote(
      f1bData,
      'breadth_rotation.RiskTilt_1M',
      'RiskTilt indica la preferenza tra settori growth/ciclici (pro-rischio) vs settori difensivi (risk-off).'
    );

    // Converti RiskTilt in valore numerico
    let riskTiltValue = 0;
    if (typeof riskTilt === 'string') {
      const lower = riskTilt.toLowerCase();
      if (lower.includes('pro-rischio') || lower.includes('risk-on') || lower.includes('growth')) {
        riskTiltValue = 1;
      } else if (lower.includes('difensivo') || lower.includes('risk-off')) {
        riskTiltValue = -1;
      }
    }

    const volRegimeRaw = f1bData?.regime_and_risk?.VolRegime?.raw || 'VIX ~17 (<20)';
    const vixMatch = String(volRegimeRaw).match(/VIX[^\d]*(\d+\.?\d*)/);
    const vix = vixMatch ? parseFloat(vixMatch[1]) : 17;
    const volRegimeValue = vix < 20 ? 1 : vix > 30 ? -1 : 0;
    const volNote = getAINote(
      f1bData,
      'regime_and_risk.VolRegime',
      'VolRegime misura le condizioni di volatilità. Bassa volatilità favorisce il risk-on.'
    );

    const chartHTML = `
      <div class="chart-container" data-chart-id="risktilt-vs-volregime">
        <div class="chart-title">RiskTilt vs VolRegime</div>
        <div class="chart-description">
          Confronto tra RiskTilt (preferenza growth vs difensivi) e VolRegime (volatilità). 
          Risk-on + bassa volatilità = mercato favorevole. Risk-off + alta volatilità = stress.
          <br><br>
          <strong>Spiegazione AI - RiskTilt:</strong> ${escapeHtml(riskTiltNote)}
          <br><br>
          <strong>Spiegazione AI - VolRegime:</strong> ${escapeHtml(volNote)}
        </div>
        <div class="chart-wrapper" style="height: 300px; margin-top: 1rem;">
          <canvas id="risktilt-vs-volregime"></canvas>
        </div>
      </div>
    `;

    container.innerHTML += chartHTML;

    const canvas = document.getElementById('risktilt-vs-volregime');
    if (!canvas || !window.Chart) {
      Logger.error('F1B Charts', 'Canvas o Chart.js non disponibile per RiskTilt vs VolRegime');
      return;
    }

    // Scatter plot
    const pointColor =
      riskTiltValue > 0 && volRegimeValue > 0
        ? CHART_COLORS.ok
        : riskTiltValue < 0 && volRegimeValue < 0
          ? CHART_COLORS.err
          : CHART_COLORS.warn;

    new window.Chart(canvas, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'RiskTilt vs VolRegime',
            data: [
              {
                x: riskTiltValue,
                y: volRegimeValue,
              },
            ],
            backgroundColor: pointColor,
            borderColor: pointColor,
            pointRadius: 10,
            pointHoverRadius: 12,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'RiskTilt (Risk-off ← → Risk-on)',
              color: CHART_COLORS.text,
            },
            min: -1.5,
            max: 1.5,
            grid: {
              color: CHART_COLORS.grid,
            },
            ticks: {
              color: CHART_COLORS.textMuted,
              callback: function (value) {
                if (value === -1) return 'Risk-off';
                if (value === 0) return 'Neutro';
                if (value === 1) return 'Risk-on';
                return '';
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'VolRegime (Alta Vol ← → Bassa Vol)',
              color: CHART_COLORS.text,
            },
            min: -1.5,
            max: 1.5,
            grid: {
              color: CHART_COLORS.grid,
            },
            ticks: {
              color: CHART_COLORS.textMuted,
              callback: function (value) {
                if (value === -1) return 'Alta Vol';
                if (value === 0) return 'Neutro';
                if (value === 1) return 'Bassa Vol';
                return '';
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: CHART_COLORS.background,
            titleColor: CHART_COLORS.text,
            bodyColor: CHART_COLORS.text,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            callbacks: {
              label: function (context) {
                return `RiskTilt: ${riskTiltValue.toFixed(2)}, VolRegime: ${volRegimeValue.toFixed(2)}`;
              },
            },
          },
        },
      },
    });

    Logger.debug('F1B Charts', 'RiskTilt vs VolRegime renderizzato');
  } catch (err) {
    Logger.error('F1B Charts', 'Errore rendering RiskTilt vs VolRegime', err);
  }
}

// ===== MAIN RENDER FUNCTION =====
export async function renderF1BCharts(container, f1bData) {
  if (!container) {
    Logger.error('F1B Charts', 'Container non fornito');
    return;
  }

  Logger.debug('F1B Charts', 'Inizio rendering chart F1B', f1bData);

  // Pulisci container
  container.innerHTML = '';

  // Carica Chart.js se non è già disponibile
  if (!window.Chart) {
    try {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
      script.async = false;

      await new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${script.src}"]`);
        if (existingScript && window.Chart) {
          Logger.debug('F1B Charts', 'Chart.js già caricato');
          resolve();
          return;
        }

        script.onload = () => {
          if (window.Chart) {
            Logger.debug('F1B Charts', 'Chart.js caricato');
            resolve();
          } else {
            reject(new Error('Chart.js non disponibile dopo il caricamento'));
          }
        };
        script.onerror = () => {
          Logger.error('F1B Charts', 'Errore caricamento Chart.js');
          reject(new Error('Errore caricamento Chart.js'));
        };
        document.head.appendChild(script);
      });
    } catch (err) {
      Logger.error('F1B Charts', 'Errore caricamento Chart.js', err);
      container.innerHTML = `
        <div class="error-state">
          <div class="error-state-title">Errore caricamento Chart.js</div>
          <div class="error-state-message">Impossibile caricare la libreria per i grafici. Ricarica la pagina.</div>
        </div>
      `;
      return;
    }
  }

  Logger.debug('F1B Charts', 'Chart.js disponibile, inizio rendering');

  // Renderizza tutti i chart in sequenza (tutto dinamico dal JSON)
  try {
    // Chart 1: RegimeScore Gauge
    await renderRegimeScoreGauge(container, f1bData);

    // Chart 2: Breadth 1M
    await renderBreadthChart(container, f1bData);

    // Chart 3: Leadership Settoriale
    await renderLeadershipChart(container, f1bData);

    // Chart 4: Volatilità VIX
    await renderVolatilityChart(container, f1bData);

    // Chart 5: Confronto Metriche (Radar)
    await renderMetricsComparison(container, f1bData);

    // Chart 6: RiskTilt vs VolRegime
    await renderRiskTiltVsVolRegime(container, f1bData);

    Logger.debug('F1B Charts', 'Tutti i chart F1B renderizzati');
  } catch (err) {
    Logger.error('F1B Charts', 'Errore durante rendering chart', err);
    container.innerHTML = `
      <div class="error-state">
        <div class="error-state-title">Errore rendering chart</div>
        <div class="error-state-message">${escapeHtml(err.message)}</div>
      </div>
    `;
  }
}

// ===== EXPORT =====
export const f1bCharts = {
  render: renderF1BCharts,
};
