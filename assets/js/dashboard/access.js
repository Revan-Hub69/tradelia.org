/**
 * Dashboard Module: Access
 * FASE 5: Contenuti e Funzionalità
 * Gestione accesso, token e permessi
 */

export async function loadAccess() {
  const container = document.getElementById("access-container");
  if (!container) {
    return;
  }

  // Carica info token
  const token = localStorage.getItem("tradelia-access-token-v1");

  if (token) {
    try {
      // Valida token e mostra info
      const response = await fetch("/api/user.js?action=validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        renderTokenInfo(data, container);
      } else {
        renderNoToken(container);
      }
    } catch (err) {
      console.error("[Access] Errore validazione token:", err);
      renderNoToken(container);
    }
  } else {
    renderNoToken(container);
  }
}

function renderTokenInfo(data, container) {
  const { email, planRole, validUntil, daysLeft, status } = data;

  const planLabels = {
    guest: "Guest",
    pro: "Pro",
    desk: "Desk",
    trial: "Trial",
  };

  const statusLabels = {
    active: "Attivo",
    inactive: "Inattivo",
    expired: "Scaduto",
  };

  container.innerHTML = `
    <div class="access-card">
      <div class="access-card-header">
        <h3 class="access-card-title">Token di Accesso</h3>
        <span class="access-badge" style="background: ${status === "active" ? "var(--success)" : "var(--warning)"}">
          ${statusLabels[status] || status}
        </span>
      </div>
      <div class="access-card-content">
        <div class="access-info-item">
          <div class="access-info-label">Email</div>
          <div class="access-info-value">${email || "N/A"}</div>
        </div>
        <div class="access-info-item">
          <div class="access-info-label">Piano</div>
          <div class="access-info-value">${planLabels[planRole] || planRole || "N/A"}</div>
        </div>
        <div class="access-info-item">
          <div class="access-info-label">Scadenza</div>
          <div class="access-info-value">${validUntil ? new Date(validUntil).toLocaleDateString("it-IT") : "N/A"}</div>
        </div>
        <div class="access-info-item">
          <div class="access-info-label">Giorni rimanenti</div>
          <div class="access-info-value">${daysLeft !== undefined ? `${daysLeft} giorni` : "N/A"}</div>
        </div>
      </div>
      <div class="access-card-actions">
        <a href="/accesso.html" class="btn btn-primary" target="_blank">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Gestisci Accesso
        </a>
      </div>
    </div>
  `;
}

function renderNoToken(container) {
  container.innerHTML = `
    <div class="reports-empty">
      <svg class="reports-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <div class="reports-empty-title">Nessun token attivo</div>
      <div class="reports-empty-text">Effettua l'accesso per ottenere un token di accesso.</div>
      <a href="/accesso.html" class="btn btn-primary" style="margin-top: var(--spacing-md);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        Vai a Accesso
      </a>
    </div>
  `;
}
