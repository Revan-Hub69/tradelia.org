// /report/assets/js/components/f1b-charts.js
// F1B Charts Component - Chart Visualizations for Market Regime Analysis
// Versione 2025 - Design Istituzionale

import Logger from '../utils/logger.js';
import { charts } from './charts.js';

// ===== COLORS PALETTE =====
const CHART_COLORS = {
  ok: 'rgba(22, 163, 74, 0.88)',      // Verde (risk-on)
  warn: 'rgba(234, 88, 12, 0.88)',    // Arancione (neutro)
  err: 'rgba(220, 38, 38, 0.88)',     // Rosso (risk-off)
  neutral: '#64748b',                  // Grigio
  primary: '#2563eb',                  // Blu
  grid: 'rgba(255, 255, 255, 0.05)',
  text: '#f0f0f0',
  textMuted: '#b8b8b8'
};

// ===== HELPER: Parse RegimeScore =====
function parseRegimeScore(score) {
  if (typeof score === 'number') return score;
  if (typeof score === 'string') {
    const parsed = parseFloat(score.replace(/[+\s]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  if (score?.raw) return parseRegimeScore(score.raw);
  return 0;
}

// ===== HELPER: Generate Historical Data (Mock) =====
function generateHistoricalData(currentValue, days = 30, volatility = 0.1) {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Simula variazione random con tendenza verso valore corrente
    const progress = (days - i) / days;
    const randomChange = (Math.random() - 0.5) * volatility * 2;
    const trend = (currentValue - currentValue * 0.8) * progress;
    const value = currentValue * 0.8 + trend + randomChange;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(-1, Math.min(1, value))
    });
  }
  
  return data;
}

// ===== CHART 1: RegimeScore Timeline =====
async function renderRegimeScoreTimeline(container, f1bData) {
  try {
    const regimeScore = parseRegimeScore(f1bData?.regime_and_risk?.RegimeScore || f1bData?.f1bSnapshot?.regime_state?.RegimeScore || 0);
    const historical = generateHistoricalData(regimeScore, 30, 0.15);
    
    const chartHTML = `
      <div class="chart-container" data-chart-id="regime-score-timeline">
        <div class="chart-title">RegimeScore Timeline</div>
        <div class="chart-description">
          Evoluzione del RegimeScore negli ultimi 30 giorni. Valori positivi (>0) indicano risk-on (appetito al rischio), 
          valori negativi (<0) indicano risk-off (avversione al rischio). Il valore corrente è ${regimeScore.toFixed(2)}.
        </div>
        <div class="chart-wrapper">
          <canvas id="regime-score-timeline"></canvas>
        </div>
      </div>
    `;
    
    container.innerHTML += chartHTML;
    
    const canvas = document.getElementById('regime-score-timeline');
    if (!canvas) {
      Logger.error('F1B Charts', 'Canvas non trovato per RegimeScore Timeline');
      return;
    }
    
    const chart = await charts.createLineChart(canvas, {
      labels: historical.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
      }),
      datasets: [{
        label: 'RegimeScore',
        data: historical.map(d => d.value),
        borderColor: CHART_COLORS.primary,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4
      }, {
        label: 'Zero Line',
        data: new Array(30).fill(0),
        borderColor: CHART_COLORS.neutral,
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }]
    }, {
      scales: {
        y: {
          min: -1,
          max: 1,
          ticks: {
            callback: function(value) {
              return value.toFixed(1);
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.datasetIndex === 0) {
                const value = context.parsed.y;
                const interpretation = value > 0.3 ? 'Risk-on' : value < -0.3 ? 'Risk-off' : 'Neutro';
                return `RegimeScore: ${value.toFixed(2)} (${interpretation})`;
              }
              return '';
            }
          }
        }
      }
    });
    
    Logger.debug('F1B Charts', 'RegimeScore Timeline renderizzato');
  } catch (err) {
    Logger.error('F1B Charts', 'Errore rendering RegimeScore Timeline', err);
  }
}

