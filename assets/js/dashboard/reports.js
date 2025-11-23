/* eslint-env browser */
/**
 * Dashboard Module: Reports
 * Lista report ufficiali con ricerca e filtri
 * (Logica esistente, qui per modularità)
 */

import { showSkeletons, hideSkeleton } from "./loading-skeleton.js";
import { showToast } from "./toast.js";
import { createErrorBoundary, retryWithBackoff } from "./error-handler.js";
import { isInWatchlist } from "./watchlist.js";
import { applyFilters } from "./advanced-filters.js";

const errorBoundary = createErrorBoundary("Reports", "#reports-container");

export async function loadReports() {
  const container = document.getElementById("reports-container");
  if (!container) {
    return;
  }

  // BEST PRACTICE: Show skeleton loading
  container.innerHTML = "";
  showSkeletons(container, "card", 3);

  try {
    // BEST PRACTICE: Retry with exponential backoff
    const reportDirs = await retryWithBackoff(
      async () => {
        // BEST PRACTICE: Gestione errore 404 per manifest.json
        let manifestResponse;
        try {
          manifestResponse = await fetch(`/archivio/manifest.json?t=${Date.now()}`);
          if (!manifestResponse.ok) {
            console.warn("[Reports] manifest.json non trovato, uso fallback");
            return [];
          }
        } catch (error) {
          console.warn("[Reports] Errore caricamento manifest.json:", error);
          return [];
        }
        if (!manifestResponse.ok) {
          throw new Error("Errore nel caricamento del manifest");
        }
        const manifest = await manifestResponse.json();
        if (Array.isArray(manifest.reports)) {
          return manifest.reports.map((r) => (typeof r === "string" ? r : r.id)).filter(Boolean);
        } else if (Array.isArray(manifest.dirs)) {
          return manifest.dirs;
        }
        return [];
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        onRetry: (attempt) => {
          // eslint-disable-next-line no-console
          console.log(`[Reports] Retry ${attempt}...`);
        },
      }
    );

    // Hide skeleton
    hideSkeleton(container);

    if (reportDirs.length === 0) {
      container.innerHTML = `
        <div class="reports-empty">
          <svg class="reports-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <div class="reports-empty-title">Nessun report disponibile</div>
          <div class="reports-empty-text">I report verranno pubblicati qui quando disponibili.</div>
        </div>
      `;
      return;
    }

    // Carica header per ogni report
    const reports = [];
    for (const dir of reportDirs) {
      try {
        const headerResponse = await fetch(`/archivio/reports/${dir}/header.json?t=${Date.now()}`);
        if (headerResponse.ok) {
          const header = await headerResponse.json();
          reports.push({
            id: dir,
            ticker: header.ticker || header.asset || "",
            company: header.company || header.asset_name || "",
            date: header.date || header.timestamp || "",
            exchange: header.exchange || "",
            sector: header.sector || "",
          });
        }
      } catch (e) {
        console.warn(`[Reports] Errore caricamento ${dir}:`, e);
      }
    }

    // Ordina per data (più recenti prima)
    reports.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    // Store original reports for filtering
    const originalReports = [...reports];

    // Apply advanced filters if any
    let filteredReports = applyFilters(originalReports);
    if (!filteredReports || !Array.isArray(filteredReports)) {
      filteredReports = originalReports;
    }

    renderReports(filteredReports);
    setupSearch(filteredReports);
    updateStats(filteredReports);
    setupWatchlistButtons(filteredReports);

    // Listen for advanced filter events (store reports in closure)
    const filterHandler = () => {
      const filtered = applyFilters(originalReports);
      if (filtered && Array.isArray(filtered)) {
        renderReports(filtered);
        updateStats(filtered);
      }
    };
    document.addEventListener("advanced-filter-apply", filterHandler);
  } catch (err) {
    console.error("[Reports] Errore:", err);

    // BEST PRACTICE: Hide skeleton and show error state
    hideSkeleton(container);

    // BEST PRACTICE: Show error toast
    showToast("Errore nel caricamento dei report. Riprova più tardi.", "error");

    // BEST PRACTICE: Render error state with error boundary
    errorBoundary.renderErrorState(err, {
      retryable: true,
      onRetry: async () => {
        await loadReports();
      },
    });

    container.innerHTML = `
      <div class="reports-empty">
        <div class="reports-empty-title">Errore caricamento</div>
        <div class="reports-empty-text">Impossibile caricare i report. Riprova più tardi.</div>
      </div>
    `;
  }
}

