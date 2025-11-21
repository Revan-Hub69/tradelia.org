/**
 * Dashboard Module: Education
 * FASE 5: Contenuti e Funzionalità
 * Percorsi formativi (placeholder - da implementare dopo)
 */

export async function loadEducation() {
  const container = document.getElementById('education-container');
  if (!container) return;

  // Placeholder per ora (da implementare dopo)
  container.innerHTML = `
    <div class="reports-empty">
      <svg class="reports-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
      <div class="reports-empty-title">Percorsi Formativi</div>
      <div class="reports-empty-text">I percorsi formativi saranno disponibili a breve.</div>
      <p style="font-size: 13px; color: var(--dash-text-muted); margin-top: var(--spacing-md);">
        Questa sezione conterrà percorsi formativi organizzati con progress tracking e certificati.
      </p>
      <a href="/tutorials.html" class="btn btn-primary" style="margin-top: var(--spacing-md);" target="_blank">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        Vai ai Tutorial
      </a>
    </div>
  `;
}