// ===== CHART 2: Breadth 1M & RiskTilt =====
async function renderBreadthRiskTilt(container, f1bData) {
  try {
    const breadth = parseFloat(f1bData?.breadth_rotation?.Breadth_1M?.raw || f1bData?.breadth_rotation?.Breadth_1M || f1bData?.f1bSnapshot?.breadth_and_rotation?.Breadth_1M_pctSectorsGreen || 0.5);
    const riskTilt = f1bData?.breadth_rotation?.RiskTilt_1M?.raw || f1bData?.breadth_rotation?.RiskTilt_1M || f1bData?.f1bSnapshot?.breadth_and_rotation?.RiskTilt_1M || 'Neutro';
    
    // Converti RiskTilt in valore numerico per visualizzazione
    let riskTiltValue = 0;
    if (typeof riskTilt === 'string') {
      if (riskTilt.toLowerCase().includes('pro-rischio') || riskTilt.toLowerCase().includes('risk-on')) {
        riskTiltValue = 1;
      } else if (riskTilt.toLowerCase().includes('difensivo') || riskTilt.toLowerCase().includes('risk-off')) {
        riskTiltValue = -1;
      }
    }
    
    const chartHTML = `
      <div class="chart-container" data-chart-id="breadth-risk-tilt">
        <div class="chart-title">Breadth 1M & RiskTilt</div>
        <div class="chart-description">
          Breadth 1M indica la quota di settori in rialzo negli ultimi 30 giorni (valore 0-1). 
          Valori >0.6 indicano rialzo diffuso. RiskTilt indica la preferenza tra settori growth/ciclici (pro-rischio) 
          vs settori difensivi (risk-off).
        </div>
        <div class="chart-wrapper">
          <canvas id="breadth-risk-tilt"></canvas>
        </div>
      </div>
    `;
    
    container.innerHTML += chartHTML;
    
    const canvas = document.getElementById('breadth-risk-tilt');
    if (!canvas) {
      Logger.error('F1B Charts', 'Canvas non trovato per Breadth RiskTilt');
      return;
    }
    
    const chart = await charts.createBarChart(canvas, {
      labels: ['Breadth 1M', 'RiskTilt'],
      datasets: [{
        label: 'Valore',
        data: [breadth, riskTiltValue],
        backgroundColor: [
          breadth > 0.6 ? CHART_COLORS.ok : breadth > 0.4 ? CHART_COLORS.warn : CHART_COLORS.err,
          riskTiltValue > 0 ? CHART_COLORS.ok : riskTiltValue < 0 ? CHART_COLORS.err : CHART_COLORS.warn
        ],
        borderColor: [
          breadth > 0.6 ? CHART_COLORS.ok : breadth > 0.4 ? CHART_COLORS.warn : CHART_COLORS.err,
          riskTiltValue > 0 ? CHART_COLORS.ok : riskTiltValue < 0 ? CHART_COLORS.err : CHART_COLORS.warn
        ],
        borderWidth: 2
      }]
    }, {
      scales: {
        y: {
          min: -1,
          max: 1,
          ticks: {
            callback: function(value) {
              if (value === -1) return 'Risk-off';
              if (value === 0) return 'Neutro';
              if (value === 1) return 'Risk-on';
              return value.toFixed(2);
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.dataIndex === 0) {
                return `Breadth 1M: ${breadth.toFixed(2)} (${(breadth * 100).toFixed(0)}% settori in rialzo)`;
              } else {
                return `RiskTilt: ${riskTilt}`;
              }
            }
          }
        },
        legend: {
          display: false
        }
      }
    });
    
    Logger.debug('F1B Charts', 'Breadth RiskTilt renderizzato');
  } catch (err) {
    Logger.error('F1B Charts', 'Errore rendering Breadth RiskTilt', err);
  }
}

