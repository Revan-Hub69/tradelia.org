/* eslint-env browser */
/**
 * Education Toolbar - Strumenti Sempre Visibili
 * Floating toolbar con accesso rapido a strumenti
 * Best Practice 2025: Quick Access Pattern
 */

import { safeLog } from "./security-utils.js";

let toolbarInstance = null;

/**
 * Inizializza toolbar
 */
export function initToolbar() {
  if (toolbarInstance) {
    return toolbarInstance;
  }

  toolbarInstance = new EducationToolbar();
  return toolbarInstance;
}

/**
 * Education Toolbar Class
 */
class EducationToolbar {
  constructor() {
    this.isExpanded = false;
    this.tools = [
      {
        id: "calculator",
        icon: "🧮",
        label: "Calcolatore",
        action: () => this.openCalculator(),
      },
      {
        id: "simulator",
        icon: "📊",
        label: "Simulatore",
        action: () => this.openSimulator(),
      },
      {
        id: "glossary",
        icon: "📖",
        label: "Glossario",
        action: () => this.openGlossary(),
      },
      {
        id: "notes",
        icon: "📝",
        label: "Note",
        action: () => this.openNotes(),
      },
      {
        id: "bookmark",
        icon: "🔖",
        label: "Segnalibri",
        action: () => this.openBookmarks(),
      },
    ];
    this.render();
  }

  render() {
    // Rimuovi toolbar esistente se presente
    const existing = document.getElementById("education-toolbar");
    if (existing) {
      existing.remove();
    }

    // Crea toolbar
    const toolbar = document.createElement("div");
    toolbar.id = "education-toolbar";
    toolbar.className = "education-toolbar";
    toolbar.innerHTML = `
      <button class="toolbar-toggle" aria-label="Espandi strumenti">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
          <line x1="12" y1="2" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
        </svg>
      </button>
      <div class="toolbar-tools">
        ${this.tools
          .map(
            (tool) => `
          <button 
            class="toolbar-tool" 
            data-tool="${tool.id}"
            aria-label="${tool.label}"
            title="${tool.label}"
          >
            <span class="tool-icon">${tool.icon}</span>
            <span class="tool-label">${tool.label}</span>
          </button>
        `
          )
          .join("")}
      </div>
    `;

    document.body.appendChild(toolbar);

    // Bind events
    this.bindEvents(toolbar);
  }

