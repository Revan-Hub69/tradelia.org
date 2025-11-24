/**
 * Dashboard Module: Community
 * FASE 5: Contenuti e Funzionalità
 * Community proposals e votazioni (solo Pro users)
 */

export async function loadCommunity() {
  const container = document.getElementById("community-container");
  if (!container) {
    return;
  }

  // Verifica token e ruolo
  const token = localStorage.getItem("tradelia-access-token-v1");

  if (!token) {
    container.innerHTML = `
      <div class="reports-empty">
        <svg class="reports-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <div class="reports-empty-title">Accesso richiesto</div>
        <div class="reports-empty-text">Effettua l'accesso per accedere alle community proposals.</div>
        <a href="/accesso.html" class="btn btn-primary" style="margin-top: var(--spacing-md);">
          Vai a Accesso
        </a>
      </div>
    `;
    return;
  }

  // Placeholder per ora
  container.innerHTML = `
    <div class="reports-empty">
      <svg class="reports-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
      <div class="reports-empty-title">Community Proposals</div>
      <div class="reports-empty-text">Le community proposals sono disponibili solo per utenti Pro. Questa sezione sarà disponibile a breve.</div>
      <p style="font-size: 13px; color: var(--dash-text-muted); margin-top: var(--spacing-md);">
        Secondo le specifiche, solo gli utenti Pro possono proporre e votare analisi della community.
      </p>
    </div>
  `;
}