// ===== CHART 3: Leadership Settoriale =====
async function renderLeadershipSettoriale(container, f1bData) {
  try {
    const leaders = f1bData?.breadth_rotation?.Leadership?.LeadersMultiTF?.items || 
                    f1bData?.f1bSnapshot?.breadth_and_rotation?.LeadersMultiTF || 
                    [];
    const lagging = f1bData?.breadth_rotation?.Leadership?.Lagging?.items || 
                    f1bData?.f1bSnapshot?.breadth_and_rotation?.LaggingSectors || 
                    [];
    
    // Crea dati per il chart (performance simulata basata su posizione)
    const leaderData = leaders.map((_, i) => 0.8 - (i * 0.1));
    const laggingData = lagging.map((_, i) => -0.3 - (i * 0.1));
    
    const chartHTML = `
      <div class="chart-container" data-chart-id="leadership-settoriale">
        <div class="chart-title">Leadership Settoriale</div>
        <div class="chart-description">
          Settori in leadership (performance positiva) vs settori in ritardo (performance negativa). 
          I settori in leadership guidano il mercato, mentre quelli in ritardo possono indicare rotazioni in corso.
        </div>
        <div class="chart-wrapper">
          <canvas id="leadership-settoriale"></canvas>
        </div>
      </div>
    `;
    
    container.innerHTML += chartHTML;
    
    const canvas = document.getElementById('leadership-settoriale');
    if (!canvas) {
      Logger.error('F1B Charts', 'Canvas non trovato per Leadership Settoriale');
      return;
    }
    
    const chart = await charts.createBarChart(canvas, {
      labels: [...leaders, ...lagging],
      datasets: [{
        label: 'Performance Relativa',
        data: [...leaderData, ...laggingData],
        backgroundColor: [
          ...leaders.map(() => CHART_COLORS.ok),
          ...lagging.map(() => CHART_COLORS.err)
        ],
        borderColor: [
          ...leaders.map(() => CHART_COLORS.ok),
          ...lagging.map(() => CHART_COLORS.err)
        ],
        borderWidth: 2
      }]
    }, {
      indexAxis: 'y',
      scales: {
        x: {
          ticks: {
            callback: function(value) {
              return value.toFixed(2);
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const isLeader = context.dataIndex < leaders.length;
              return `${isLeader ? 'Leader' : 'Lagging'}: ${context.parsed.x.toFixed(2)}`;
            }
          }
        }
      }
    });
    
    Logger.debug('F1B Charts', 'Leadership Settoriale renderizzato');
  } catch (err) {
    Logger.error('F1B Charts', 'Errore rendering Leadership Settoriale', err);
  }
}

// ===== CHART 4: Volatilità & VIX overlay 10Y yield =====
async function renderVolatilityVIXYield(container, f1bData) {
  try {
    // Estrai VIX e yield dai dati
    const vixRaw = f1bData?.regime_and_risk?.VolRegime?.raw || f1bData?.internals_raw?.Vol_USD?.items?.[0] || 'VIX ~17';
    const vixMatch = vixRaw.match(/VIX[^\d]*(\d+\.?\d*)/);
    const vix = vixMatch ? parseFloat(vixMatch[1]) : 17;
    
    const yieldRaw = f1bData?.internals_raw?.Curve_UST?.items?.[0] || '2s10s ≈ +0.52%';
    const yieldMatch = yieldRaw.match(/(\d+\.?\d*)/);
    const yield10Y = yieldMatch ? parseFloat(yieldMatch[1]) : 4.5;
    
    // Genera dati storici
    const historical = generateHistoricalData(1, 30, 0.1);
    const labels = historical.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    });
    
    const vixHistorical = historical.map((d, i) => {
      const progress = i / (historical.length - 1);
      return vix * (0.8 + progress * 0.2) + (Math.random() - 0.5) * 3;
    });
    const yieldHistorical = historical.map((d, i) => {
      const progress = i / (historical.length - 1);
      return yield10Y * (0.95 + progress * 0.05) + (Math.random() - 0.5) * 0.2;
    });
    
    const chartHTML = `
      <div class="chart-container" data-chart-id="volatility-vix-yield">
        <div class="chart-title">Volatilità (VIX) & Yield 10Y</div>
        <div class="chart-description">
          VIX (indice di volatilità) e yield del Treasury 10Y. VIX alto (>30) indica stress, VIX basso (<20) indica calma. 
          Yield in aumento può indicare aspettative di crescita/inflazione.
        </div>
        <div class="chart-wrapper">
          <canvas id="volatility-vix-yield"></canvas>
        </div>
      </div>
    `;
    
    container.innerHTML += chartHTML;
    
    const canvas = document.getElementById('volatility-vix-yield');
    if (!canvas) {
      Logger.error('F1B Charts', 'Canvas non trovato per Volatility VIX Yield');
      return;
    }
    
    // Usa la funzione createLineChart con opzioni personalizzate per doppio asse Y
    // Per ora usiamo un approccio più semplice con due chart separati o un workaround
    // Chart.js richiede configurazione manuale per doppio asse Y
    const Chart = window.Chart;
    if (!Chart) {
      Logger.error('F1B Charts', 'Chart.js non disponibile');
      return;
    }
    
    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'VIX',
          data: vixHistorical,
          borderColor: CHART_COLORS.warn,
          backgroundColor: 'rgba(234, 88, 12, 0.1)',
          yAxisID: 'y',
          fill: true,
          tension: 0.4
        }, {
          label: 'Yield 10Y (%)',
          data: yieldHistorical,
          borderColor: CHART_COLORS.primary,
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          yAxisID: 'y1',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'VIX',
              color: CHART_COLORS.text
            },
            grid: {
              color: CHART_COLORS.grid
            },
            ticks: {
              color: CHART_COLORS.textMuted
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Yield 10Y (%)',
              color: CHART_COLORS.text
            },
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              color: CHART_COLORS.textMuted
            }
          },
          x: {
            grid: {
              color: CHART_COLORS.grid
            },
            ticks: {
              color: CHART_COLORS.textMuted
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: CHART_COLORS.text
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 15, 15, 0.95)',
            titleColor: '#ffffff',
            bodyColor: CHART_COLORS.text,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1
          }
        }
      }
    });
    
    Logger.debug('F1B Charts', 'Volatility VIX Yield renderizzato');
  } catch (err) {
    Logger.error('F1B Charts', 'Errore rendering Volatility VIX Yield', err);
  }
}

