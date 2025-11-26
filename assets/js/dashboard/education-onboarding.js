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
    // Verifica se l'utente ha già completato l'onboarding
    const onboardingCompleted = localStorage.getItem("education-onboarding-completed");

    if (onboardingCompleted === "true") {
      // Nascondi overlay se già completato
      hideOnboardingOverlay();
      return;
    }

    // Mostra onboarding solo se non è stato completato
    // Per ora, nascondiamo sempre l'overlay per non bloccare l'accesso
    // (l'onboarding può essere mostrato in futuro quando implementato)
    hideOnboardingOverlay();

    // Se in futuro vuoi mostrare l'onboarding, decommenta:
    // showOnboarding();
  } catch (error) {
    safeLog("error", "[Education Onboarding] Errore inizializzazione:", error);
    // Fallback: nascondi sempre l'overlay in caso di errore
    hideOnboardingOverlay();
  }
}

/**
 * Hide onboarding overlay
 */
function hideOnboardingOverlay() {
  const overlay = document.getElementById("onboarding-overlay");
  if (overlay) {
    overlay.style.display = "none";
    overlay.style.opacity = "0";
    overlay.style.visibility = "hidden";
    overlay.setAttribute("aria-hidden", "true");
    safeLog("log", "[Education Onboarding] Overlay nascosto");
  }
}

/**
 * Show onboarding overlay (per implementazione futura)
 * @param {HTMLElement} overlay - Overlay element
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function showOnboarding(overlay) {
  // Implementazione futura per mostrare onboarding
  // const overlayEl = overlay || document.getElementById("onboarding-overlay");
  // if (overlayEl) {
  //   overlayEl.style.display = "flex";
  //   overlayEl.style.opacity = "1";
  //   overlayEl.style.visibility = "visible";
  //   overlayEl.setAttribute("aria-hidden", "false");
  // }
}

/**
 * Mark onboarding as completed
 */
export function completeOnboarding() {
  localStorage.setItem("education-onboarding-completed", "true");
  hideOnboardingOverlay();
}
