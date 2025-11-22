/**
 * Dashboard Widgets System
 * Widget personalizzabili per dashboard Overview
 * Best Practice: Separazione concerns - widgets separati da overview
 */

const WIDGETS_STATE = {
  availableWidgets: [
    { id: 'stats', name: 'Statistiche', enabled: true, size: 'large' },
    { id: 'recent-reports', name: 'Report Recenti', enabled: true, size: 'medium' },
    { id: 'favorites', name: 'Preferiti', enabled: true, size: 'medium' },
    { id: 'recent-activity', name: 'Attività Recente', enabled: true, size: 'medium' },
    { id: 'analytics', name: 'Analytics', enabled: false, size: 'small' },
  ],
  layout: 'grid', // grid | list
  columns: 2,
};

/**
 * Initialize dashboard widgets
 */
export function initDashboardWidgets() {
  loadWidgetPreferences();
  renderWidgetControls();
}

/**
 * Load widget preferences
 */
function loadWidgetPreferences() {
  try {
    const saved = localStorage.getItem('dashboard-widgets-preferences');
    if (saved) {
      const prefs = JSON.parse(saved);
      WIDGETS_STATE.availableWidgets = prefs.widgets || WIDGETS_STATE.availableWidgets;
      WIDGETS_STATE.layout = prefs.layout || WIDGETS_STATE.layout;
      WIDGETS_STATE.columns = prefs.columns || WIDGETS_STATE.columns;
    }
  } catch (e) {
    console.error('[DashboardWidgets] Errore caricamento preferenze:', e);
  }
}

/**
 * Save widget preferences
 */
function saveWidgetPreferences() {
  try {
    localStorage.setItem(
      'dashboard-widgets-preferences',
      JSON.stringify({
        widgets: WIDGETS_STATE.availableWidgets,
        layout: WIDGETS_STATE.layout,
        columns: WIDGETS_STATE.columns,
      })
    );
  } catch (e) {
    console.error('[DashboardWidgets] Errore salvataggio preferenze:', e);
  }
}

/**
 * Render widget controls in settings
 */
function renderWidgetControls() {
  const settingsContainer = document.querySelector('#panel-settings .panel-content');
  if (!settingsContainer || document.getElementById('widgets-settings-section')) return;

  const section = document.createElement('div');
  section.id = 'widgets-settings-section';
  section.className = 'settings-section';
  section.innerHTML = `
    <h3 class="settings-section-title">Personalizza Widget Dashboard</h3>
    <div class="widgets-settings-content">
      <div class="widgets-list">
        ${WIDGETS_STATE.availableWidgets
          .map(
            (widget) => `
          <div class="widget-setting-item">
            <label class="widget-setting-label">
              <input type="checkbox" class="widget-toggle" data-widget-id="${widget.id}" ${widget.enabled ? 'checked' : ''} />
              <span class="widget-setting-name">${escapeHtml(widget.name)}</span>
            </label>
            <select class="widget-size-select" data-widget-id="${widget.id}">
              <option value="small" ${widget.size === 'small' ? 'selected' : ''}>Piccolo</option>
              <option value="medium" ${widget.size === 'medium' ? 'selected' : ''}>Medio</option>
              <option value="large" ${widget.size === 'large' ? 'selected' : ''}>Grande</option>
            </select>
          </div>
        `
          )
          .join('')}
      </div>
      <div class="widgets-layout-settings">
        <div class="widgets-layout-group">
          <label class="widgets-layout-label">Layout</label>
          <select id="widgets-layout-select" class="widgets-layout-select">
            <option value="grid" ${WIDGETS_STATE.layout === 'grid' ? 'selected' : ''}>Griglia</option>
            <option value="list" ${WIDGETS_STATE.layout === 'list' ? 'selected' : ''}>Lista</option>
          </select>
        </div>
        ${WIDGETS_STATE.layout === 'grid' ? `
        <div class="widgets-layout-group">
          <label class="widgets-layout-label">Colonne</label>
          <select id="widgets-columns-select" class="widgets-layout-select">
            <option value="1" ${WIDGETS_STATE.columns === 1 ? 'selected' : ''}>1</option>
            <option value="2" ${WIDGETS_STATE.columns === 2 ? 'selected' : ''}>2</option>
            <option value="3" ${WIDGETS_STATE.columns === 3 ? 'selected' : ''}>3</option>
          </select>
        </div>
        ` : ''}
      </div>
      <button class="btn btn-primary" id="reset-widgets">Ripristina Predefiniti</button>
    </div>
  `;

  settingsContainer.appendChild(section);

  // Setup listeners
  setupWidgetControlsListeners();
}

