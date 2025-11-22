/* eslint-env browser */
/**
 * Enhanced Feedback System
 * BEST PRACTICE: Nielsen's Usability Heuristics - System Status Visibility
 * Fornire feedback chiaro su tutte le azioni e stato del sistema
 */

import { announceToScreenReader } from "./accessibility.js";

/**
 * Show loading state with feedback
 */
export function showLoadingState(element, message = "Caricamento in corso...") {
  if (!element) {
    return;
  }

  const loadingId = `loading-${Date.now()}`;
  const loadingEl = document.createElement("div");
  loadingEl.id = loadingId;
  loadingEl.className = "loading-feedback";
  loadingEl.setAttribute("role", "status");
  loadingEl.setAttribute("aria-live", "polite");
  loadingEl.setAttribute("aria-busy", "true");
  loadingEl.innerHTML = `
    <div class="loading-spinner"></div>
    <span class="loading-message">${message}</span>
  `;

  element.setAttribute("aria-busy", "true");
  element.appendChild(loadingEl);

  announceToScreenReader(message);

  return loadingId;
}

/**
 * Hide loading state
 */
export function hideLoadingState(element, loadingId) {
  if (!element) {
    return;
  }

  if (loadingId) {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
      loadingEl.remove();
    }
  } else {
    const loadingEl = element.querySelector(".loading-feedback");
    if (loadingEl) {
      loadingEl.remove();
    }
  }

  element.removeAttribute("aria-busy");
}

/**
 * Show success feedback
 */
export function showSuccessFeedback(message, element = null) {
  if (window.showToast) {
    window.showToast(message, "success");
  }

  announceToScreenReader(message);

  if (element) {
    element.setAttribute("aria-live", "polite");
    const feedback = document.createElement("div");
    feedback.className = "success-feedback";
    feedback.setAttribute("role", "status");
    feedback.textContent = message;
    element.appendChild(feedback);

    setTimeout(() => {
      feedback.remove();
    }, 3000);
  }
}

/**
 * Show error feedback with suggestions
 */
export function showErrorFeedback(message, suggestions = [], element = null) {
  if (window.showToast) {
    window.showToast(message, "error");
  }

  announceToScreenReader(message, "assertive");

  if (element && suggestions.length > 0) {
    const feedback = document.createElement("div");
    feedback.className = "error-feedback";
    feedback.setAttribute("role", "alert");
    feedback.innerHTML = `
      <div class="error-message">${message}</div>
      <ul class="error-suggestions">
        ${suggestions.map((s) => `<li>${s}</li>`).join("")}
      </ul>
    `;
    element.appendChild(feedback);

    setTimeout(() => {
      feedback.remove();
    }, 5000);
  }
}

/**
 * Show progress indicator
 */
export function showProgress(current, total, message = "") {
  const progress = Math.round((current / total) * 100);
  const progressText = message || `Progresso: ${progress}% (${current} di ${total})`;

  announceToScreenReader(progressText);

  // Update or create progress bar
  let progressBar = document.getElementById("global-progress");
  if (!progressBar) {
    progressBar = document.createElement("div");
    progressBar.id = "global-progress";
    progressBar.className = "global-progress";
    progressBar.setAttribute("role", "progressbar");
    progressBar.setAttribute("aria-valuenow", progress);
    progressBar.setAttribute("aria-valuemin", 0);
    progressBar.setAttribute("aria-valuemax", 100);
    progressBar.setAttribute("aria-label", progressText);
    document.body.appendChild(progressBar);
  }

  progressBar.setAttribute("aria-valuenow", progress);
  progressBar.setAttribute("aria-label", progressText);
  progressBar.style.setProperty("--progress", `${progress}%`);

  if (progress === 100) {
    setTimeout(() => {
      progressBar.remove();
    }, 2000);
  }
}

/**
 * Show save state feedback
 */
export function showSaveState(isSaving, isSaved = false) {
  const saveIndicator = document.getElementById("save-indicator") || createSaveIndicator();

  if (isSaving) {
    saveIndicator.className = "save-indicator saving";
    saveIndicator.setAttribute("aria-label", "Salvataggio in corso");
    saveIndicator.textContent = "Salvataggio...";
    announceToScreenReader("Salvataggio in corso");
  } else if (isSaved) {
    saveIndicator.className = "save-indicator saved";
    saveIndicator.setAttribute("aria-label", "Salvato");
    saveIndicator.textContent = "Salvato";
    announceToScreenReader("Modifiche salvate");

    setTimeout(() => {
      saveIndicator.className = "save-indicator";
      saveIndicator.textContent = "";
    }, 2000);
  } else {
    saveIndicator.className = "save-indicator";
    saveIndicator.textContent = "";
  }
}

/**
 * Create save indicator element
 */
function createSaveIndicator() {
  const indicator = document.createElement("div");
  indicator.id = "save-indicator";
  indicator.className = "save-indicator";
  indicator.setAttribute("role", "status");
  indicator.setAttribute("aria-live", "polite");

  const header = document.querySelector(".dashboard-header-minimal");
  if (header) {
    header.appendChild(indicator);
  } else {
    document.body.appendChild(indicator);
  }

  return indicator;
}
