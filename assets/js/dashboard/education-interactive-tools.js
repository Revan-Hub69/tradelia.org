/* eslint-env browser */
/**
 * Interactive Tools - Simulator, Calculators, Case Studies
 * Best Practice 2025
 */

import { safeLog } from "./security-utils.js";

/**
 * Interactive Tools System
 */
export class InteractiveTools {
  constructor() {
    this.calculators = new Map();
  }

  /**
   * Portfolio Simulator
   */
  createPortfolioSimulator(container, initialPortfolio = {}) {
    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="interactive-portfolio-simulator">
        <h3>Portfolio Simulator</h3>
        <div class="simulator-controls">
          <div class="control-group">
            <label>Capitale Iniziale (€)</label>
            <input type="number" id="initial-capital" value="${initialPortfolio.capital || 10000}" min="0" step="100">
          </div>
          <div class="control-group">
            <label>Allocazione Azioni (%)</label>
            <input type="number" id="allocation-stocks" value="${initialPortfolio.stocks || 70}" min="0" max="100" step="1">
          </div>
          <div class="control-group">
            <label>Allocazione Obbligazioni (%)</label>
            <input type="number" id="allocation-bonds" value="${initialPortfolio.bonds || 30}" min="0" max="100" step="1">
          </div>
          <div class="control-group">
            <label>Rendimento Atteso Azioni (%)</label>
            <input type="number" id="return-stocks" value="7" min="0" max="50" step="0.1">
          </div>
          <div class="control-group">
            <label>Rendimento Atteso Obbligazioni (%)</label>
            <input type="number" id="return-bonds" value="3" min="0" max="20" step="0.1">
          </div>
          <div class="control-group">
            <label>Orizzonte Temporale (anni)</label>
            <input type="number" id="time-horizon" value="10" min="1" max="50" step="1">
          </div>
          <button class="simulate-btn" onclick="window.InteractiveTools.runSimulation()">Simula</button>
        </div>
        <div class="simulator-results" id="simulator-results"></div>
      </div>
    `;

    this.addSimulatorStyles();
  }

  /**
   * Run portfolio simulation
   */
  runSimulation() {
    const capital = parseFloat(document.getElementById("initial-capital")?.value || 10000);
    const stocksPct = parseFloat(document.getElementById("allocation-stocks")?.value || 70) / 100;
    const bondsPct = parseFloat(document.getElementById("allocation-bonds")?.value || 30) / 100;
    const stocksReturn = parseFloat(document.getElementById("return-stocks")?.value || 7) / 100;
    const bondsReturn = parseFloat(document.getElementById("return-bonds")?.value || 3) / 100;
    const years = parseInt(document.getElementById("time-horizon")?.value || 10);

    // Calculate expected return
    const expectedReturn = stocksPct * stocksReturn + bondsPct * bondsReturn;
    const finalValue = capital * Math.pow(1 + expectedReturn, years);
    const totalReturn = finalValue - capital;
    const totalReturnPct = ((finalValue / capital - 1) * 100).toFixed(2);

    const resultsContainer = document.getElementById("simulator-results");
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="simulation-results">
          <h4>Risultati Simulazione</h4>
          <div class="result-item">
            <span>Valore Finale:</span>
            <strong>€${finalValue.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
          <div class="result-item">
            <span>Guadagno Totale:</span>
            <strong>€${totalReturn.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
          <div class="result-item">
            <span>Rendimento Totale:</span>
            <strong>${totalReturnPct}%</strong>
          </div>
          <div class="result-item">
            <span>Rendimento Annuo Medio:</span>
            <strong>${(expectedReturn * 100).toFixed(2)}%</strong>
          </div>
        </div>
      `;
    }
  }

  /**
   * Cost Calculator
   */
  createCostCalculator(container) {
    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="interactive-cost-calculator">
        <h3>Calcolatore Costi Totali</h3>
        <div class="calculator-inputs">
          <div class="input-group">
            <label>TER (%)</label>
            <input type="number" id="ter-input" value="0.2" min="0" max="5" step="0.01">
          </div>
          <div class="input-group">
            <label>Tracking Error (%)</label>
            <input type="number" id="tracking-error-input" value="0.15" min="0" max="2" step="0.01">
          </div>
          <div class="input-group">
            <label>Spread (%)</label>
            <input type="number" id="spread-input" value="0.05" min="0" max="1" step="0.01">
          </div>
          <div class="input-group">
            <label>Capitale Investito (€)</label>
            <input type="number" id="capital-input" value="10000" min="0" step="100">
          </div>
          <button class="calculate-btn" onclick="window.InteractiveTools.calculateCosts()">Calcola</button>
        </div>
        <div class="calculator-results" id="cost-results"></div>
      </div>
    `;

    this.addCalculatorStyles();
  }

  /**
   * Calculate total costs
   */
  calculateCosts() {
    const ter = parseFloat(document.getElementById("ter-input")?.value || 0.2) / 100;
    const trackingError =
      parseFloat(document.getElementById("tracking-error-input")?.value || 0.15) / 100;
    const spread = parseFloat(document.getElementById("spread-input")?.value || 0.05) / 100;
    const capital = parseFloat(document.getElementById("capital-input")?.value || 10000);

    const totalCosts = ter + trackingError + spread;
    const annualCost = capital * totalCosts;
    const annualCostPct = (totalCosts * 100).toFixed(2);

    const resultsContainer = document.getElementById("cost-results");
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="cost-results">
          <h4>Risultati</h4>
          <div class="result-item">
            <span>Costi Totali Annui:</span>
            <strong>${annualCostPct}%</strong>
          </div>
          <div class="result-item">
            <span>Costo Annuo in Euro:</span>
            <strong>€${annualCost.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
          <div class="result-item ${totalCosts > 0.005 ? "warning" : "success"}">
            <span>Valutazione:</span>
            <strong>
              ${
                totalCosts > 0.005
                  ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Costi elevati (>0.5%)`
                  : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Costi ottimali (<0.5%)`
              }
            </strong>
          </div>
        </div>
      `;
    }
  }

  /**
   * Position Sizing Calculator
   */
  createPositionSizingCalculator(container) {
    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="interactive-position-calculator">
        <h3>Position Sizing Calculator</h3>
        <div class="calculator-inputs">
          <div class="input-group">
            <label>Capitale Totale (€)</label>
            <input type="number" id="total-capital" value="10000" min="0" step="100">
          </div>
          <div class="input-group">
            <label>Rischio per Trade (%)</label>
            <input type="number" id="risk-per-trade" value="2" min="0" max="10" step="0.1">
          </div>
          <div class="input-group">
            <label>Stop Loss (%)</label>
            <input type="number" id="stop-loss" value="5" min="0" max="50" step="0.1">
          </div>
          <button class="calculate-btn" onclick="window.InteractiveTools.calculatePositionSize()">Calcola</button>
        </div>
        <div class="calculator-results" id="position-results"></div>
      </div>
    `;
  }

  /**
   * Calculate position size
   */
  calculatePositionSize() {
    const totalCapital = parseFloat(document.getElementById("total-capital")?.value || 10000);
    const riskPct = parseFloat(document.getElementById("risk-per-trade")?.value || 2) / 100;
    const stopLossPct = parseFloat(document.getElementById("stop-loss")?.value || 5) / 100;

    const riskAmount = totalCapital * riskPct;
    const positionSize = riskAmount / stopLossPct;
    const positionSizePct = ((positionSize / totalCapital) * 100).toFixed(2);

    const resultsContainer = document.getElementById("position-results");
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="position-results">
          <h4>Risultati</h4>
          <div class="result-item">
            <span>Dimensione Posizione:</span>
            <strong>€${positionSize.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
          <div class="result-item">
            <span>% del Capitale:</span>
            <strong>${positionSizePct}%</strong>
          </div>
          <div class="result-item">
            <span>Rischio Massimo:</span>
            <strong>€${riskAmount.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
        </div>
      `;
    }
  }

  /**
   * Add simulator styles
   */
  addSimulatorStyles() {
    if (document.getElementById("interactive-tools-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "interactive-tools-styles";
    style.textContent = `
      .interactive-portfolio-simulator,
      .interactive-cost-calculator,
      .interactive-position-calculator {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        margin: 2rem 0;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .simulator-controls,
      .calculator-inputs {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin: 1.5rem 0;
      }
      .control-group,
      .input-group {
        display: flex;
        flex-direction: column;
      }
      .control-group label,
      .input-group label {
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #1f2937;
      }
      .control-group input,
      .input-group input {
        padding: 0.75rem;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
      }
      .simulate-btn,
      .calculate-btn {
        grid-column: 1 / -1;
        background: #00C76A;
        color: white;
        border: none;
        padding: 1rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        transition: background 0.2s;
      }
      .simulate-btn:hover,
      .calculate-btn:hover {
        background: #00A855;
      }
      .simulation-results,
      .cost-results,
      .position-results {
        margin-top: 2rem;
        padding: 1.5rem;
        background: #f5f5f5;
        border-radius: 8px;
      }
      .simulation-results h4,
      .cost-results h4,
      .position-results h4 {
        margin-top: 0;
        margin-bottom: 1rem;
      }
      .result-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid #e5e7eb;
      }
      .result-item:last-child {
        border-bottom: none;
      }
      .result-item.warning {
        color: #ef4444;
      }
      .result-item.success {
        color: #00C76A;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Add calculator styles (shared with simulator)
   */
  addCalculatorStyles() {
    this.addSimulatorStyles();
  }
}

/**
 * Initialize interactive tools
 */
export function initInteractiveTools() {
  const tools = new InteractiveTools();
  window.InteractiveTools = tools;
  safeLog("info", "[InteractiveTools] System initialized");
  return tools;
}