/**
 * Setup widget controls listeners
 */
function setupWidgetControlsListeners() {
  // Widget toggles
  document.querySelectorAll('.widget-toggle').forEach((toggle) => {
    toggle.addEventListener('change', (e) => {
      const widgetId = e.target.dataset.widgetId;
      const widget = WIDGETS_STATE.availableWidgets.find((w) => w.id === widgetId);
      if (widget) {
        widget.enabled = e.target.checked;
        saveWidgetPreferences();
        applyWidgetPreferences();
      }
    });
  });

  // Widget size selects
  document.querySelectorAll('.widget-size-select').forEach((select) => {
    select.addEventListener('change', (e) => {
      const widgetId = e.target.dataset.widgetId;
      const widget = WIDGETS_STATE.availableWidgets.find((w) => w.id === widgetId);
      if (widget) {
        widget.size = e.target.value;
        saveWidgetPreferences();
        applyWidgetPreferences();
      }
    });
  });

  // Layout select
  const layoutSelect = document.getElementById('widgets-layout-select');
  if (layoutSelect) {
    layoutSelect.addEventListener('change', (e) => {
      WIDGETS_STATE.layout = e.target.value;
      saveWidgetPreferences();
      applyWidgetPreferences();
      renderWidgetControls(); // Re-render per mostrare/nascondere colonne
    });
  }

  // Columns select
  const columnsSelect = document.getElementById('widgets-columns-select');
  if (columnsSelect) {
    columnsSelect.addEventListener('change', (e) => {
      WIDGETS_STATE.columns = parseInt(e.target.value, 10);
      saveWidgetPreferences();
      applyWidgetPreferences();
    });
  }

  // Reset button
  const resetBtn = document.getElementById('reset-widgets');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Vuoi ripristinare i widget ai valori predefiniti?')) {
        resetWidgetPreferences();
      }
    });
  }
}

/**
 * Apply widget preferences to overview
 */
function applyWidgetPreferences() {
  const overviewContainer = document.getElementById('overview-container');
  if (!overviewContainer) return;

  // Apply layout class
  overviewContainer.className = `overview-container widgets-${WIDGETS_STATE.layout} widgets-columns-${WIDGETS_STATE.columns}`;

  // Show/hide widgets based on enabled state
  WIDGETS_STATE.availableWidgets.forEach((widget) => {
    const widgetEl = document.querySelector(`[data-widget-id="${widget.id}"]`);
    if (widgetEl) {
      widgetEl.style.display = widget.enabled ? '' : 'none';
      widgetEl.dataset.widgetSize = widget.size;
    }
  });
}

/**
 * Reset widget preferences
 */
function resetWidgetPreferences() {
  WIDGETS_STATE.availableWidgets = [
    { id: 'stats', name: 'Statistiche', enabled: true, size: 'large' },
    { id: 'recent-reports', name: 'Report Recenti', enabled: true, size: 'medium' },
    { id: 'favorites', name: 'Preferiti', enabled: true, size: 'medium' },
    { id: 'recent-activity', name: 'Attività Recente', enabled: true, size: 'medium' },
    { id: 'analytics', name: 'Analytics', enabled: false, size: 'small' },
  ];
  WIDGETS_STATE.layout = 'grid';
  WIDGETS_STATE.columns = 2;

  saveWidgetPreferences();
  renderWidgetControls();
  applyWidgetPreferences();

  if (window.showToast) {
    window.showToast('Widget ripristinati ai valori predefiniti', 'success');
  }
}

/**
 * Get widget preferences
 */
export function getWidgetPreferences() {
  return {
    widgets: [...WIDGETS_STATE.availableWidgets],
    layout: WIDGETS_STATE.layout,
    columns: WIDGETS_STATE.columns,
  };
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

