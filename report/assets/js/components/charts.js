// /report/assets/js/components/charts.js
// Componente Grafici Interattivi - Chart.js
// Versione 2025 - Design Istituzionale

import Logger from '../utils/logger.js';

// BEST PRACTICE: Usa import ES module invece di CDN per evitare CSP violations
// Chart.js sarà bundle da Vite se presente in node_modules
let ChartJS = null;
let ChartLoaded = false;

async function loadChartJS() {
  if (ChartLoaded && ChartJS) {
    return ChartJS;
  }

  try {
    // Prova import ES module (bundle da Vite)
    const chartModule = await import('chart.js');
    ChartJS = chartModule.Chart || chartModule.default?.Chart || chartModule.default || chartModule;
    ChartLoaded = true;
    Logger.debug('Charts', 'Chart.js caricato da bundle');
    return ChartJS;
  } catch (importError) {
    // Fallback a CDN solo se import fallisce (per compatibilità)
    Logger.warn('Charts', 'Import fallito, uso CDN fallback:', importError);
    
    // Usa CDN per Chart.js (fallback)
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
      script.onload = () => {
        ChartJS = window.Chart;
        ChartLoaded = true;
        Logger.debug('Charts', 'Chart.js caricato da CDN');
        resolve(ChartJS);
      };
      script.onerror = () => {
        Logger.error('Charts', 'Errore caricamento Chart.js');
        reject(new Error('Errore caricamento Chart.js'));
      };
      document.head.appendChild(script);
    });

    return ChartJS;
  } catch (err) {
    Logger.error('Charts', 'Errore caricamento Chart.js', err);
    throw err;
  }
}

// ===== CONFIGURAZIONE GLOBALE CHART.JS =====
function setupChartJSDefaults(Chart) {
  // Configurazione globale per design istituzionale
  Chart.defaults.color = '#f0f0f0'; // --ink-soft
  Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
  Chart.defaults.backgroundColor = 'rgba(255, 255, 255, 0.05)';
  Chart.defaults.font.family = 'Inter, ui-sans-serif, system-ui';
  Chart.defaults.font.size = 12;
  Chart.defaults.font.lineHeight = 1.5;
  Chart.defaults.plugins.legend.display = true;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.padding = 12;
  Chart.defaults.plugins.legend.labels.font.size = 12;
  Chart.defaults.plugins.tooltip.enabled = true;
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 15, 15, 0.95)';
  Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
  Chart.defaults.plugins.tooltip.bodyColor = '#f0f0f0';
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.interaction.intersect = false;
  Chart.defaults.interaction.mode = 'index';
  Chart.defaults.responsive = true;
  Chart.defaults.maintainAspectRatio = false;
}

// ===== COLORS PALETTE =====
const CHART_COLORS = {
  primary: '#2563eb', // --brand-600
  primaryLight: '#3b82f6', // --brand-500
  ok: 'rgba(22, 163, 74, 0.88)', // --ok
  warn: 'rgba(234, 88, 12, 0.88)', // --warn
  err: 'rgba(220, 38, 38, 0.88)', // --err
  neutral: '#64748b', // --neutral
  grid: 'rgba(255, 255, 255, 0.05)',
  text: '#f0f0f0', // --ink-soft
  textMuted: '#b8b8b8', // --muted
};

