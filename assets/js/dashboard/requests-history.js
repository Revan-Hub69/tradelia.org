/**
 * Dashboard Module: Requests History
 * Storico richieste analisi on-demand
 */

export async function loadRequestsHistory() {
  const requestsList = document.getElementById('requests-list');
  if (!requestsList) return;

  // Setup filtri
  setupFilters();

  // TODO: Caricare richieste da API/Supabase
  // Per ora mostra empty state
  loadRequests();
}

function setupFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      filterRequests(filter);
    });
  });
}

async function loadRequests() {
  // TODO: Fetch da API
  // const response = await fetch('/api/user/requests');
  // const requests = await response.json();
  // renderRequests(requests);
}

function filterRequests(filter) {
  // TODO: Filtrare richieste per stato
  console.log('[Requests History] Filter:', filter);
}

function renderRequests(requests) {
  const requestsList = document.getElementById('requests-list');
  if (!requestsList) return;

  if (requests.length === 0) {
    // Mostra empty state (già presente in HTML)
    return;
  }

  // TODO: Render lista richieste
}