  bindEvents(toolbar) {
    const toggle = toolbar.querySelector(".toolbar-toggle");
    toggle.addEventListener("click", () => {
      this.toggle();
    });

    const toolButtons = toolbar.querySelectorAll(".toolbar-tool");
    toolButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const toolId = btn.dataset.tool;
        const tool = this.tools.find((t) => t.id === toolId);
        if (tool) {
          tool.action();
        }
      });
    });

    // Drag & drop per riposizionare
    this.enableDrag(toolbar);
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
    const toolbar = document.getElementById("education-toolbar");
    if (toolbar) {
      toolbar.classList.toggle("expanded", this.isExpanded);
    }
  }

  enableDrag(element) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    element.addEventListener("mousedown", (e) => {
      if (e.target.closest(".toolbar-toggle") || e.target.closest(".toolbar-tool")) {
        return;
      }

      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === element || e.target.closest(".toolbar-toggle")) {
        isDragging = true;
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        element.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        // Salva posizione
        localStorage.setItem(
          "education-toolbar-position",
          JSON.stringify({ x: xOffset, y: yOffset })
        );
      }
      isDragging = false;
    });

    // Carica posizione salvata
    const saved = localStorage.getItem("education-toolbar-position");
    if (saved) {
      const { x, y } = JSON.parse(saved);
      element.style.transform = `translate(${x}px, ${y}px)`;
      xOffset = x;
      yOffset = y;
    }
  }

  openCalculator() {
    this.openToolModal(
      "Calcolatore",
      `
      <div class="tool-calculator">
        <div class="calculator-display">
          <input type="text" id="calc-display" readonly value="0">
        </div>
        <div class="calculator-buttons">
          <button class="calc-btn" data-action="clear">C</button>
          <button class="calc-btn" data-action="backspace">⌫</button>
          <button class="calc-btn" data-action="operator" data-value="/">/</button>
          <button class="calc-btn" data-action="operator" data-value="*">×</button>
          <button class="calc-btn" data-action="number" data-value="7">7</button>
          <button class="calc-btn" data-action="number" data-value="8">8</button>
          <button class="calc-btn" data-action="number" data-value="9">9</button>
          <button class="calc-btn" data-action="operator" data-value="-">-</button>
          <button class="calc-btn" data-action="number" data-value="4">4</button>
          <button class="calc-btn" data-action="number" data-value="5">5</button>
          <button class="calc-btn" data-action="number" data-value="6">6</button>
          <button class="calc-btn" data-action="operator" data-value="+">+</button>
          <button class="calc-btn" data-action="number" data-value="1">1</button>
          <button class="calc-btn" data-action="number" data-value="2">2</button>
          <button class="calc-btn" data-action="number" data-value="3">3</button>
          <button class="calc-btn calc-btn-equals" data-action="equals" rowspan="2">=</button>
          <button class="calc-btn calc-btn-zero" data-action="number" data-value="0">0</button>
          <button class="calc-btn" data-action="decimal">.</button>
        </div>
      </div>
    `
    );

    // Calculator logic
    this.initCalculator();
  }

  initCalculator() {
    let display = "0";
    let operator = null;
    let previousValue = null;

    const displayEl = document.getElementById("calc-display");
    const buttons = document.querySelectorAll(".calc-btn");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        const value = btn.dataset.value;

        if (action === "number") {
          if (display === "0") {
            display = value;
          } else {
            display += value;
          }
        } else if (action === "operator") {
          if (previousValue === null) {
            previousValue = parseFloat(display);
          } else if (operator) {
            previousValue = this.calculate(previousValue, parseFloat(display), operator);
            display = previousValue.toString();
          }
          operator = value;
          display = "0";
        } else if (action === "equals") {
          if (previousValue !== null && operator) {
            display = this.calculate(previousValue, parseFloat(display), operator).toString();
            previousValue = null;
            operator = null;
          }
        } else if (action === "clear") {
          display = "0";
          previousValue = null;
          operator = null;
        } else if (action === "backspace") {
          display = display.slice(0, -1) || "0";
        } else if (action === "decimal") {
          if (!display.includes(".")) {
            display += ".";
          }
        }

        displayEl.value = display;
      });
    });
  }

  calculate(a, b, op) {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  }

  openSimulator() {
    this.openToolModal(
      "Simulatore Portfolio",
      `
      <div class="tool-simulator">
        <div class="simulator-inputs">
          <div class="input-group">
            <label>Capitale Iniziale (€)</label>
            <input type="number" id="sim-capital" value="10000" min="0" step="100">
          </div>
          <div class="input-group">
            <label>Rendimento Annuo (%)</label>
            <input type="number" id="sim-return" value="7" min="0" max="50" step="0.1">
          </div>
          <div class="input-group">
            <label>Orizzonte (anni)</label>
            <input type="number" id="sim-years" value="10" min="1" max="50" step="1">
          </div>
          <button class="sim-btn" id="sim-calculate">Calcola</button>
        </div>
        <div class="simulator-results" id="sim-results"></div>
      </div>
    `
    );

    // Simulator logic
    const calcBtn = document.getElementById("sim-calculate");
    calcBtn.addEventListener("click", () => {
      const capital = parseFloat(document.getElementById("sim-capital").value);
      const returnPct = parseFloat(document.getElementById("sim-return").value) / 100;
      const years = parseInt(document.getElementById("sim-years").value);

      const finalValue = capital * Math.pow(1 + returnPct, years);
      const gain = finalValue - capital;

      document.getElementById("sim-results").innerHTML = `
        <div class="result-item">
          <span>Valore Finale:</span>
          <strong>€${finalValue.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</strong>
        </div>
        <div class="result-item">
          <span>Guadagno:</span>
          <strong>€${gain.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</strong>
        </div>
        <div class="result-item">
          <span>Rendimento:</span>
          <strong>${((finalValue / capital - 1) * 100).toFixed(2)}%</strong>
        </div>
      `;
    });
  }

  openGlossary() {
    this.openToolModal(
      "Glossario",
      `
      <div class="tool-glossary">
        <input type="search" id="glossary-search" placeholder="Cerca termine...">
        <div class="glossary-list" id="glossary-list">
          <div class="glossary-item">
            <strong>ETF</strong>
            <p>Exchange Traded Fund - Fondo negoziato in borsa</p>
          </div>
          <div class="glossary-item">
            <strong>PAC</strong>
            <p>Piano di Accumulo Capitale - Investimento periodico</p>
          </div>
          <div class="glossary-item">
            <strong>TER</strong>
            <p>Total Expense Ratio - Costo totale del fondo</p>
          </div>
        </div>
      </div>
    `
    );

    // Glossary search
    const search = document.getElementById("glossary-search");
    const list = document.getElementById("glossary-list");
    search.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      const items = list.querySelectorAll(".glossary-item");
      items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? "block" : "none";
      });
    });
  }

  openNotes() {
    this.openToolModal(
      "Note Personali",
      `
      <div class="tool-notes">
        <textarea id="notes-textarea" placeholder="Scrivi le tue note qui..."></textarea>
        <div class="notes-actions">
          <button class="notes-save">Salva</button>
        </div>
      </div>
    `
    );

    // Load saved notes
    const saved = localStorage.getItem("education-notes");
    if (saved) {
      document.getElementById("notes-textarea").value = saved;
    }

    // Save notes
    const saveBtn = document.querySelector(".notes-save");
    saveBtn.addEventListener("click", () => {
      const notes = document.getElementById("notes-textarea").value;
      localStorage.setItem("education-notes", notes);
      safeLog("log", "[Toolbar] Note salvate");
    });
  }

  openBookmarks() {
    this.openToolModal(
      "Segnalibri",
      `
      <div class="tool-bookmarks">
        <div class="bookmarks-list" id="bookmarks-list">
          <p class="empty-state">Nessun segnalibro salvato</p>
        </div>
      </div>
    `
    );

    // Load bookmarks
    const saved = JSON.parse(localStorage.getItem("education-bookmarks") || "[]");
    const list = document.getElementById("bookmarks-list");
    if (saved.length === 0) {
      list.innerHTML = '<p class="empty-state">Nessun segnalibro salvato</p>';
    } else {
      list.innerHTML = saved
        .map(
          (bm) => `
        <div class="bookmark-item">
          <strong>${bm.title}</strong>
          <span>${bm.url}</span>
          <button class="bookmark-remove" data-id="${bm.id}">Rimuovi</button>
        </div>
      `
        )
        .join("");
    }
  }

  openToolModal(title, content) {
    // Rimuovi modal esistente
    const existing = document.getElementById("tool-modal");
    if (existing) {
      existing.remove();
    }

    // Crea modal
    const modal = document.createElement("div");
    modal.id = "tool-modal";
    modal.className = "tool-modal";
    modal.innerHTML = `
      <div class="tool-modal-overlay"></div>
      <div class="tool-modal-content">
        <div class="tool-modal-header">
          <h3>${title}</h3>
          <button class="tool-modal-close" aria-label="Chiudi">×</button>
        </div>
        <div class="tool-modal-body">
          ${content}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close button
    const closeBtn = modal.querySelector(".tool-modal-close");
    const overlay = modal.querySelector(".tool-modal-overlay");
    const close = () => {
      modal.style.opacity = "0";
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", close);

    // Animate in
    setTimeout(() => {
      modal.style.opacity = "1";
    }, 10);
  }
}
