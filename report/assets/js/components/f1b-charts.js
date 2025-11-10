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

// Funzione generateHistoricalData rimossa - non più necessaria (chart usano solo dati correnti)

// ===== CHART 1: RegimeScore Gauge =====
async function renderRegimeScoreGauge(container, f1bData) {
  try {
    const regimeScore = parseRegimeScore(f1bData?.regime_and_risk?.RegimeScore || f1bData?.f1bSnapshot?.regime_state?.RegimeScore || 0);
    const strategyMode = f1bData?.regime_and_risk?.StrategyMode_macro?.raw || f1bData?.regime_and_risk?.StrategyMode_macro || '—';
    
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
          RegimeScore corrente: ${regimeScore.toFixed(2)} (${interpretation}). 
          Valori positivi (>0) indicano risk-on (appetito al rischio), 
          valori negativi (<0) indicano risk-off (avversione al rischio). 
          StrategyMode: ${strategyMode}
        </div>
        <div class="chart-wrapper">
          <canvas id="regime-score-gauge"></canvas>
        </div>
      </div>
    `;
    
    container.innerHTML += chartHTML;
    
    const canvas = document.getElementById('regime-score-gauge');
    if (!canvas) {
      Logger.error('F1B Charts', 'Canvas non trovato per RegimeScore Gauge');
      return;
    }
    
    // Gauge chart: barra orizzontale che mostra il RegimeScore
    const chart = await charts.createBarChart(canvas, {
      labels: ['RegimeScore'],
      datasets: [{
        label: 'RegimeScore',
        data: [regimeScore],
        backgroundColor: color,
        borderColor: color,
        borderWidth: 2
      }]
    }, {
      indexAxis: 'y',
      scales: {
        x: {
          min: -1,
          max: 1,
          ticks: {
            callback: function(value) {
              if (value === -1) return 'Risk-off (-1)';
              if (value === 0) return 'Neutro (0)';
              if (value === 1) return 'Risk-on (+1)';
              return value.toFixed(2);
            }
          },
          grid: {
            color: function(context) {
              // Linea centrale a 0
              if (context.tick.value === 0) return CHART_COLORS.neutral;
              return CHART_COLORS.grid;
            }
          }
        },
        y: {
          ticks: {
            display: false
          },
          grid: {
            display: false
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
              return `RegimeScore: ${regimeScore.toFixed(2)} (${interpretation})`;
            }
          }
        }
      }
    });
    
    Logger.debug('F1B Charts', 'RegimeScore Gauge renderizzato');
  } catch (err) {
    Logger.error('F1B Charts', 'Errore rendering RegimeScore Gauge', err);
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
    
    // Se non ci sono dati, mostra messaggio informativo
    if (leaders.length === 0 && lagging.length === 0) {
      const chartHTML = `
        <div class="chart-container" data-chart-id="leadership-settoriale">
          <div class="chart-title">Leadership Settoriale</div>
          <div class="chart-description">
            Dati settoriali non disponibili in questo report. I dati di leadership settoriale mostrano 
            quali settori guidano il mercato (leaders) e quali sono in ritardo (lagging).
          </div>
          <div style="padding: 2rem; text-align: center; color: var(--muted);">
            Dati non disponibili per questo report
          </div>
        </div>
      `;
      container.innerHTML += chartHTML;
      return;
    }
    
    // Crea dati per il chart (performance relativa basata su posizione)
    // Usa valori semplici per indicare leadership vs lagging
    const leaderData = leaders.map((_, i) => 1.0 - (i * 0.15));
    const laggingData = lagging.map((_, i) => -0.5 - (i * 0.1));
    
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
              if (value > 0) return 'Leader';
              if (value < 0) return 'Lagging';
              return 'Neutro';
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
              const sector = context.label;
              return `${isLeader ? 'Leader' : 'Lagging'}: ${sector}`;
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

// ===== CHART 4: Volatilità (VIX) & Yield 10Y =====
async function renderVolatilityVIXYield(container, f1bData) {
  try {
    // Estrai VIX e yield dai dati
    const vixRaw = f1bData?.regime_and_risk?.VolRegime?.raw || f1bData?.internals_raw?.Vol_USD?.items?.[0] || 'VIX ~17';
    const vixMatch = vixRaw.match(/VIX[^\d]*(\d+\.?\d*)/);
    const vix = vixMatch ? parseFloat(vixMatch[1]) : 17;
    
    // Estrai yield 10Y (se disponibile)
    const yieldRaw = f1bData?.internals_raw?.Curve_UST?.items?.[0] || null;
    let yield10Y = null;
    if (yieldRaw) {
      // Prova a estrarre yield da "2s10s ≈ +0.48%" o simile
      const yieldMatch = yieldRaw.match(/(\d+\.?\d*)/);
      if (yieldMatch) {
        // Il valore estratto potrebbe essere lo spread 2s10s, non il yield 10Y
        // Per ora usiamo un valore di default o lo spread come proxy
        yield10Y = parseFloat(yieldMatch[1]);
      }
    }
    
    // Se non abbiamo yield, usa valore di default o mostra solo VIX
    const hasYield = yield10Y !== null;
    
    const chartHTML = `
      <div class="chart-container" data-chart-id="volatility-vix-yield">
        <div class="chart-title">Volatilità (VIX)${hasYield ? ' & Yield 10Y' : ''}</div>
        <div class="chart-description">
          VIX (indice di volatilità): ${vix.toFixed(1)}. VIX alto (>30) indica stress, VIX basso (<20) indica calma. 
          ${hasYield ? `Spread 2s10s: ${yield10Y.toFixed(2)}%. ` : 'Dati yield non disponibili in questo report. '}
          Valori correnti (snapshot).
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
    
    // Bar chart con valori correnti
    const labels = ['VIX'];
    const data = [vix];
    const colors = [vix < 20 ? CHART_COLORS.ok : vix > 30 ? CHART_COLORS.err : CHART_COLORS.warn];
    
    if (hasYield) {
      labels.push('Spread 2s10s (%)');
      data.push(yield10Y);
      colors.push(CHART_COLORS.primary);
    }
    
    const chart = await charts.createBarChart(canvas, {
      labels: labels,
      datasets: [{
        label: 'Valore',
        data: data,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 2
      }]
    }, {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toFixed(1);
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
              const label = context.label;
              const value = context.parsed.y;
              if (label === 'VIX') {
                const interpretation = value < 20 ? 'Calma' : value > 30 ? 'Stress' : 'Moderato';
                return `VIX: ${value.toFixed(1)} (${interpretation})`;
              } else {
                return `Spread 2s10s: ${value.toFixed(2)}%`;
              }
            }
          }
        }
      }
    });
    
    Logger.debug('F1B Charts', 'Volatility VIX Yield renderizzato');
  } catch (err) {
    Logger.error('F1B Charts', 'Errore rendering Volatility VIX Yield', err);
  }
}

