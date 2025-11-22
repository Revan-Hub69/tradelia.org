/**
 * Dashboard Recent Activity / History
 * Storico navigazione recente e breadcrumb
 * Best Practice: Separazione concerns - history separato da navigazione
 */

const HISTORY_STATE = {
  items: [],
  maxItems: 50,
};

/**
 * Initialize recent activity
 */
export function initRecentActivity() {
  loadHistory();
  setupHistoryTracking();
}

/**
 * Load history from localStorage
 */
function loadHistory() {
  try {
    const saved = localStorage.getItem('dashboard-navigation-history');
    if (saved) {
      HISTORY_STATE.items = JSON.parse(saved);
    }
  } catch (e) {
    console.error('[RecentActivity] Errore caricamento history:', e);
    HISTORY_STATE.items = [];
  }
}

/**
 * Save history to localStorage
 */
function saveHistory() {
  try {
    localStorage.setItem('dashboard-navigation-history', JSON.stringify(HISTORY_STATE.items));
  } catch (e) {
    console.error('[RecentActivity] Errore salvataggio history:', e);
  }
}

/**
 * Setup history tracking
 */
function setupHistoryTracking() {
  // Track hash changes
  window.addEventListener('hashchange', () => {
    recordNavigation(window.location.hash);
  });

  // Track initial hash
  if (window.location.hash) {
    recordNavigation(window.location.hash);
  }

  // Track module clicks
  document.querySelectorAll('.module-card').forEach((card) => {
    card.addEventListener('click', () => {
      const moduleId = card.dataset.module;
      if (moduleId) {
        recordNavigation(`#${moduleId}`);
      }
    });
  });
}

/**
 * Record navigation event
 */
function recordNavigation(hash) {
  const moduleId = hash.replace('#', '');
  if (!moduleId) return;

  const moduleNames = {
    overview: 'Panoramica',
    reports: 'Report Ufficiali',
    settings: 'Impostazioni',
    education: 'Formazione',
    frameworks: 'Framework Documentation',
    'on-demand': 'Analisi On-Demand',
    'requests-history': 'Storico Richieste',
    community: 'Community Proposals',
    resources: 'Risorse',
    access: 'Accesso',
    notifications: 'Notifiche',
    brokers: 'Broker Regolamentati',
    admin: 'Amministrazione',
  };

  const item = {
    id: Date.now().toString(),
    moduleId,
    moduleName: moduleNames[moduleId] || moduleId,
    timestamp: new Date().toISOString(),
    url: hash,
  };

  // Remove duplicate if exists
  HISTORY_STATE.items = HISTORY_STATE.items.filter((i) => i.moduleId !== moduleId);

  // Add to front
  HISTORY_STATE.items.unshift(item);

  // Keep max items
  HISTORY_STATE.items = HISTORY_STATE.items.slice(0, HISTORY_STATE.maxItems);

  saveHistory();

  // Update UI if visible
  updateRecentActivityUI();
}

/**
 * Load recent activity content
 */
export async function loadRecentActivityContent() {
  const container = document.getElementById('recent-activity-container');
  if (!container) return;

  const items = HISTORY_STATE.items.slice(0, 10);

  if (items.length === 0) {
    container.innerHTML = `
      <div class="recent-activity-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="64" height="64">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <div class="recent-activity-empty-title">Nessuna attività recente</div>
        <div class="recent-activity-empty-text">Le tue navigazioni verranno registrate qui</div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="recent-activity-list">
      ${items
        .map((item) => {
          const timeAgo = getTimeAgo(new Date(item.timestamp));
          return `
        <div class="recent-activity-item" data-module-id="${item.moduleId}">
          <a href="${item.url}" class="recent-activity-link">
            <div class="recent-activity-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <div class="recent-activity-content">
              <div class="recent-activity-title">${escapeHtml(item.moduleName)}</div>
              <div class="recent-activity-meta">${timeAgo}</div>
            </div>
            <div class="recent-activity-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </a>
        </div>
      `;
        })
        .join('')}
    </div>
    <div class="recent-activity-footer">
      <button class="btn btn-secondary" id="clear-activity-history">Cancella Storico</button>
    </div>
  `;

  // Clear button
  const clearBtn = document.getElementById('clear-activity-history');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Vuoi cancellare tutto lo storico delle attività?')) {
        clearHistory();
      }
    });
  }
}

/**
 * Update recent activity UI
 */
function updateRecentActivityUI() {
  const container = document.getElementById('recent-activity-container');
  if (container && container.querySelector('.recent-activity-list')) {
    loadRecentActivityContent();
  }
}

/**
 * Get time ago string
 */
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Ora';
  } else if (diffMins < 60) {
    return `${diffMins} minuti fa`;
  } else if (diffHours < 24) {
    return `${diffHours} ore fa`;
  } else if (diffDays < 7) {
    return `${diffDays} giorni fa`;
  } else {
    return date.toLocaleDateString('it-IT');
  }
}

/**
 * Clear history
 */
function clearHistory() {
  HISTORY_STATE.items = [];
  saveHistory();
  loadRecentActivityContent();

  if (window.showToast) {
    window.showToast('Storico attività cancellato', 'success');
  }
}

/**
 * Get recent activity items
 */
/**
 * Get recent activity items
 */
export function getRecentActivity() {
  return [...HISTORY_STATE.items];
}

// Export for global use
window.getRecentActivity = getRecentActivity;

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

