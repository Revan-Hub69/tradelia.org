/**
 * Dashboard Module: Settings
 * Impostazioni utente, preferenze, export dati
 */

export async function loadSettings() {
  // Carica preferenze salvate
  loadSavedPreferences();

  // Setup event listeners
  setupSettingsListeners();
}

function loadSavedPreferences() {
  // Carica da localStorage
  const density = localStorage.getItem('dashboard-density') || 'comfortable';
  const emailNotifications = localStorage.getItem('dashboard-email-notifications') === 'true';
  const systemNotifications = localStorage.getItem('dashboard-system-notifications') === 'true';

  const densitySelect = document.getElementById('setting-density');
  if (densitySelect) densitySelect.value = density;

  const emailToggle = document.getElementById('setting-email-notifications');
  if (emailToggle) emailToggle.checked = emailNotifications;

  const systemToggle = document.getElementById('setting-system-notifications');
  if (systemToggle) systemToggle.checked = systemNotifications;
}

function setupSettingsListeners() {
  // Densità contenuti
  const densitySelect = document.getElementById('setting-density');
  if (densitySelect) {
    densitySelect.addEventListener('change', (e) => {
      localStorage.setItem('dashboard-density', e.target.value);
      applyDensity(e.target.value);
    });
  }

  // Notifiche email
  const emailToggle = document.getElementById('setting-email-notifications');
  if (emailToggle) {
    emailToggle.addEventListener('change', (e) => {
      localStorage.setItem('dashboard-email-notifications', e.target.checked);
    });
  }

  // Notifiche sistema
  const systemToggle = document.getElementById('setting-system-notifications');
  if (systemToggle) {
    systemToggle.addEventListener('change', (e) => {
      localStorage.setItem('dashboard-system-notifications', e.target.checked);
    });
  }

  // Export dati
  const exportBtn = document.getElementById('btn-export-data');
  if (exportBtn) {
    exportBtn.addEventListener('click', handleExportData);
  }
}

function applyDensity(density) {
  document.body.setAttribute('data-density', density);
  // TODO: Applicare stili CSS per densità
}

async function handleExportData() {
  try {
    // Raccogli dati utente
    const exportData = {
      timestamp: new Date().toISOString(),
      preferences: {
        density: localStorage.getItem('dashboard-density') || 'comfortable',
        emailNotifications: localStorage.getItem('dashboard-email-notifications') === 'true',
        systemNotifications: localStorage.getItem('dashboard-system-notifications') === 'true'
      },
      recentReports: JSON.parse(localStorage.getItem('tradelia-recent-reports') || '[]'),
      accessToken: localStorage.getItem('tradelia-access-token-v1') ? '***' : null
    };

    // Crea file JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradelia-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Toast success
    if (window.showToast) {
      window.showToast('Dati esportati con successo', 'success');
    }
  } catch (err) {
    console.error('[Settings] Errore export:', err);
    if (window.showToast) {
      window.showToast('Errore durante l\'export dei dati', 'error');
    }
  }
}
