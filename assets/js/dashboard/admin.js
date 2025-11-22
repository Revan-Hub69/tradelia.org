/**
 * Dashboard Module: Admin
 * Sezione amministrazione (solo admin)
 */

import { isAdmin } from "./permissions.js";
import { getUserRole } from "./auth.js";

export async function loadAdmin() {
  const container = document.getElementById("admin-container");
  if (!container) {
    return;
  }

  // Verifica permessi admin
  const role = await getUserRole();

  if (!isAdmin(role)) {
    container.innerHTML = `
      <div class="reports-empty">
        <svg class="reports-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <div class="reports-empty-title">Accesso Negato</div>
        <div class="reports-empty-text">Questa sezione è riservata agli amministratori.</div>
      </div>
    `;
    return;
  }

  // Renderizza interfaccia admin
  container.innerHTML = `
    <div class="admin-dashboard">
      <div class="admin-grid">
        <!-- Users Management -->
        <a href="/admin/users.html" class="admin-card" target="_blank">
          <div class="admin-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div class="admin-card-content">
            <h3 class="admin-card-title">Gestione Utenti</h3>
            <p class="admin-card-description">Visualizza e gestisci utenti, ruoli e permessi</p>
          </div>
          <div class="admin-card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </a>

        <!-- Tokens Management -->
        <a href="/admin/tokens.html" class="admin-card" target="_blank">
          <div class="admin-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div class="admin-card-content">
            <h3 class="admin-card-title">Gestione Token</h3>
            <p class="admin-card-description">Crea e gestisci token di accesso dashboard</p>
          </div>
          <div class="admin-card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </a>

        <!-- Reports Management -->
        <a href="/admin/reports.html" class="admin-card" target="_blank">
          <div class="admin-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div class="admin-card-content">
            <h3 class="admin-card-title">Gestione Report</h3>
            <p class="admin-card-description">Carica e gestisci report pubblici</p>
          </div>
          <div class="admin-card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </a>

        <!-- Requests Management -->
        <a href="/admin/requests.html" class="admin-card" target="_blank">
          <div class="admin-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div class="admin-card-content">
            <h3 class="admin-card-title">Richieste Analisi</h3>
            <p class="admin-card-description">Visualizza e gestisci richieste on-demand</p>
          </div>
          <div class="admin-card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </a>

        <!-- Admin Portal -->
        <a href="/admin/index.html" class="admin-card admin-card-primary" target="_blank">
          <div class="admin-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
            </svg>
          </div>
          <div class="admin-card-content">
            <h3 class="admin-card-title">Portale Admin Completo</h3>
            <p class="admin-card-description">Apri il portale amministrativo completo</p>
          </div>
          <div class="admin-card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </a>
      </div>
    </div>
  `;
}