// ===== CHART 5: RiskTilt vs VolRegime =====
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

// Chart Settori Leader rimosso - già incluso in renderLeadershipSettoriale

// ===== MAIN RENDER FUNCTION =====
export async function renderF1BCharts(container, f1bData) {
  if (!container) {
    Logger.error('F1B Charts', 'Container non fornito');
    return;
  }
  
  Logger.debug('F1B Charts', 'Inizio rendering chart F1B');
  
  // Pulisci container
  container.innerHTML = '';
  
  // Carica Chart.js se non è già disponibile
  if (!window.Chart) {
    try {
      // Usa il metodo interno loadChartJS da charts.js
      // Creiamo uno script per caricare Chart.js da CDN
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
  
  // Renderizza tutti i chart in sequenza (solo dati correnti, no timeline storiche)
  try {
    // Chart 1: RegimeScore Gauge (dati correnti)
    await renderRegimeScoreGauge(container, f1bData);
    
    // Chart 2: Breadth 1M & RiskTilt (dati correnti)
    await renderBreadthRiskTilt(container, f1bData);
    
    // Chart 3: Leadership Settoriale (dati correnti, se disponibili)
    await renderLeadershipSettoriale(container, f1bData);
    
    // Chart 4: Volatilità VIX & Yield (dati correnti)
    await renderVolatilityVIXYield(container, f1bData);
    
    // Chart 5: RiskTilt vs VolRegime (dati correnti)
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