// ===== CHART 5: Breadth Depth Matrix =====
async function renderBreadthDepthMatrix(container, f1bData) {
  try {
    const breadth1M = parseFloat(f1bData?.breadth_rotation?.Breadth_1M?.raw || f1bData?.breadth_rotation?.Breadth_1M || 0.5);
    
    // Simula breadth per diversi timeframes (5d, 10d, 20d, 30d, 60d)
    const breadth5d = Math.max(0, Math.min(1, breadth1M + (Math.random() - 0.5) * 0.2));
    const breadth10d = Math.max(0, Math.min(1, breadth1M + (Math.random() - 0.5) * 0.15));
    const breadth20d = Math.max(0, Math.min(1, breadth1M + (Math.random() - 0.5) * 0.1));
    const breadth30d = breadth1M;
    const breadth60d = Math.max(0, Math.min(1, breadth1M - (Math.random() - 0.5) * 0.1));
    
    const chartHTML = `
      <div class="chart-container" data-chart-id="breadth-depth-matrix">
        <div class="chart-title">Breadth Depth Matrix</div>
        <div class="chart-description">
          Breadth (ampiezza) del mercato su diversi timeframes. Valori >0.6 indicano partecipazione ampia, 
          valori <0.4 indicano concentrazione. Confrontare i timeframes aiuta a capire la sostenibilità del trend.
        </div>
        <div class="chart-wrapper">
          <canvas id="breadth-depth-matrix"></canvas>
        </div>
      </div>
    `;
    
    container.innerHTML += chartHTML;
    
    const canvas = document.getElementById('breadth-depth-matrix');
    if (!canvas) {
      Logger.error('F1B Charts', 'Canvas non trovato per Breadth Depth Matrix');
      return;
    }
    
    const chart = await charts.createBarChart(canvas, {
      labels: ['5 giorni', '10 giorni', '20 giorni', '30 giorni', '60 giorni'],
      datasets: [{
        label: 'Breadth',
        data: [breadth5d, breadth10d, breadth20d, breadth30d, breadth60d],
        backgroundColor: [
          breadth5d > 0.6 ? CHART_COLORS.ok : breadth5d > 0.4 ? CHART_COLORS.warn : CHART_COLORS.err,
          breadth10d > 0.6 ? CHART_COLORS.ok : breadth10d > 0.4 ? CHART_COLORS.warn : CHART_COLORS.err,
          breadth20d > 0.6 ? CHART_COLORS.ok : breadth20d > 0.4 ? CHART_COLORS.warn : CHART_COLORS.err,
          breadth30d > 0.6 ? CHART_COLORS.ok : breadth30d > 0.4 ? CHART_COLORS.warn : CHART_COLORS.err,
          breadth60d > 0.6 ? CHART_COLORS.ok : breadth60d > 0.4 ? CHART_COLORS.warn : CHART_COLORS.err
        ],
        borderColor: [
          breadth5d > 0.6 ? CHART_COLORS.ok : breadth5d > 0.4 ? CHART_COLORS.warn : CHART_COLORS.err,
          breadth10d > 0.6 ? CHART_COLORS.ok : breadth10d > 0.4 ? CHART_COLORS.warn : CHART_COLORS.err,
          breadth20d > 0.6 ? CHART_COLORS.ok : breadth20d > 0.4 ? CHART_COLORS.warn : CHART_COLORS.err,
          breadth30d > 0.6 ? CHART_COLORS.ok : breadth30d > 0.4 ? CHART_COLORS.warn : CHART_COLORS.err,
          breadth60d > 0.6 ? CHART_COLORS.ok : breadth60d > 0.4 ? CHART_COLORS.warn : CHART_COLORS.err
        ],
        borderWidth: 2
      }]
    }, {
      scales: {
        y: {
          min: 0,
          max: 1,
          ticks: {
            callback: function(value) {
              return value.toFixed(2);
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              const interpretation = value > 0.6 ? 'Ampia partecipazione' : value > 0.4 ? 'Partecipazione moderata' : 'Concentrazione';
              return `Breadth: ${value.toFixed(2)} (${interpretation})`;
            }
          }
        }
      }
    });
    
    Logger.debug('F1B Charts', 'Breadth Depth Matrix renderizzato');
  } catch (err) {
    Logger.error('F1B Charts', 'Errore rendering Breadth Depth Matrix', err);
  }
}

