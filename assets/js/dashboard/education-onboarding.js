/* eslint-env browser */
/**
 * Education Onboarding Flow
 * Tutorial interattivo per nuovi utenti
 * Best Practice 2025: Progressive Disclosure
 */

import { safeLog } from "./security-utils.js";
import { EducationIcons } from "./education-icons.js";

const ONBOARDING_STORAGE_KEY = "tradelia_education_onboarding_completed";
const ONBOARDING_VERSION = 1; // Incrementa per forzare re-onboarding

let currentStep = 0;
let onboardingData = null;

/**
 * Inizializza onboarding se necessario
 */
export async function initOnboarding() {
  // Verifica se già completato
  const completed = localStorage.getItem(`${ONBOARDING_STORAGE_KEY}_v${ONBOARDING_VERSION}`);
  if (completed === "true") {
    return false;
  }

  // Mostra onboarding
  await showOnboarding();
  return true;
}

/**
 * Mostra onboarding flow
 */
async function showOnboarding() {
  const container =
    document.getElementById("education-container") || document.getElementById("main-content");
  if (!container) {
    safeLog("warn", "[Onboarding] Container non trovato");
    return;
  }

  // Crea overlay
  const overlay = document.createElement("div");
  overlay.className = "onboarding-overlay";
  overlay.id = "onboarding-overlay";
  document.body.appendChild(overlay);

  // Crea modal onboarding
  const modal = document.createElement("div");
  modal.className = "onboarding-modal";
  modal.id = "onboarding-modal";
  overlay.appendChild(modal);

  // Step 1: Welcome
  await showWelcomeStep(modal);
}

/**
 * Step 1: Welcome Screen
 */
async function showWelcomeStep(modal) {
  currentStep = 1;
  modal.innerHTML = `
    <div class="onboarding-step onboarding-welcome">
      <div class="onboarding-header">
        <div class="onboarding-logo">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="50" cy="50" r="40"/>
            <path d="M30 50 L45 65 L70 35"/>
          </svg>
        </div>
        <h2 class="onboarding-title">Benvenuto in Tradelia Education</h2>
        <p class="onboarding-description">
          Il tuo percorso formativo personalizzato per diventare un investitore consapevole.
          Ti guideremo attraverso i concetti fondamentali in modo semplice e pratico.
        </p>
      </div>
      <div class="onboarding-content">
        <div class="onboarding-features">
          <div class="feature-item">
            <div class="feature-icon">${EducationIcons.modules.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="32" height="32"')}</div>
            <div class="feature-text">
              <strong>Moduli Interattivi</strong>
              <span>Lezioni pratiche con esempi reali</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">${EducationIcons.target.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="32" height="32"')}</div>
            <div class="feature-text">
              <strong>Percorsi Personalizzati</strong>
              <span>Adattati al tuo livello e obiettivi</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">${EducationIcons.badge.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="32" height="32"')}</div>
            <div class="feature-text">
              <strong>Gamification</strong>
              <span>Badge, punti e achievement</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">${EducationIcons.simulator.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="32" height="32"')}</div>
            <div class="feature-text">
              <strong>Strumenti Pratici</strong>
              <span>Calcolatori e simulatori</span>
            </div>
          </div>
        </div>
      </div>
      <div class="onboarding-footer">
        <button class="onboarding-btn onboarding-btn-primary" data-action="next">
          Inizia il Tour
        </button>
        <button class="onboarding-btn onboarding-btn-secondary" data-action="skip">
          Salta
        </button>
      </div>
    </div>
  `;

  bindOnboardingEvents(modal);
}

/**
 * Step 2: Dashboard Overview
 */
