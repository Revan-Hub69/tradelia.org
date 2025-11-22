/**
 * Dashboard Module: Overview
 * Panoramica dashboard con statistiche, attività recente e quick actions
 */

import { showSkeletons, hideSkeleton } from "./loading-skeleton.js";
import { showToast } from "./toast.js";

// Removed unused imports after removing account section

export async function loadOverview() {
  const container = document.getElementById("overview-container");
  if (!container) {
    return;
  }

  // BEST PRACTICE: Show skeleton loading while data loads
  container.innerHTML = "";
  const statsGrid = document.createElement("div");
  statsGrid.className = "overview-stats-grid";
  container.appendChild(statsGrid);

  // Show skeleton for stats
  showSkeletons(statsGrid, "stat", 2);

  // Renderizza struttura base se non esiste
  renderOverviewStructure();

  // Carica statistiche
  try {
    const reports = await loadReportsData();

    // Hide skeleton
    hideSkeleton(statsGrid);

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
    hideSkeleton(statsGrid);
    showToast("Errore nel caricamento delle statistiche", "error");
  }

  // Carica attività recente (reports + navigation)
  loadRecentActivity();

  // Carica navigation history se disponibile
  if (window.getRecentActivity) {
    const navHistory = window.getRecentActivity();
    if (navHistory && navHistory.length > 0) {
      loadNavigationHistory(navHistory);
    }
  }
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

  // Load navigation history if available
  const navHistory = JSON.parse(localStorage.getItem("dashboard-navigation-history") || "[]");
  if (navHistory.length > 0) {
    loadNavigationHistory(navHistory);
  }
}

function loadNavigationHistory(navHistory) {
  const activityList = document.getElementById("recent-activity");
  if (!activityList) {
    return;
  }

  const navItems = navHistory
    .slice(0, 5)
    .map(
      (item) => `
    <div class="recent-activity-item">
      <div class="activity-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
      <div class="activity-content">
        <div class="activity-title">${escapeHtml(item.moduleName || item.moduleId)}</div>
        <div class="activity-time">${getTimeAgo(new Date(item.timestamp))}</div>
      </div>
      <a href="${item.url || "#"}" class="activity-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </a>
    </div>
  `
    )
    .join("");

  if (activityList.innerHTML.includes("recent-activity-item")) {
    activityList.innerHTML += navItems;
  } else if (activityList.innerHTML.includes("empty-state")) {
    activityList.innerHTML = navItems;
  }
}

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "Ora";
  }
  if (diffMins < 60) {
    return `${diffMins} minuti fa`;
  }
  if (diffHours < 24) {
    return `${diffHours} ore fa`;
  }
  if (diffDays < 7) {
    return `${diffDays} giorni fa`;
  }
  return date.toLocaleDateString("it-IT");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function loadReportsData() {
  try {
    // BEST PRACTICE: Gestione errore 404 per manifest.json
    let response;
    try {
      response = await fetch("/archivio/manifest.json");
      if (!response.ok) {
        console.warn("[Overview] manifest.json non trovato");
        return;
      }
    } catch (error) {
      console.warn("[Overview] Errore caricamento manifest.json:", error);
      return;
    }
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
 * Renderizza la struttura base della panoramica se non esiste
 */
function renderOverviewStructure() {
  const container = document.getElementById("overview-container");
  if (!container) {
    return;
  }

  // Check if stats grid already exists
  let statsGrid = container.querySelector(".overview-stats-grid");
  if (!statsGrid) {
    statsGrid = document.createElement("div");
    statsGrid.className = "overview-stats-grid";
    container.appendChild(statsGrid);
  }

  // Check if stats cards already exist
  if (statsGrid.querySelector(".stat-card")) {
    return; // Already rendered
  }

  // Render stats cards
  statsGrid.innerHTML = `
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
    <div class="stat-card stat-card-chart">
      <div class="stat-label">Visualizzazione Trend</div>
      <div class="stat-chart-container">
        <canvas id="overview-trend-chart" width="400" height="200"></canvas>
      </div>
    </div>
  `;

  // Check if activity section already exists
  let activitySection = container.querySelector(".overview-section");
  if (!activitySection) {
    activitySection = document.createElement("div");
    activitySection.className = "overview-section";
    container.appendChild(activitySection);
  }

  // Check if activity list already exists
  if (!activitySection.querySelector("#recent-activity")) {
    activitySection.innerHTML = `
      <h3 class="overview-section-title">Attività Recente</h3>
      <div class="recent-activity-list" id="recent-activity">
        <div class="empty-state">Nessuna attività recente</div>
      </div>
    `;
  }
}