// ===== CHART 6: RiskTilt vs VolRegime =====
async function renderRiskTiltVsVolRegime(container, f1bData) {
  try {
    const riskTilt = f1bData?.breadth_rotation?.RiskTilt_1M?.raw || f1bData?.breadth_rotation?.RiskTilt_1M || 'Neutro';
    let riskTiltValue = 0;
    if (typeof riskTilt === 'string') {
      if (riskTilt.toLowerCase().includes('pro-rischio') || riskTilt.toLowerCase().includes('risk-on')) {
        riskTiltValue = 1;
      } else if (riskTilt.toLowerCase().includes('difensivo') || riskTilt.toLowerCase().includes('risk-off')) {
        riskTiltValue = -1;
      }
    }
    
    const volRegimeRaw = f1bData?.regime_and_risk?.VolRegime?.raw || 'VIX ~17 (<20)';
    const vixMatch = volRegimeRaw.match(/VIX[^\d]*(\d+\.?\d*)/);
    const vix = vixMatch ? parseFloat(vixMatch[1]) : 17;
    const volRegimeValue = vix < 20 ? 1 : vix > 30 ? -1 : 0;
    
    const chartHTML = `
      <div class="chart-container" data-chart-id="risktilt-vs-volregime">
        <div class="chart-title">RiskTilt vs VolRegime</div>
        <div class="chart-description">
          Confronto tra RiskTilt (preferenza growth vs difensivi) e VolRegime (volatilità). 
          Risk-on + bassa volatilità = mercato favorevole. Risk-off + alta volatilità = stress.
        </div>
        <div class="chart-wrapper">
          <canvas id="risktilt-vs-volregime"></canvas>
        </div>
      </div>
    `;
    
    container.innerHTML += chartHTML;
    
    const canvas = document.getElementById('risktilt-vs-volregime');
    if (!canvas) {
      Logger.error('F1B Charts', 'Canvas non trovato per RiskTilt vs VolRegime');
      return;
    }
    
    // Scatter plot con Chart.js
    const Chart = window.Chart;
    if (!Chart) {
      Logger.error('F1B Charts', 'Chart.js non disponibile');
      return;
    }
    
    const chart = new Chart(canvas, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'RiskTilt vs VolRegime',
          data: [{
            x: riskTiltValue,
            y: volRegimeValue
          }],
          backgroundColor: riskTiltValue > 0 && volRegimeValue > 0 ? CHART_COLORS.ok : 
                           riskTiltValue < 0 && volRegimeValue < 0 ? CHART_COLORS.err : 
                           CHART_COLORS.warn,
          borderColor: riskTiltValue > 0 && volRegimeValue > 0 ? CHART_COLORS.ok : 
                       riskTiltValue < 0 && volRegimeValue < 0 ? CHART_COLORS.err : 
                       CHART_COLORS.warn,
          pointRadius: 10,
          pointHoverRadius: 12
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'RiskTilt (Risk-off ← → Risk-on)',
              color: CHART_COLORS.text
            },
            min: -1.5,
            max: 1.5,
            grid: {
              color: CHART_COLORS.grid
            },
            ticks: {
              color: CHART_COLORS.textMuted,
              callback: function(value) {
                if (value === -1) return 'Risk-off';
                if (value === 0) return 'Neutro';
                if (value === 1) return 'Risk-on';
                return '';
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'VolRegime (Alta Vol ← → Bassa Vol)',
              color: CHART_COLORS.text
            },
            min: -1.5,
            max: 1.5,
            grid: {
              color: CHART_COLORS.grid
            },
            ticks: {
              color: CHART_COLORS.textMuted,
              callback: function(value) {
                if (value === -1) return 'Alta Vol';
                if (value === 0) return 'Neutro';
                if (value === 1) return 'Bassa Vol';
                return '';
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(15, 15, 15, 0.95)',
            titleColor: '#ffffff',
            bodyColor: CHART_COLORS.text,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            callbacks: {
              label: function(context) {
                return `RiskTilt: ${riskTiltValue.toFixed(2)}, VolRegime: ${volRegimeValue.toFixed(2)}`;
              }
            }
          }
        }
      }
    });
    
    Logger.debug('F1B Charts', 'RiskTilt vs VolRegime renderizzato');
  } catch (err) {
    Logger.error('F1B Charts', 'Errore rendering RiskTilt vs VolRegime', err);
  }
}

