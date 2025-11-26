/* eslint-env browser */
/**
 * Education Glossary System
 * Glossario completo da glossario.json
 * Best Practice 2025: Structured Data
 */

import { safeLog } from "./security-utils.js";

let glossaryData = null;
let glossaryInstance = null;

/**
 * Inizializza glossario
 */
export async function initGlossary() {
  if (glossaryInstance) {
    return glossaryInstance;
  }

  // Carica dati da glossario.json
  await loadGlossaryData();

  glossaryInstance = new GlossarySystem();
  return glossaryInstance;
}

/**
 * Carica dati glossario da JSON
 */
async function loadGlossaryData() {
  try {
    const response = await fetch("/glossario.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    glossaryData = data;
    safeLog("log", "[Glossary] Dati caricati:", Object.keys(data).length, "termini");
  } catch (error) {
    safeLog("error", "[Glossary] Errore caricamento glossario.json:", error);
    glossaryData = {};
  }
}

/**
 * Glossary System Class
 */
class GlossarySystem {
  constructor() {
    this.searchTerm = "";
    this.filteredTerms = [];
    this.selectedCategory = null;
  }

  /**
   * Apri modal glossario
   */
  open() {
    this.renderModal();
  }

  /**
   * Render modal glossario
   */
  renderModal() {
    // Rimuovi modal esistente
    const existing = document.getElementById("glossary-modal");
    if (existing) {
      existing.remove();
    }

    // Crea modal
    const modal = document.createElement("div");
    modal.id = "glossary-modal";
    modal.className = "glossary-modal";
    modal.innerHTML = `
      <div class="glossary-modal-overlay"></div>
      <div class="glossary-modal-content">
        <div class="glossary-modal-header">
          <h2>Glossario Finanziario</h2>
          <button class="glossary-modal-close" aria-label="Chiudi">×</button>
        </div>
        <div class="glossary-search-container">
          <input 
            type="search" 
            id="glossary-search" 
            placeholder="Cerca termine..." 
            autocomplete="off"
          />
          <div class="glossary-categories" id="glossary-categories"></div>
        </div>
        <div class="glossary-content">
          <div class="glossary-list" id="glossary-list"></div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Render contenuto
    this.renderCategories();
    this.renderTerms();

    // Bind events
    this.bindEvents(modal);

    // Focus su search
    const searchInput = document.getElementById("glossary-search");
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
  }

  /**
   * Render categorie
   */
  renderCategories() {
    if (!glossaryData) {
      return;
    }

    const categories = this.getCategories();
    const container = document.getElementById("glossary-categories");
    if (!container) {
      return;
    }

    container.innerHTML = `
      <button class="glossary-category ${!this.selectedCategory ? "active" : ""}" data-category="all">
        Tutti
      </button>
      ${categories
        .map(
          (cat) => `
        <button class="glossary-category ${this.selectedCategory === cat ? "active" : ""}" data-category="${cat}">
          ${this.formatCategoryName(cat)}
        </button>
      `
        )
        .join("")}
    `;

    // Bind category clicks
    container.querySelectorAll(".glossary-category").forEach((btn) => {
      btn.addEventListener("click", () => {
        const category = btn.dataset.category === "all" ? null : btn.dataset.category;
        this.selectedCategory = category;
        this.renderCategories();
        this.renderTerms();
      });
    });
  }

  /**
   * Get categories from data
   */
  getCategories() {
    if (!glossaryData) {
      return [];
    }

    const categories = new Set();
    Object.keys(glossaryData).forEach((key) => {
      const term = glossaryData[key];
      if (term.category) {
        categories.add(term.category);
      } else {
        // Infer category from key
        if (key.includes("_info") || key.includes("Info")) {
          categories.add("info");
        } else if (key.includes("Regime") || key.includes("Score")) {
          categories.add("regime");
        } else if (key.includes("Vol") || key.includes("Volatility")) {
          categories.add("volatility");
        } else if (key.includes("Credit") || key.includes("FX")) {
          categories.add("market");
        } else {
          categories.add("general");
        }
      }
    });

    return Array.from(categories).sort();
  }

  /**
   * Format category name
   */
  formatCategoryName(category) {
    const names = {
      info: "Informazioni",
      regime: "Regime",
      volatility: "Volatilità",
      market: "Mercati",
      general: "Generale",
    };
    return names[category] || category;
  }

  /**
   * Render terms
   */
  renderTerms() {
    if (!glossaryData) {
      return;
    }

    const container = document.getElementById("glossary-list");
    if (!container) {
      return;
    }

    // Filtra termini
    const filtered = this.filterTerms();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="glossary-empty">
          <p>Nessun termine trovato</p>
        </div>
      `;
      return;
    }

    // Raggruppa per lettera iniziale
    const grouped = this.groupByLetter(filtered);

    container.innerHTML = Object.keys(grouped)
      .sort()
      .map(
        (letter) => `
        <div class="glossary-letter-group">
          <h3 class="glossary-letter">${letter}</h3>
          <div class="glossary-terms">
            ${grouped[letter].map((term) => this.renderTerm(term)).join("")}
          </div>
        </div>
      `
      )
      .join("");
  }

  /**
   * Filter terms
   */
  filterTerms() {
    if (!glossaryData) {
      return [];
    }

    const terms = Object.entries(glossaryData)
      .map(([key, value]) => ({
        key,
        title: value.title || key,
        what: value.what || "",
        how: value.how || "",
        source: value.source || "",
        category: value.category || this.inferCategory(key),
      }))
      .filter((term) => {
        // Filter by category
        if (this.selectedCategory && term.category !== this.selectedCategory) {
          return false;
        }

        // Filter by search
        if (this.searchTerm) {
          const search = this.searchTerm.toLowerCase();
          return (
            term.title.toLowerCase().includes(search) ||
            term.what.toLowerCase().includes(search) ||
            term.how.toLowerCase().includes(search) ||
            term.key.toLowerCase().includes(search)
          );
        }

        return true;
      });

    return terms.sort((a, b) => a.title.localeCompare(b.title, "it"));
  }

  /**
   * Infer category from key
   */
  inferCategory(key) {
    if (key.includes("_info") || key.includes("Info")) {
      return "info";
    }
    if (key.includes("Regime") || key.includes("Score")) {
      return "regime";
    }
    if (key.includes("Vol") || key.includes("Volatility")) {
      return "volatility";
    }
    if (key.includes("Credit") || key.includes("FX") || key.includes("ETF")) {
      return "market";
    }
    return "general";
  }

  /**
   * Group terms by first letter
   */
  groupByLetter(terms) {
    const grouped = {};
    terms.forEach((term) => {
      const letter = term.title.charAt(0).toUpperCase();
      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(term);
    });
    return grouped;
  }

  /**
   * Render single term
   */
  renderTerm(term) {
    return `
      <div class="glossary-term" data-term-key="${term.key}">
        <div class="glossary-term-header">
          <h4 class="glossary-term-title">${this.escapeHtml(term.title)}</h4>
          ${term.category ? `<span class="glossary-term-category">${this.formatCategoryName(term.category)}</span>` : ""}
        </div>
        ${term.what ? `<div class="glossary-term-what"><strong>Cosa:</strong> ${this.escapeHtml(term.what)}</div>` : ""}
        ${term.how ? `<div class="glossary-term-how"><strong>Come:</strong> ${this.escapeHtml(term.how)}</div>` : ""}
        ${term.source ? `<div class="glossary-term-source"><strong>Fonte:</strong> ${this.escapeHtml(term.source)}</div>` : ""}
      </div>
    `;
  }

  /**
   * Bind events
   */
  bindEvents(modal) {
    const closeBtn = modal.querySelector(".glossary-modal-close");
    const overlay = modal.querySelector(".glossary-modal-overlay");
    const searchInput = document.getElementById("glossary-search");

    const close = () => {
      modal.style.opacity = "0";
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn?.addEventListener("click", close);
    overlay?.addEventListener("click", close);

    // Search
    searchInput?.addEventListener("input", (e) => {
      this.searchTerm = e.target.value;
      this.renderTerms();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.parentElement) {
        close();
      }
    });
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get term by key
   */
  getTerm(key) {
    if (!glossaryData) {
      return null;
    }
    return glossaryData[key] || null;
  }

  /**
   * Search term
   */
  search(query) {
    this.searchTerm = query;
    if (glossaryInstance) {
      glossaryInstance.renderTerms();
    }
  }
}

/**
 * Open glossary from external
 */
export async function openGlossary(searchTerm = null) {
  const system = await initGlossary();
  system.open();
  if (searchTerm) {
    system.search(searchTerm);
  }
}