async function showDashboardStep(modal) {
  currentStep = 2;
  modal.innerHTML = `
    <div class="onboarding-step onboarding-dashboard">
      <div class="onboarding-header">
        <h2 class="onboarding-title">Dashboard Principale</h2>
        <p class="onboarding-description">
          La tua dashboard mostra il progresso, statistiche e moduli disponibili.
        </p>
      </div>
      <div class="onboarding-content">
        <div class="onboarding-highlight" data-highlight="education-stats">
          <div class="highlight-arrow">↓</div>
          <div class="highlight-content">
            <strong>Statistiche</strong>
            <span>Livello, punti, moduli completati e streak</span>
          </div>
        </div>
        <div class="onboarding-highlight" data-highlight="education-modules">
          <div class="highlight-arrow">↓</div>
          <div class="highlight-content">
            <strong>Moduli Formativi</strong>
            <span>Clicca su un modulo per iniziare</span>
          </div>
        </div>
      </div>
      <div class="onboarding-footer">
        <div class="onboarding-progress">
          <div class="progress-dot ${currentStep >= 1 ? "active" : ""}"></div>
          <div class="progress-dot ${currentStep >= 2 ? "active" : ""}"></div>
          <div class="progress-dot ${currentStep >= 3 ? "active" : ""}"></div>
          <div class="progress-dot ${currentStep >= 4 ? "active" : ""}"></div>
        </div>
        <button class="onboarding-btn onboarding-btn-primary" data-action="next">
          Avanti
        </button>
        <button class="onboarding-btn onboarding-btn-secondary" data-action="skip">
          Salta
        </button>
      </div>
    </div>
  `;

  // Highlight elementi reali
  highlightElements();

  bindOnboardingEvents(modal);
}

/**
 * Step 3: Quick Access Tools
 */
async function showToolsStep(modal) {
  currentStep = 3;
  modal.innerHTML = `
    <div class="onboarding-step onboarding-tools">
      <div class="onboarding-header">
        <h2 class="onboarding-title">Strumenti Rapidi</h2>
        <p class="onboarding-description">
          Accedi rapidamente a strumenti utili durante lo studio.
        </p>
      </div>
      <div class="onboarding-content">
        <div class="onboarding-highlight" data-highlight="sr-quick-access">
          <div class="highlight-arrow">↓</div>
          <div class="highlight-content">
            <strong>Ripasso Distribuito</strong>
            <span>Ripassa concetti con spaced repetition</span>
          </div>
        </div>
        <div class="onboarding-tool-preview">
          <div class="tool-item">
            <div class="tool-icon">${EducationIcons.calculator.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="40" height="40"')}</div>
            <div class="tool-name">Calcolatore</div>
          </div>
          <div class="tool-item">
            <div class="tool-icon">${EducationIcons.simulator.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="40" height="40"')}</div>
            <div class="tool-name">Simulatore</div>
          </div>
          <div class="tool-item">
            <div class="tool-icon">${EducationIcons.glossary.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="40" height="40"')}</div>
            <div class="tool-name">Glossario</div>
          </div>
        </div>
      </div>
      <div class="onboarding-footer">
        <div class="onboarding-progress">
          <div class="progress-dot ${currentStep >= 1 ? "active" : ""}"></div>
          <div class="progress-dot ${currentStep >= 2 ? "active" : ""}"></div>
          <div class="progress-dot ${currentStep >= 3 ? "active" : ""}"></div>
          <div class="progress-dot ${currentStep >= 4 ? "active" : ""}"></div>
        </div>
        <button class="onboarding-btn onboarding-btn-primary" data-action="next">
          Avanti
        </button>
        <button class="onboarding-btn onboarding-btn-secondary" data-action="skip">
          Salta
        </button>
      </div>
    </div>
  `;

  highlightElements();
  bindOnboardingEvents(modal);
}

/**
 * Step 4: Quick Start
 */
