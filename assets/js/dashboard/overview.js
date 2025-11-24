/**
 * Dashboard Module: Overview
 * Panoramica dashboard con statistiche, attività recente e quick actions
 */

import { showSkeletons, hideSkeleton } from "./loading-skeleton.js";
import { showToast } from "./toast.js";

const numberFormatter = new Intl.NumberFormat("it-IT");

export async function loadOverview() {
  const container = document.getElementById("overview-container");
  if (!container) {
    return;
  }

  renderOverviewStructure();

  const statsGrid = document.getElementById("overview-stats-grid");
  if (statsGrid) {
    statsGrid.innerHTML = "";
    showSkeletons(statsGrid, "stat", 3);
  }

  try {
    const { items, generatedAt } = await loadReportsData();
    const reports = normalizeReports(items);

    updateInsightCards(reports, generatedAt);
    updateNarrative(reports, generatedAt);
    if (statsGrid) {
      hideSkeleton(statsGrid);
    }
  } catch (e) {
    console.error("[Overview] Errore caricamento statistiche:", e);
    if (statsGrid) {
      hideSkeleton(statsGrid);
    }
    showToast("Errore nel caricamento delle statistiche", "error");
    setNarrativeFallback();
  }

  loadRecentActivity();

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
    let response;
    try {
      response = await fetch("/archivio/manifest.json");
      if (!response.ok) {
        console.warn("[Overview] manifest.json non trovato");
        return { items: [], generatedAt: null };
      }
    } catch (error) {
      console.warn("[Overview] Errore caricamento manifest.json:", error);
      return { items: [], generatedAt: null };
    }
    if (response.ok) {
      const data = await response.json();
      return {
        items: Array.isArray(data.reports) ? data.reports : [],
        generatedAt: data.generated_at || null,
      };
    }
  } catch (e) {
    console.error("[Overview] Errore caricamento report:", e);
  }
  return { items: [], generatedAt: null };
}

/**
 * Renderizza la struttura base della panoramica se non esiste
 */
function renderOverviewStructure() {
  const container = document.getElementById("overview-container");
  if (!container) {
    return;
  }

  const hasGrid = container.querySelector("#overview-stats-grid");
  const hasNarrative = container.querySelector("#overview-narrative-block");
  const hasActivity = container.querySelector("#recent-activity");

  if (hasGrid && hasNarrative && hasActivity) {
    return;
  }

  container.innerHTML = `
    <section class="overview-insights" aria-label="Indicatori principali dashboard">
      <div class="overview-stats-grid" id="overview-stats-grid"></div>
      <div class="overview-narrative" id="overview-narrative-block">
        <div class="narrative-eyebrow">Executive briefing</div>
        <p id="overview-narrative-text">Raccolta insight in corso...</p>
        <ul class="narrative-actions" id="overview-next-actions">
          <li data-placeholder="true">Monitoraggio attività recente</li>
        </ul>
      </div>
    </section>
    <section class="overview-section" aria-label="Attività recente">
      <h3 class="overview-section-title">Attività Recente</h3>
      <div class="recent-activity-list" id="recent-activity">
        <div class="empty-state">Nessuna attività recente</div>
      </div>
    </section>
  `;
}

