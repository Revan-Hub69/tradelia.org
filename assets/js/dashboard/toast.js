/* eslint-env browser */
/**
 * Toast Notification System
 * FASE 2: TypeScript Migration - Gradual
 * Best Practice: Sistema notifiche separato e riutilizzabile
 */

import { escapeHtml } from "./security-utils.js";

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {('success'|'error'|'info'|'warning')} variant - Toast variant
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, variant = "info", duration = 4000) {
  const toast = document.getElementById("dashboard-toast");
  if (!toast) {
    return;
  }

  // SECURITY: Sanitizza messaggio per prevenire XSS
  const safeMessage = escapeHtml(String(message));

  const icons = {
    success:
      '<svg class="dashboard-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error:
      '<svg class="dashboard-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    info: '<svg class="dashboard-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    warning:
      '<svg class="dashboard-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  };

  toast.setAttribute("data-variant", variant);
  toast.setAttribute("data-visible", "true");
  toast.innerHTML = `
    <div class="dashboard-toast-content">
      ${icons[variant] || icons.info}
      <div class="dashboard-toast-message">${safeMessage}</div>
    </div>
  `;

  setTimeout(() => {
    toast.setAttribute("data-visible", "false");
    setTimeout(() => {
      toast.innerHTML = "";
    }, 300);
  }, duration);
}

// Export globally for use in other modules
window.showToast = showToast;
