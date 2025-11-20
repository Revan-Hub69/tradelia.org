/**
 * Dashboard Module: Reports
 * Lista report ufficiali con ricerca e filtri
 * (Logica esistente, qui per modularità)
 */

export async function loadReports() {
  const container = document.getElementById('reports-container');
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
    
    let reportDirs = [];
    try {
      const manifestResponse = await fetch(`/archivio/manifest.json?t=${Date.now()}`);
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        if (Array.isArray(manifest.reports)) {
          reportDirs = manifest.reports.map(r => typeof r === 'string' ? r : r.id).filter(Boolean);
        } else if (Array.isArray(manifest.dirs)) {
          reportDirs = manifest.dirs;
        }
      }
    } catch (e) {
      console.error('[Reports] Errore caricamento manifest:', e);
    }
    
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
            ticker: header.ticker || header.asset || '',
            company: header.company || header.asset_name || '',
            date: header.date || header.timestamp || '',
            exchange: header.exchange || '',
            sector: header.sector || ''
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
    
    renderReports(reports);
    setupSearch(reports);
    updateStats(reports);
    
  } catch (err) {
    console.error('[Reports] Errore:', err);
    container.innerHTML = `
      <div class="reports-empty">
        <div class="reports-empty-title">Errore caricamento</div>
        <div class="reports-empty-text">Impossibile caricare i report. Riprova più tardi.</div>
      </div>
    `;
  }
}

function renderReports(reports) {
  const container = document.getElementById('reports-container');
  if (!container) return;
  
  if (reports.length === 0) {
    container.innerHTML = `
      <div class="reports-empty">
        <div class="reports-empty-title">Nessun report trovato</div>
        <div class="reports-empty-text">Prova a modificare i filtri di ricerca.</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = reports.map(report => `
    <div class="report-card" data-report-id="${report.id}">
      <div class="report-card-header">
        <div class="report-card-main">
          <h3 class="report-ticker">${report.ticker || report.id}</h3>
          <p class="report-company">${report.company || 'Nome non disponibile'}</p>
          <div class="report-meta">
            ${report.date ? `<div class="report-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              ${new Date(report.date).toLocaleDateString('it-IT')}
            </div>` : ''}
            ${report.exchange ? `<div class="report-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="2" x2="12" y2="22"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              ${report.exchange}
            </div>` : ''}
            ${report.sector ? `<div class="report-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              </svg>
              ${report.sector}
            </div>` : ''}
          </div>
        </div>
        <div class="report-card-actions">
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
  `).join('');
  
  // Salva report visualizzati per attività recente
  const recentReports = reports.slice(0, 5).map(r => ({ id: r.id, ticker: r.ticker, date: r.date }));
  localStorage.setItem('tradelia-recent-reports', JSON.stringify(recentReports));
}

function setupSearch(reports) {
  const searchInput = document.getElementById('reports-search');
  if (!searchInput) return;
  
  let filteredReports = [...reports];
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
      filteredReports = [...reports];
    } else {
      filteredReports = reports.filter(report => {
        const searchable = [
          report.ticker,
          report.company,
          report.id,
          report.exchange,
          report.sector
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchable.includes(query);
      });
    }
    
    renderReports(filteredReports);
    updateStats(filteredReports);
  });
}

function updateStats(reports) {
  const statsEl = document.getElementById('reports-stats');
  if (statsEl) {
    statsEl.textContent = `${reports.length} report${reports.length !== 1 ? '' : ''}`;
  }
}