function updateInsightCards(reports, generatedAt) {
  const statsGrid = document.getElementById("overview-stats-grid");
  if (!statsGrid) {
    return;
  }

  const sectors = new Set(
    reports
      .map((report) => report.sector || report.industry || "")
      .filter((sector) => sector && sector !== "N/D")
  );
  const latestReport = getLatestReport(reports);
  const cadence = computeCadence(reports);
  const compliance = computeComplianceScore(reports);

  const cards = [
    {
      label: "Report totali",
      value: reports.length ? numberFormatter.format(reports.length) : "—",
      meta: generatedAt
        ? `Manifest del ${formatDate(new Date(generatedAt))}`
        : "Manifest in aggiornamento",
    },
    {
      label: "Copertura settori",
      value: sectors.size ? numberFormatter.format(sectors.size) : "—",
      meta: sectors.size
        ? `Focus: ${getPreviewList(sectors)}`
        : "Aggiorna metadati di settore",
    },
    {
      label: "Ultima revisione",
      value: latestReport?.date ? formatRelativeDate(latestReport.date) : "—",
      meta: cadence.text,
    },
    {
      label: "Compliance",
      value: compliance.value,
      meta: compliance.meta,
    },
  ];

  statsGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="stat-card">
          <div class="stat-label">${card.label}</div>
          <div class="stat-value">${card.value}</div>
          <div class="stat-meta">${card.meta}</div>
        </article>
      `
    )
    .join("");
}

function updateNarrative(reports, generatedAt) {
  const narrative = document.getElementById("overview-narrative-text");
  const actionsList = document.getElementById("overview-next-actions");

  if (!narrative || !actionsList) {
    return;
  }

  if (!reports.length) {
    narrative.textContent =
      "Ancora nessun report istituzionale pubblicato. Completa il primo caricamento per ottenere insight di governance.";
    actionsList.innerHTML = `<li>Allinea il manifesto documentale e assegna owner di revisione</li>`;
    return;
  }

  const sectors = new Set(
    reports
      .map((report) => report.sector || report.industry)
      .filter((sector) => !!sector)
  );
  const latestReport = getLatestReport(reports);
  const cadence = computeCadence(reports);

  const latestLabel = latestReport?.date
    ? `${formatRelativeDate(latestReport.date)} (${timeAgo(latestReport.date)})`
    : "data non disponibile";

  narrative.textContent = `Sono disponibili ${reports.length} report istituzionali con copertura su ${
    sectors.size || "settori ancora da mappare"
  }. Ultimo aggiornamento ${latestLabel}.`;

  const actions = [
    sectors.size
      ? `Priorità coverage: monitora ${getPreviewList(sectors)}`
      : "Priorità coverage: aggiungi metadati di settore ai report",
    cadence.days
      ? `Cadence target: mantieni refresh ≤ ${cadence.days} giorni`
      : "Definisci la frequenza di refresh del dataset",
    generatedAt
      ? `Manifest verificato il ${formatDate(new Date(generatedAt))}`
      : "Manifest in corso di consolidamento",
  ];

  actionsList.innerHTML = actions.map((action) => `<li>${action}</li>`).join("");
}

function setNarrativeFallback() {
  const narrative = document.getElementById("overview-narrative-text");
  const actionsList = document.getElementById("overview-next-actions");
  if (!narrative || !actionsList) {
    return;
  }
  narrative.textContent = "Impossibile recuperare il manifest. Riprova tra qualche minuto.";
  actionsList.innerHTML = `<li>Verifica la disponibilità del manifest e la connettività</li>`;
}

function normalizeReports(items = []) {
  return items.map((item) => {
    if (typeof item === "string") {
      return { id: item };
    }
    return {
      id: item.id || item.slug || item.path || "report",
      ticker: item.ticker,
      company: item.company,
      date: item.public_after || item.created_at || item.date || null,
      sector: item.sector || item.industry || null,
      industry: item.industry || null,
      compliance: item.compliance || null,
      version: item.version || null,
      status: item.status || "draft",
    };
  });
}

function getLatestReport(reports = []) {
  const datedReports = reports
    .filter((report) => report.date)
    .map((report) => ({
      ...report,
      date: new Date(report.date),
    }))
    .sort((a, b) => b.date - a.date);

  return datedReports.length ? datedReports[0] : null;
}

function computeCadence(reports = []) {
  const dated = reports
    .filter((report) => report.date)
    .map((report) => new Date(report.date).getTime())
    .sort((a, b) => b - a);

  if (dated.length < 2) {
    return { days: null, text: "Dataset in fase di popolamento" };
  }

  let totalDiff = 0;
  let periods = 0;
  for (let i = 0; i < dated.length - 1 && i < 6; i += 1) {
    totalDiff += Math.abs(dated[i] - dated[i + 1]);
    periods += 1;
  }

  const avgMs = totalDiff / periods;
  const avgDays = Math.max(1, Math.round(avgMs / 86400000));

  return {
    days: avgDays,
    text: `Aggiornamento medio ogni ${avgDays} giorni`,
  };
}

function computeComplianceScore(reports = []) {
  const complianceSignals = reports
    .map((report) => report.compliance)
    .filter((signal) => signal && Object.keys(signal).length > 0);

  if (!complianceSignals.length) {
    return {
      value: "N/D",
      meta: "Aggiungi i riferimenti MiFID II al manifest",
    };
  }

  const mifidReady = complianceSignals.filter(
    (signal) => signal.mifid === true || signal.mifid2 === true
  ).length;

  const ratio = Math.round((mifidReady / complianceSignals.length) * 100);

  return {
    value: `${ratio}%`,
    meta:
      ratio === 100
        ? "Copertura MiFID II completa"
        : "Completa i metadati di compliance per la piena copertura",
  };
}

function getPreviewList(values) {
  const arr = Array.from(values);
  if (!arr.length) {
    return "—";
  }
  const preview = arr.slice(0, 3).join(", ");
  return arr.length > 3 ? `${preview} +${arr.length - 3}` : preview;
}

function formatDate(date) {
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeDate(date) {
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
  });
}

function timeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 1) {
    return "oggi";
  }
  if (diffDays === 1) {
    return "ieri";
  }
  if (diffDays < 30) {
    return `${diffDays} giorni fa`;
  }
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} mesi fa`;
  }
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} anni fa`;
}