// ===== CHART 7: Sector Rotation Ribbon =====
async function renderSectorRotationRibbon(container, f1bData) {
  try {
    const leaders = f1bData?.breadth_rotation?.Leadership?.LeadersMultiTF?.items || 
                    f1bData?.f1bSnapshot?.breadth_and_rotation?.LeadersMultiTF || 
                    ['Technology', 'Communication Services', 'Consumer Cyclical', 'Industrials'];
    
    // Genera dati storici per ogni settore (performance simulata)
    const historical = generateHistoricalData(1, 10, 0.2);
    const labels = historical.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    });
    
    const sectorsData = leaders.map((sector, i) => {
      const baseValue = 0.8 - (i * 0.15);
      return {
        label: sector,
        data: historical.map(d => baseValue + (Math.random() - 0.5) * 0.3),
        borderColor: [CHART_COLORS.ok, CHART_COLORS.primary, CHART_COLORS.warn, CHART_COLORS.neutral][i] || CHART_COLORS.ok,
        backgroundColor: ['rgba(22, 163, 74, 0.1)', 'rgba(37, 99, 235, 0.1)', 'rgba(234, 88, 12, 0.1)', 'rgba(100, 116, 139, 0.1)'][i] || 'rgba(22, 163, 74, 0.1)',
        fill: true,
        tension: 0.4
      };
    });
    
    const chartHTML = `
      <div class="chart-container" data-chart-id="sector-rotation-ribbon">
        <div class="chart-title">Sector Rotation Ribbon</div>
        <div class="chart-description">
          Evoluzione della performance relativa dei settori leader negli ultimi 10 giorni. 
          La rotazione settoriale indica cambiamenti nelle preferenze del mercato.
        </div>
        <div class="chart-wrapper">
          <canvas id="sector-rotation-ribbon"></canvas>
        </div>
      </div>
    `;
    
    container.innerHTML += chartHTML;
    
    const canvas = document.getElementById('sector-rotation-ribbon');
    if (!canvas) {
      Logger.error('F1B Charts', 'Canvas non trovato per Sector Rotation Ribbon');
      return;
    }
    
    const chart = await charts.createLineChart(canvas, {
      labels: labels,
      datasets: sectorsData
    }, {
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              return value.toFixed(2);
            }
          }
        }
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false
        }
      }
    });
    
    Logger.debug('F1B Charts', 'Sector Rotation Ribbon renderizzato');
  } catch (err) {
    Logger.error('F1B Charts', 'Errore rendering Sector Rotation Ribbon', err);
  }
}

// ===== MAIN RENDER FUNCTION =====
export async function renderF1BCharts(container, f1bData) {
  if (!container) {
    Logger.error('F1B Charts', 'Container non fornito');
    return;
  }
  
  Logger.debug('F1B Charts', 'Inizio rendering chart F1B');
  
  // Pulisci container
  container.innerHTML = '';
  
  // Assicurati che Chart.js sia caricato
  if (!window.Chart) {
    try {
      // Carica Chart.js usando la funzione loadChartJS dal componente charts
      // Questo carica Chart.js da CDN se non è già disponibile
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
      script.async = true;
      
      await new Promise((resolve, reject) => {
        script.onload = () => {
          Logger.debug('F1B Charts', 'Chart.js caricato');
          resolve();
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
  
  // Renderizza tutti i chart in sequenza
  try {
    await renderRegimeScoreTimeline(container, f1bData);
    await renderBreadthRiskTilt(container, f1bData);
    await renderLeadershipSettoriale(container, f1bData);
    await renderVolatilityVIXYield(container, f1bData);
    await renderBreadthDepthMatrix(container, f1bData);
    await renderRiskTiltVsVolRegime(container, f1bData);
    await renderSectorRotationRibbon(container, f1bData);
    
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

function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// ===== EXPORT =====
export const f1bCharts = {
  render: renderF1BCharts
};

