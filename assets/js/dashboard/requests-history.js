/**
 * Dashboard Module: Requests History
 * FASE 5: Contenuti e Funzionalità
 * Storico richieste analisi on-demand con integrazione Supabase
 */

import { initSupabase } from './supabase-client.js';

let allRequests = [];
let currentFilter = 'all';

export async function loadRequestsHistory() {
  const requestsList = document.getElementById('requests-list');
  if (!requestsList) return;

  // Setup filtri
  setupFilters();

  // Carica richieste
  await loadRequests();
}

function setupFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      currentFilter = filter;
      filterRequests(filter);
    });
  });
}

async function loadRequests() {
  const requestsList = document.getElementById('requests-list');
  if (!requestsList) return;

  // Mostra loading
  requestsList.innerHTML = `
    <div class="reports-loading">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      <span>Caricamento richieste...</span>
    </div>
  `;

  try {
    // Prova Supabase
    const supabase = await initSupabase();
    if (supabase) {
      // Recupera token da localStorage
      const token = localStorage.getItem('tradelia-access-token-v1');
      if (token) {
        // Query richieste utente (assumendo tabella 'analysis_requests')
        const { data, error } = await supabase
          .from('analysis_requests')
          .select('*')
          .eq('access_token', token)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        allRequests = data || [];
        renderRequests(allRequests);
        return;
      }
    }

    // Fallback: API endpoint
    const response = await fetch('/api/user/requests', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('tradelia-access-token-v1') || ''}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      allRequests = data.requests || [];
      renderRequests(allRequests);
    } else {
      throw new Error('Errore caricamento richieste');
    }
  } catch (err) {
    console.error('[Requests History] Errore:', err);
    requestsList.innerHTML = `
      <div class="reports-empty">
        <svg class="reports-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <div class="reports-empty-title">Nessuna richiesta</div>
        <div class="reports-empty-text">Le tue richieste di analisi appariranno qui.</div>
      </div>
    `;
  }
}

function filterRequests(filter) {
  currentFilter = filter;
  
  let filtered = [...allRequests];
  
  if (filter !== 'all') {
    filtered = allRequests.filter(req => {
      const status = req.status?.toLowerCase() || 'pending';
      return status === filter;
    });
  }

  renderRequests(filtered);
}

function renderRequests(requests) {
  const requestsList = document.getElementById('requests-list');
  if (!requestsList) return;

  if (requests.length === 0) {
    requestsList.innerHTML = `
      <div class="reports-empty">
        <svg class="reports-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <div class="reports-empty-title">Nessuna richiesta</div>
        <div class="reports-empty-text">Le tue richieste di analisi appariranno qui.</div>
      </div>
    `;
    return;
  }

  requestsList.innerHTML = requests.map(request => {
    const status = request.status?.toLowerCase() || 'pending';
    const statusLabels = {
      pending: 'In attesa',
      processing: 'In elaborazione',
      completed: 'Completata',
      failed: 'Fallita'
    };

    const statusColors = {
      pending: 'var(--warning)',
      processing: 'var(--info)',
      completed: 'var(--success)',
      failed: 'var(--error)'
    };

    const date = request.created_at 
      ? new Date(request.created_at).toLocaleDateString('it-IT', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Data non disponibile';

    return `
      <div class="report-card">
        <div class="report-card-header">
          <div class="report-card-main">
            <h3 class="report-ticker">
              ${request.ticker || request.asset || 'N/A'}
              <span class="report-badge" style="background: ${statusColors[status] || statusColors.pending}">
                ${statusLabels[status] || status}
              </span>
            </h3>
            <p class="report-company">${request.brief || request.description || 'Nessuna descrizione'}</p>
            <div class="report-meta">
              <div class="report-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                ${date}
              </div>
              ${request.id ? `
                <div class="report-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  ID: ${request.id}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
