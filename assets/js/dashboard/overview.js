/**
 * Dashboard Module: Overview
 * Panoramica dashboard con statistiche, attività recente e quick actions
 */

export async function loadOverview() {
  // Carica statistiche
  try {
    const reports = await loadReportsData();
    if (reports && reports.length > 0) {
      const totalEl = document.getElementById('stat-total-reports');
      if (totalEl) totalEl.textContent = reports.length;
      
      const lastUpdateEl = document.getElementById('stat-last-update');
      if (lastUpdateEl && reports[0].date) {
        lastUpdateEl.textContent = new Date(reports[0].date).toLocaleDateString('it-IT');
      }
    }
  } catch (e) {
    console.error('[Overview] Errore caricamento statistiche:', e);
  }
  
  // Carica attività recente
  loadRecentActivity();
}

function loadRecentActivity() {
  const activityList = document.getElementById('recent-activity');
  if (!activityList) return;
  
  const recentReports = JSON.parse(localStorage.getItem('tradelia-recent-reports') || '[]');
  
  if (recentReports.length > 0) {
    activityList.innerHTML = recentReports.slice(0, 5).map(report => `
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
          <div class="activity-time">${report.date ? new Date(report.date).toLocaleDateString('it-IT') : 'Data non disponibile'}</div>
        </div>
      </div>
    `).join('');
  }
}

async function loadReportsData() {
  try {
    const response = await fetch('/archivio/manifest.json');
    if (response.ok) {
      const data = await response.json();
      return data.reports || [];
    }
  } catch (e) {
    console.error('[Overview] Errore caricamento report:', e);
  }
  return [];
}

