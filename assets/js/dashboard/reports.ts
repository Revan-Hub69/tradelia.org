/**
 * Reports Module - TypeScript
 * FASE 2: TypeScript Migration - Gradual
 */

import type { Report, DashboardState } from "../types/dashboard.d.ts";

// Global state (will be injected from dashboard.html)
declare const STATE: DashboardState;

/**
 * Load reports from manifest
 */
export async function loadReports(): Promise<void> {
  const container = document.getElementById("reports-container");
  if (!container) return;

  try {
    container.innerHTML = `
      <div class="reports-loading">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <span>Caricamento report...</span>
      </div>
    `;

    let reportDirs: string[] = [];
    try {
      const manifestResponse = await fetch(`/archivio/manifest.json?t=${Date.now()}`, {
        cache: "no-cache",
      });
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        if (Array.isArray(manifest.reports)) {
          reportDirs = manifest.reports
            .map((r: string | { id: string }) => (typeof r === "string" ? r : r.id))
            .filter(Boolean);
        } else if (Array.isArray(manifest.dirs)) {
          reportDirs = manifest.dirs;
        }
      }
    } catch (e) {
      reportDirs = ["20251107-1630", "sample-id"];
    }

    const reports: Report[] = [];
    for (const reportID of reportDirs) {
      try {
        const headerResponse = await fetch(`/report/reports/${reportID}/header.json`);
        if (!headerResponse.ok) continue;

        const header = await headerResponse.json();
        let ticker: string | null = null;
        let companyName: string | null = null;

        if (header?.rows) {
          const companyRow = header.rows.find((r: { id: string }) => r.id === "company-line");
          if (companyRow?.parts) {
            const tickerPart = companyRow.parts.find((p: { key: string }) => p.key === "Ticker");
            const companyPart = companyRow.parts.find(
              (p: { key: string }) => p.key === "CompanyName"
            );
            if (tickerPart) ticker = tickerPart.value;
            if (companyPart) companyName = companyPart.value;
          }
        }

        if (!ticker && header?.Ticker) ticker = header.Ticker;
        if (!companyName && header?.CompanyName) companyName = header.CompanyName;

        reports.push({
          id: reportID,
          ticker: ticker || "N/A",
          company: companyName || null,
          timestamp: reportID,
          reportUrl: `/report/index.html?id=${reportID}`,
        });
      } catch (e) {
        console.warn(`Errore caricamento report ${reportID}:`, e);
      }
    }

    STATE.reports = reports;
    STATE.filteredReports = [...reports];

    renderReports();
    showToast(`${reports.length} report caricati`, "success", 2000);
  } catch (err) {
    console.error("Errore caricamento report:", err);
    container.innerHTML = `
      <div class="reports-empty">
        <svg class="reports-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div class="reports-empty-title">Errore caricamento report</div>
        <div class="reports-empty-text">Si è verificato un errore durante il caricamento. Riprova più tardi.</div>
        <button class="btn btn-primary" onclick="location.reload()" style="margin-top: var(--spacing-md);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Riprova
        </button>
      </div>
    `;
    showToast("Errore nel caricamento dei report", "error", 5000);
  }
}

/**
 * Render reports list
 */
export function renderReports(): void {
  const container = document.getElementById("reports-container");
  const statsEl = document.getElementById("reports-stats");
  if (!container) return;

  // Update stats
  if (statsEl) {
    const total = STATE.reports.length;
    const filtered = STATE.filteredReports.length;
    if (filtered === total) {
      statsEl.textContent = `${total} report disponibili`;
    } else {
      statsEl.textContent = `${filtered} di ${total} report`;
    }
  }

  if (STATE.filteredReports.length === 0) {
    container.innerHTML = `
      <div class="reports-empty">
        <svg class="reports-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <div class="reports-empty-title">Nessun report trovato</div>
        <div class="reports-empty-text">Prova a modificare i criteri di ricerca</div>
      </div>
    `;
    return;
  }

  const html = STATE.filteredReports.map((report: Report) => {
    const date = new Date(report.timestamp);
    const formattedDate = isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("it-IT", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

    // Extract report type from ID if possible
    const reportType = report.id.includes("SRD")
      ? "SRD"
      : report.id.includes("MTB")
        ? "MTB"
        : "Report";

    return `
      <div class="report-card">
        <div class="report-card-header">
          <div class="report-card-main">
            <h3 class="report-ticker">
              ${report.ticker}
              <span class="report-badge">${reportType}</span>
            </h3>
            ${report.company ? `<div class="report-company">${report.company}</div>` : ""}
            <div class="report-meta">
              <div class="report-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>${formattedDate}</span>
              </div>
              <div class="report-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>ID: ${report.id}</span>
              </div>
            </div>
          </div>
          <div class="report-card-actions">
            <a href="${report.reportUrl}" target="_blank" class="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Visualizza
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = html;
}

// Toast function (global, defined in dashboard.html)
declare function showToast(
  message: string,
  variant: "success" | "error" | "info" | "warning",
  duration?: number
): void;
