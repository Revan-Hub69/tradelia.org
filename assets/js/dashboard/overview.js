/**
 * Dashboard Module: Overview
 * Panoramica dashboard con statistiche, attività recente e quick actions
 */

import { getUserRole, getPlanData } from "./auth.js";

export async function loadOverview() {
  // Carica statistiche
  try {
    const reports = await loadReportsData();
    if (reports && reports.length > 0) {
      const totalEl = document.getElementById("stat-total-reports");
      if (totalEl) {
        totalEl.textContent = reports.length;
      }

      const lastUpdateEl = document.getElementById("stat-last-update");
      if (lastUpdateEl && reports[0].date) {
        lastUpdateEl.textContent = new Date(reports[0].date).toLocaleDateString("it-IT");
      }
    }
  } catch (e) {
    console.error("[Overview] Errore caricamento statistiche:", e);
  }

  // Carica attività recente
  loadRecentActivity();

  // Carica sezione account con toggle
  await loadAccountSection();

  // Renderizza struttura base se non esiste
  renderOverviewStructure();
}

function loadRecentActivity() {
  const activityList = document.getElementById("recent-activity");
  if (!activityList) {
    return;
  }

  const recentReports = JSON.parse(localStorage.getItem("tradelia-recent-reports") || "[]");

  if (recentReports.length > 0) {
    activityList.innerHTML = recentReports
      .slice(0, 5)
      .map(
        (report) => `
      <div class="recent-activity-item">
        <div class="activity-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div class="activity-content">
          <div class="activity-title">${report.ticker || report.id}</div>
          <div class="activity-time">${report.date ? new Date(report.date).toLocaleDateString("it-IT") : "Data non disponibile"}</div>
        </div>
      </div>
    `
      )
      .join("");
  }
}

async function loadReportsData() {
  try {
    const response = await fetch("/archivio/manifest.json");
    if (response.ok) {
      const data = await response.json();
      return data.reports || [];
    }
  } catch (e) {
    console.error("[Overview] Errore caricamento report:", e);
  }
  return [];
}

/**
 * Carica sezione account nella panoramica con toggle notifiche e PWA
 */
async function loadAccountSection() {
  const accountSection = document.getElementById("overview-account-section");
  if (!accountSection) {
    return;
  }

  try {
    const role = await getUserRole();
    const planData = await getPlanData();
    const plan = planData?.plan || {};

    // Preferenze
    const notificationsEnabled = localStorage.getItem("tradelia-notifications-enabled") === "true";
    const pwaEnabled = localStorage.getItem("tradelia-pwa-enabled") === "true";

    let accountHTML = "";

    if (role.role === "guest") {
      accountHTML = `
        <div class="overview-account-card">
          <div class="overview-account-header">
            <h3 class="overview-account-title">Account</h3>
          </div>
          <div class="overview-account-content">
            <p class="overview-account-text">Accedi per sbloccare tutte le funzionalità</p>
            <a href="/accesso.html" class="btn btn-elegant btn-sm" style="margin-top: var(--spacing-md);">Accedi</a>
          </div>
        </div>
      `;
    } else {
      const email = role.user?.email || "Utente";
      let validityInfo = "";

      // Validità codice accesso
      if (plan.type === "desk" && plan.expiresAt) {
        const expiresAt = new Date(plan.expiresAt);
        const daysLeft = Math.max(0, Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24)));
        validityInfo = `
          <div class="overview-account-validity">
            <span class="validity-label">Validità:</span>
            <span class="validity-value">${expiresAt.toLocaleDateString("it-IT")} (${daysLeft} giorni)</span>
          </div>
        `;
      } else if (plan.type === "pro" && plan.xoloPaymentDueDate) {
        const dueDate = new Date(plan.xoloPaymentDueDate);
        const daysLeft = Math.max(0, Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)));
        validityInfo = `
          <div class="overview-account-validity">
            <span class="validity-label">Prossimo pagamento:</span>
            <span class="validity-value">${dueDate.toLocaleDateString("it-IT")} (${daysLeft} giorni)</span>
          </div>
        `;
      }

      accountHTML = `
        <div class="overview-account-card">
          <div class="overview-account-header">
            <h3 class="overview-account-title">Account</h3>
            <span class="overview-account-email">${escapeHtml(email)}</span>
          </div>
          <div class="overview-account-content">
            ${validityInfo}
            <div class="overview-account-toggles">
              <label class="toggle-switch" title="Notifiche Push">
                <input type="checkbox" id="overview-toggle-notifications" ${notificationsEnabled ? "checked" : ""}>
                <span class="toggle-slider"></span>
                <span class="toggle-label">Notifiche Push</span>
              </label>
              <label class="toggle-switch" title="Installa PWA">
                <input type="checkbox" id="overview-toggle-pwa" ${pwaEnabled ? "checked" : ""}>
                <span class="toggle-slider"></span>
                <span class="toggle-label">Installa PWA</span>
              </label>
            </div>
          </div>
        </div>
      `;
    }

    accountSection.innerHTML = accountHTML;

    // Bind event listeners
    const notificationsToggle = accountSection.querySelector("#overview-toggle-notifications");
    if (notificationsToggle) {
      notificationsToggle.addEventListener("change", (e) => {
        localStorage.setItem("tradelia-notifications-enabled", e.target.checked ? "true" : "false");
        console.log("[Overview] Notifiche push:", e.target.checked ? "attivate" : "disattivate");
      });
    }

    const pwaToggle = accountSection.querySelector("#overview-toggle-pwa");
    if (pwaToggle) {
      pwaToggle.addEventListener("change", (e) => {
        localStorage.setItem("tradelia-pwa-enabled", e.target.checked ? "true" : "false");
        if (e.target.checked) {
          console.log("[Overview] PWA installazione richiesta");
        }
      });
    }
  } catch (e) {
    console.error("[Overview] Errore caricamento sezione account:", e);
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Renderizza la struttura base della panoramica se non esiste
 */
function renderOverviewStructure() {
  const container = document.getElementById("overview-container");
  if (!container || container.innerHTML.trim() !== "") {
    return;
  }

  container.innerHTML = `
    <div class="overview-stats-grid">
      <div class="stat-card">
        <div class="stat-label">Report Totali</div>
        <div class="stat-value" id="stat-total-reports">0</div>
        <div class="stat-change">Aggiornato oggi</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Ultimo Aggiornamento</div>
        <div class="stat-value" id="stat-last-update">—</div>
        <div class="stat-change">Data ultimo report</div>
      </div>
    </div>

    <div class="overview-section">
      <h3 class="overview-section-title">Account</h3>
      <div id="overview-account-section"></div>
    </div>

    <div class="overview-section">
      <h3 class="overview-section-title">Attività Recente</h3>
      <div class="recent-activity-list" id="recent-activity">
        <div class="empty-state">Nessuna attività recente</div>
      </div>
    </div>
  `;
}
