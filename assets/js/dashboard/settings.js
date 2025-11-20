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
  // TODO: Implementare export dati
  console.log('[Settings] Export data');
  alert('Funzionalità export in sviluppo');
}