// ===== LINE CHART =====
async function createLineChart(canvas, data, options = {}) {
  const Chart = await loadChartJS();
  setupChartJSDefaults(Chart);

  const config = {
    type: 'line',
    data: {
      labels: data.labels || [],
      datasets: data.datasets || [],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: options.showLegend !== false,
          position: options.legendPosition || 'top',
          labels: {
            color: CHART_COLORS.text,
            usePointStyle: true,
            padding: 12,
            font: {
              size: 12,
              family: 'Inter, ui-sans-serif, system-ui',
            },
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(15, 15, 15, 0.95)',
          titleColor: '#ffffff',
          bodyColor: CHART_COLORS.text,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: (context) => {
              return `${context.dataset.label}: ${context.parsed.y}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: CHART_COLORS.grid,
            drawBorder: false,
          },
          ticks: {
            color: CHART_COLORS.textMuted,
            font: {
              size: 11,
              family: 'Inter, ui-sans-serif, system-ui',
            },
          },
        },
        y: {
          grid: {
            color: CHART_COLORS.grid,
            drawBorder: false,
          },
          ticks: {
            color: CHART_COLORS.textMuted,
            font: {
              size: 11,
              family: 'Inter, ui-sans-serif, system-ui',
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      ...options,
    },
  };

  return new Chart(canvas, config);
}

// ===== BAR CHART =====
async function createBarChart(canvas, data, options = {}) {
  const Chart = await loadChartJS();
  setupChartJSDefaults(Chart);

  const config = {
    type: 'bar',
    data: {
      labels: data.labels || [],
      datasets: data.datasets || [],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: options.showLegend !== false,
          position: options.legendPosition || 'top',
        },
        tooltip: {
          enabled: true,
        },
      },
      scales: {
        x: {
          grid: {
            color: CHART_COLORS.grid,
            drawBorder: false,
          },
          ticks: {
            color: CHART_COLORS.textMuted,
          },
        },
        y: {
          grid: {
            color: CHART_COLORS.grid,
            drawBorder: false,
          },
          ticks: {
            color: CHART_COLORS.textMuted,
          },
        },
      },
      ...options,
    },
  };

  return new Chart(canvas, config);
}

// ===== PIE CHART =====
async function createPieChart(canvas, data, options = {}) {
  const Chart = await loadChartJS();
  setupChartJSDefaults(Chart);

  const config = {
    type: 'pie',
    data: {
      labels: data.labels || [],
      datasets: [
        {
          data: data.values || [],
          backgroundColor: data.colors || [
            CHART_COLORS.primary,
            CHART_COLORS.ok,
            CHART_COLORS.warn,
            CHART_COLORS.err,
            CHART_COLORS.neutral,
          ],
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: options.showLegend !== false,
          position: options.legendPosition || 'right',
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
      ...options,
    },
  };

  return new Chart(canvas, config);
}

// ===== RENDER CHART CONTAINER =====
function renderChartContainer(chartId, title = '', description = '') {
  return `
    <div class="chart-container" data-chart-id="${chartId}">
      ${title ? `<div class="chart-title">${title}</div>` : ''}
      ${description ? `<div class="chart-description">${description}</div>` : ''}
      <div class="chart-wrapper">
        <canvas id="${chartId}" role="img" aria-label="${title || 'Chart'}"></canvas>
      </div>
    </div>
  `;
}

// ===== PUBLIC API =====
export const charts = {
  /**
   * Crea line chart
   * @param {HTMLElement|string} container - Container o ID elemento
   * @param {Object} data - Dati chart {labels, datasets}
   * @param {Object} options - Opzioni chart
   * @returns {Promise<Chart>} Istanza Chart.js
   */
  async createLineChart(container, data, options = {}) {
    const canvas =
      typeof container === 'string'
        ? document.getElementById(container)
        : container.querySelector('canvas') || container;

    if (!canvas) {
      Logger.error('Charts', 'Canvas non trovato');
      return null;
    }

    return createLineChart(canvas, data, options);
  },

  /**
   * Crea bar chart
   * @param {HTMLElement|string} container - Container o ID elemento
   * @param {Object} data - Dati chart {labels, datasets}
   * @param {Object} options - Opzioni chart
   * @returns {Promise<Chart>} Istanza Chart.js
   */
  async createBarChart(container, data, options = {}) {
    const canvas =
      typeof container === 'string'
        ? document.getElementById(container)
        : container.querySelector('canvas') || container;

    if (!canvas) {
      Logger.error('Charts', 'Canvas non trovato');
      return null;
    }

    return createBarChart(canvas, data, options);
  },

  /**
   * Crea pie chart
   * @param {HTMLElement|string} container - Container o ID elemento
   * @param {Object} data - Dati chart {labels, values, colors}
   * @param {Object} options - Opzioni chart
   * @returns {Promise<Chart>} Istanza Chart.js
   */
  async createPieChart(container, data, options = {}) {
    const canvas =
      typeof container === 'string'
        ? document.getElementById(container)
        : container.querySelector('canvas') || container;

    if (!canvas) {
      Logger.error('Charts', 'Canvas non trovato');
      return null;
    }

    return createPieChart(canvas, data, options);
  },

  /**
   * Renderizza container chart
   * @param {string} chartId - ID univoco chart
   * @param {string} title - Titolo chart
   * @param {string} description - Descrizione chart
   * @returns {string} HTML container
   */
  renderContainer(chartId, title = '', description = '') {
    return renderChartContainer(chartId, title, description);
  },

  /**
   * Verifica se Chart.js è caricato
   * @returns {boolean} Chart.js caricato
   */
  isLoaded() {
    return ChartLoaded && ChartJS !== null;
  },
};
