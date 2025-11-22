/**
 * Dashboard Export Manager
 * Gestione centralizzata export report e download
 * Best Practice: Client-side export con localStorage tracking
 */

export async function loadExportManager() {
  const container = document.getElementById('export-manager-container');
  if (!container) return;

  const exportHistory = loadExportHistory();
  renderExportManager(container, exportHistory);
}

function loadExportHistory() {
  try {
    return JSON.parse(localStorage.getItem('dashboard-export-history') || '[]');
  } catch (e) {
    return [];
  }
}

function saveExportHistory(history) {
  try {
    localStorage.setItem('dashboard-export-history', JSON.stringify(history));
  } catch (e) {
    console.error('[ExportManager] Errore salvataggio history:', e);
  }
}

function renderExportManager(container, history) {
  if (history.length === 0) {
    container.innerHTML = `
      <div class="export-manager-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="64" height="64">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <div class="export-manager-empty-title">Nessun export effettuato</div>
        <div class="export-manager-empty-text">Gli export verranno visualizzati qui</div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="export-history-list">
      ${history.slice(0, 20).map((item) => `
        <div class="export-history-item">
          <div class="export-history-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div class="export-history-content">
            <div class="export-history-title">${escapeHtml(item.name || 'Export')}</div>
            <div class="export-history-meta">${new Date(item.timestamp).toLocaleString('it-IT')}</div>
          </div>
          <div class="export-history-actions">
            <button class="export-history-download" data-url="${item.url || ''}" aria-label="Scarica di nuovo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Add download listeners
  container.querySelectorAll('.export-history-download').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.url;
      if (url) {
        window.open(url, '_blank');
      }
    });
  });
}

/**
 * Record export in history
 */
export function recordExport(name, url) {
  const history = loadExportHistory();
  history.unshift({
    name,
    url,
    timestamp: new Date().toISOString(),
  });
  saveExportHistory(history.slice(0, 50)); // Keep last 50
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

