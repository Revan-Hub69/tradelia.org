/**
 * Dashboard Analytics Personali
 * Statistiche uso utente, trend, insights
 * Best Practice: Client-side analytics con localStorage
 */

export async function loadAnalytics() {
  const container = document.getElementById('analytics-container');
  if (!container) return;

  const analytics = calculateAnalytics();
  renderAnalytics(container, analytics);
}

function calculateAnalytics() {
  // Carica dati da localStorage
  const recentReports = JSON.parse(localStorage.getItem('tradelia-recent-reports') || '[]');
  const watchlist = JSON.parse(localStorage.getItem('dashboard-watchlist') || '[]');
  const searchHistory = JSON.parse(localStorage.getItem('dashboard-search-history') || '[]');

  // Calcola statistiche
  const totalReportsViewed = recentReports.length;
  const totalFavorites = watchlist.length;
  const totalSearches = searchHistory.length;

  // Report più visualizzati
  const reportCounts = {};
  recentReports.forEach((r) => {
    reportCounts[r.id] = (reportCounts[r.id] || 0) + 1;
  });
  const topReports = Object.entries(reportCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, count]) => {
      const report = recentReports.find((r) => r.id === id);
      return { ...report, views: count };
    });

  return {
    totalReportsViewed,
    totalFavorites,
    totalSearches,
    topReports,
  };
}

function renderAnalytics(container, analytics) {
  container.innerHTML = `
    <div class="analytics-grid">
      <div class="analytics-stat-card">
        <div class="analytics-stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="32" height="32">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div class="analytics-stat-content">
          <div class="analytics-stat-value">${analytics.totalReportsViewed}</div>
          <div class="analytics-stat-label">Report Visualizzati</div>
        </div>
      </div>

      <div class="analytics-stat-card">
        <div class="analytics-stat-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="32" height="32">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div class="analytics-stat-content">
          <div class="analytics-stat-value">${analytics.totalFavorites}</div>
          <div class="analytics-stat-label">Preferiti</div>
        </div>
      </div>

      <div class="analytics-stat-card">
        <div class="analytics-stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="32" height="32">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <div class="analytics-stat-content">
          <div class="analytics-stat-value">${analytics.totalSearches}</div>
          <div class="analytics-stat-label">Ricerche Effettuate</div>
        </div>
      </div>
    </div>

    ${analytics.topReports.length > 0 ? `
      <div class="analytics-section">
        <h3 class="analytics-section-title">Report Più Visualizzati</h3>
        <div class="analytics-list">
          ${analytics.topReports.map((report, index) => `
            <div class="analytics-item">
              <div class="analytics-item-rank">${index + 1}</div>
              <div class="analytics-item-content">
                <div class="analytics-item-title">${escapeHtml(report.ticker || report.id)}</div>
                <div class="analytics-item-meta">${report.views} visualizzazioni</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