async function showQuickStartStep(modal) {
  currentStep = 4;
  modal.innerHTML = `
    <div class="onboarding-step onboarding-quickstart">
      <div class="onboarding-header">
        <h2 class="onboarding-title">Scegli il Tuo Percorso</h2>
        <p class="onboarding-description">
          Seleziona il percorso più adatto ai tuoi obiettivi.
        </p>
      </div>
      <div class="onboarding-content">
        <div class="onboarding-paths">
          <div class="path-card" data-path="pac">
            <div class="path-icon">${EducationIcons.pac.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="48" height="48"')}</div>
            <div class="path-title">Piano di Accumulo</div>
            <div class="path-description">Per chi vuole iniziare a investire i risparmi</div>
          </div>
          <div class="path-card" data-path="wealth">
            <div class="path-icon">${EducationIcons.wealth.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="48" height="48"')}</div>
            <div class="path-title">Wealth Management</div>
            <div class="path-description">Per chi ha un gruzzoletto da gestire</div>
          </div>
          <div class="path-card" data-path="trading">
            <div class="path-icon">${EducationIcons.crypto.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="48" height="48"')}</div>
            <div class="path-title">Trading & Speculazione</div>
            <div class="path-description">Per chi vuole speculare (include crypto)</div>
          </div>
        </div>
      </div>
      <div class="onboarding-footer">
        <div class="onboarding-progress">
          <div class="progress-dot ${currentStep >= 1 ? "active" : ""}"></div>
          <div class="progress-dot ${currentStep >= 2 ? "active" : ""}"></div>
          <div class="progress-dot ${currentStep >= 3 ? "active" : ""}"></div>
          <div class="progress-dot ${currentStep >= 4 ? "active" : ""}"></div>
        </div>
        <button class="onboarding-btn onboarding-btn-primary" data-action="complete">
          Inizia
        </button>
        <button class="onboarding-btn onboarding-btn-secondary" data-action="skip">
          Salta
        </button>
      </div>
    </div>
  `;

  bindOnboardingEvents(modal);

  // Path selection
  const pathCards = modal.querySelectorAll(".path-card");
  pathCards.forEach((card) => {
    card.addEventListener("click", () => {
      pathCards.forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      onboardingData = { selectedPath: card.dataset.path };
    });
  });
}

/**
 * Highlight elementi reali nella pagina
 */
function highlightElements() {
  // Rimuovi highlight precedenti
  document.querySelectorAll(".onboarding-highlighted").forEach((el) => {
    el.classList.remove("onboarding-highlighted");
  });

  // Aggiungi highlight
  const highlights = document.querySelectorAll(".onboarding-highlight");
  highlights.forEach((highlight) => {
    const targetSelector = highlight.dataset.highlight;
    const target = document.querySelector(`.${targetSelector}`);
    if (target) {
      target.classList.add("onboarding-highlighted");
    }
  });
}

/**
 * Bind eventi onboarding
 */
function bindOnboardingEvents(modal) {
  const nextBtn = modal.querySelector('[data-action="next"]');
  const skipBtn = modal.querySelector('[data-action="skip"]');
  const completeBtn = modal.querySelector('[data-action="complete"]');

  if (nextBtn) {
    nextBtn.addEventListener("click", async () => {
      if (currentStep === 1) {
        await showDashboardStep(modal);
      } else if (currentStep === 2) {
        await showToolsStep(modal);
      } else if (currentStep === 3) {
        await showQuickStartStep(modal);
      }
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      completeOnboarding();
    });
  }

  if (completeBtn) {
    completeBtn.addEventListener("click", () => {
      completeOnboarding();
    });
  }

  // Close on overlay click
  const overlay = document.getElementById("onboarding-overlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        completeOnboarding();
      }
    });
  }
}

/**
 * Completa onboarding
 */
function completeOnboarding() {
  localStorage.setItem(`${ONBOARDING_STORAGE_KEY}_v${ONBOARDING_VERSION}`, "true");

  // Salva preferenze se selezionate
  if (onboardingData) {
    localStorage.setItem("tradelia_education_preferences", JSON.stringify(onboardingData));
  }

  // Rimuovi overlay
  const overlay = document.getElementById("onboarding-overlay");
  if (overlay) {
    overlay.style.opacity = "0";
    setTimeout(() => {
      overlay.remove();
    }, 300);
  }

  safeLog("log", "[Onboarding] Completato");
}
