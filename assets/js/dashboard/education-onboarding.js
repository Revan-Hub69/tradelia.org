/* eslint-env browser */
/**
 * Education Onboarding System
 * Gestisce l'onboarding per nuovi utenti del sistema educativo
 */

import { safeLog } from "./security-utils.js";

/**
 * Initialize onboarding system
 */
export async function initOnboarding() {
  try {
    // Crea overlay se non esiste
    let overlay = document.getElementById("onboarding-overlay");
    if (!overlay) {
      overlay = createOnboardingOverlay();
    }

    // Verifica se l'utente ha già completato l'onboarding
    const onboardingCompleted = localStorage.getItem("education-onboarding-completed");

    if (onboardingCompleted === "true") {
      // Nascondi overlay se già completato
      hideOnboardingOverlay();
      return;
    }

    // Non mostrare onboarding automaticamente - solo se esplicitamente richiesto
    // L'onboarding può essere mostrato manualmente chiamando showOnboarding()
    hideOnboardingOverlay();
  } catch (error) {
    safeLog("error", "[Education Onboarding] Errore inizializzazione:", error);
    // Fallback: nascondi sempre l'overlay in caso di errore
    hideOnboardingOverlay();
  }
}

/**
 * Create onboarding overlay element
 */
function createOnboardingOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "onboarding-overlay";
  overlay.className = "onboarding-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "onboarding-title");
  // Inizialmente nascosto, verrà mostrato da showOnboarding()
  overlay.hidden = true;
  overlay.style.display = "none";

  const modal = document.createElement("div");
  modal.className = "onboarding-modal";

  const step = document.createElement("div");
  step.className = "onboarding-step";

  step.innerHTML = `
    <h2 id="onboarding-title" class="onboarding-title">Benvenuto nel Sistema Formativo</h2>
    <p class="onboarding-description">
      Scopri come utilizzare i percorsi formativi, i test e le certificazioni disponibili.
    </p>
    <div class="onboarding-actions">
      <button class="btn btn-primary" id="onboarding-skip">Salta</button>
      <button class="btn btn-secondary" id="onboarding-start">Inizia tour</button>
    </div>
  `;

  modal.appendChild(step);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Bind event listeners
  const skipBtn = overlay.querySelector("#onboarding-skip");
  const startBtn = overlay.querySelector("#onboarding-start");

  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      completeOnboarding();
    });
  }

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      // TODO: Implementa tour guidato
      completeOnboarding();
    });
  }

  // Chiudi cliccando fuori
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      completeOnboarding();
    }
  });

  return overlay;
}

/**
 * Hide onboarding overlay
 */
export function hideOnboardingOverlay() {
  const overlay = document.getElementById("onboarding-overlay");
  if (overlay) {
    overlay.hidden = true;
    overlay.style.display = "none";
    overlay.style.opacity = "0";
    overlay.style.visibility = "hidden";
    overlay.setAttribute("aria-hidden", "true");
    safeLog("log", "[Education Onboarding] Overlay nascosto");
  }
}

/**
 * Show onboarding overlay
 * @param {HTMLElement} overlay - Overlay element (opzionale)
 */
export function showOnboarding(overlay) {
  const overlayEl = overlay || document.getElementById("onboarding-overlay");
  if (overlayEl) {
    overlayEl.hidden = false;
    overlayEl.style.display = "flex";
    overlayEl.style.opacity = "1";
    overlayEl.style.visibility = "visible";
    overlayEl.setAttribute("aria-hidden", "false");
    safeLog("log", "[Education Onboarding] Overlay mostrato");
  }
}

/**
 * Mark onboarding as completed
 */
export function completeOnboarding() {
  localStorage.setItem("education-onboarding-completed", "true");
  hideOnboardingOverlay();
}