function renderReports(reports) {
  const container = document.getElementById("reports-container");
  if (!container) {
    return;
  }

  if (reports.length === 0) {
    container.innerHTML = `
      <div class="reports-empty">
        <div class="reports-empty-title">Nessun report trovato</div>
        <div class="reports-empty-text">Prova a modificare i filtri di ricerca.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = reports
    .map(
      (report) => `
    <div class="report-card" data-report-id="${report.id}">
      <div class="report-card-header">
        <div class="report-card-main">
          <h3 class="report-ticker">${report.ticker || report.id}</h3>
          <p class="report-company">${report.company || "Nome non disponibile"}</p>
          <div class="report-meta">
            ${
              report.date
                ? `<div class="report-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              ${new Date(report.date).toLocaleDateString("it-IT")}
            </div>`
                : ""
            }
            ${
              report.exchange
                ? `<div class="report-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="2" x2="12" y2="22"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              ${report.exchange}
            </div>`
                : ""
            }
            ${
              report.sector
                ? `<div class="report-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              </svg>
              ${report.sector}
            </div>`
                : ""
            }
          </div>
        </div>
        <div class="report-card-actions">
          <button class="watchlist-button" data-report-id="${report.id}" data-favorite="${isInWatchlist(report.id) ? "true" : "false"}" aria-label="${isInWatchlist(report.id) ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}" title="${isInWatchlist(report.id) ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}">
            <svg viewBox="0 0 24 24" fill="${isInWatchlist(report.id) ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
          <a href="/report/index.html?slug=${report.id}" class="btn btn-primary" target="_blank">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Apri Report
          </a>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  // Salva report visualizzati per attività recente
  const recentReports = reports
    .slice(0, 5)
    .map((r) => ({ id: r.id, ticker: r.ticker, date: r.date }));
  localStorage.setItem("tradelia-recent-reports", JSON.stringify(recentReports));
}

function setupSearch(reports) {
  const searchInput = document.getElementById("reports-search");
  if (!searchInput) {
    return;
  }

  let filteredReports = [...reports];

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
      filteredReports = [...reports];
    } else {
      filteredReports = reports.filter((report) => {
        const searchable = [
          report.ticker,
          report.company,
          report.id,
          report.exchange,
          report.sector,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      });
    }

    renderReports(filteredReports);
    updateStats(filteredReports);
  });
}

function updateStats(reports) {
  const statsEl = document.getElementById("reports-stats");
  if (statsEl) {
    statsEl.textContent = `${reports.length} report${reports.length !== 1 ? "" : ""}`;
  }
}

function setupWatchlistButtons(reports) {
  document.querySelectorAll(".watchlist-button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const reportId = btn.dataset.reportId;
      const report = reports.find((r) => r.id === reportId);
      if (report) {
        import("./watchlist.js").then(({ toggleWatchlist }) => {
          const isFavorite = toggleWatchlist(report);
          btn.dataset.favorite = isFavorite ? "true" : "false";
          btn.setAttribute(
            "aria-label",
            isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"
          );
          const svg = btn.querySelector("svg");
          if (svg) {
            svg.setAttribute("fill", isFavorite ? "currentColor" : "none");
          }
          btn.style.color = isFavorite ? "var(--dash-accent)" : "";
        });
      }
    });
  });
}
