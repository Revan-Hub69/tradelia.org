import Logger from '/report/assets/js/utils/logger.js';
import './admin-complete.js';

const ACCESS_TOKEN_KEY = 'tradelia-access-token-v1';

const ADMIN_STATS = {
  totalUsers: document.getElementById('stat-total-users'),
  activePlans: document.getElementById('stat-active-plans'),
  expiredPlans: document.getElementById('stat-expired-plans'),
  totalCredits: document.getElementById('stat-total-credits')
};

const FILTER_SEARCH = document.getElementById('filter-search');
const FILTER_ROLE = document.getElementById('filter-role');
const FILTER_STATUS = document.getElementById('filter-status');
const USERS_TABLE_BODY = document.getElementById('users-table-body');

// Modale pagamenti manuali (Xolo / altri)
const PAYMENTS_MODAL = document.getElementById('manage-payments-modal');
const PAYMENTS_USER_ID = document.getElementById('payments-user-id');
const PAYMENTS_USER_EMAIL = document.getElementById('payments-user-email');
const PAYMENTS_AMOUNT = document.getElementById('payments-amount');
const PAYMENTS_STATUS = document.getElementById('payments-status');
const PAYMENTS_INVOICE_NUMBER = document.getElementById('payments-invoice-number');
const PAYMENTS_PDF_URL = document.getElementById('payments-pdf-url');
const PAYMENTS_DESCRIPTION = document.getElementById('payments-description');
const PAYMENTS_CANCEL_BTN = document.getElementById('cancel-payments-btn');
const PAYMENTS_SAVE_BTN = document.getElementById('save-payments-btn');

let allUsers = [];
let latestStats = null;
let currentUser = null;
let adminToken = null;

const setAllUsers = (users) => {
  allUsers = users;
  if (typeof window !== 'undefined') {
    window.allUsers = allUsers;
  }
};

const computeStatsFromUsers = (users = []) => {
  const totalUsers = users.length;
  const activePlans = users.filter((u) => u.role && !u.isExpired).length;
  const expiredPlans = users.filter((u) => u.role && u.isExpired).length;
  const totalCredits = users.reduce((sum, u) => sum + (u.credits || 0), 0);
  return { totalUsers, activePlans, expiredPlans, totalCredits };
};

const updateStatsDisplay = () => {
  const stats = latestStats || computeStatsFromUsers(allUsers);
  if (ADMIN_STATS.totalUsers) ADMIN_STATS.totalUsers.textContent = stats.totalUsers;
  if (ADMIN_STATS.activePlans) ADMIN_STATS.activePlans.textContent = stats.activePlans;
  if (ADMIN_STATS.expiredPlans) ADMIN_STATS.expiredPlans.textContent = stats.expiredPlans;
  if (ADMIN_STATS.totalCredits) ADMIN_STATS.totalCredits.textContent = stats.totalCredits;
};

const callAdminAPI = async (path, { method = 'GET', body, timeout = 15000 } = {}) => {
  if (!adminToken) {
    throw new Error('Token amministratore non disponibile');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const headers = { 'X-Admin-Token': adminToken };
    let payload = body;
    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }

    const response = await fetch(path, {
      method,
      headers,
      body: payload,
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      throw new Error(data.error || `Richiesta ${method} ${path} fallita`);
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
};

if (typeof window !== 'undefined') {
  window.adminApiCall = (path, options) => callAdminAPI(path, options);
}

init();

async function init() {
  try {
    let token = null;
    try {
      token = localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (e) {
      token = null;
    }

    if (!token || !token.trim()) {
      window.location.href = '/accesso.html?reason=missing_token';
      return;
    }

    const res = await fetch('/api/validate-dashboard-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.trim() })
    });

    const data = await res.json();

    if (!data.ok || !data.isAdmin) {
      window.location.href = '/accesso.html?reason=invalid_token';
      return;
    }

    adminToken = token.trim();
    currentUser = {
      id: data.userId || null,
      email: data.email
    };

    // Setup filters
    FILTER_SEARCH?.addEventListener('input', debounce(applyFilters, 300));
    FILTER_ROLE?.addEventListener('change', applyFilters);
    FILTER_STATUS?.addEventListener('change', applyFilters);

    // Forza chiusura modali
    const modals = ['edit-user-modal', 'manage-credits-modal', 'manage-payments-modal', 'add-user-modal'];
    const forceCloseModals = () => {
      modals.forEach((modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.hidden = true;
          modal.setAttribute('hidden', 'true');
          modal.style.display = 'none';
          modal.style.visibility = 'hidden';
          modal.classList.remove('active', 'open', 'show');
          modal.setAttribute('aria-hidden', 'true');
        }
      });
    };

    forceCloseModals();
    [50, 100, 200, 500, 1000].forEach((delay) => setTimeout(forceCloseModals, delay));

    const modalObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'hidden') {
          const modal = mutation.target;
          if (!modal.hidden && !modal.dataset.userOpened) {
            console.log('[Admin] Modale aperto automaticamente, chiudo:', modal.id);
            forceCloseModals();
          }
        }
      });
    });

    modals.forEach((modalId) => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modalObserver.observe(modal, { attributes: true, attributeFilter: ['hidden'] });
      }
    });

    const originalManagePayments = window.managePayments;
    window.managePayments = function (...args) {
      const modal = document.getElementById('manage-payments-modal');
      if (modal) {
        modal.dataset.userOpened = 'true';
        setTimeout(() => delete modal.dataset.userOpened, 100);
      }
      if (originalManagePayments) {
        return originalManagePayments.apply(this, args);
      }
    };

    const addUserBtn = document.getElementById('add-user-btn');
    const addUserModal = document.getElementById('add-user-modal');
    const cancelAddUserBtn = document.getElementById('cancel-add-user-btn');
    const saveAddUserBtn = document.getElementById('save-add-user-btn');

    if (addUserBtn && addUserModal) {
      addUserBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        forceCloseModals();
        addUserModal.dataset.userOpened = 'true';
        addUserModal.hidden = false;
        addUserModal.style.display = 'flex';
        addUserModal.style.visibility = 'visible';
        setTimeout(() => delete addUserModal.dataset.userOpened, 100);

        const emailInput = document.getElementById('add-user-email');
        const nameInput = document.getElementById('add-user-name');
        const roleInput = document.getElementById('add-user-role');
        const expiryInput = document.getElementById('add-user-expiry');
        const creditsInput = document.getElementById('add-user-credits');

        if (emailInput) emailInput.value = '';
        if (nameInput) nameInput.value = '';
        if (roleInput) roleInput.value = 'trial';
        if (expiryInput) expiryInput.value = '';
        if (creditsInput) creditsInput.value = '0';
      });
    }

    if (cancelAddUserBtn && addUserModal) {
      cancelAddUserBtn.addEventListener('click', () => {
        addUserModal.hidden = true;
        addUserModal.style.display = 'none';
      });
    }

    if (saveAddUserBtn) {
      saveAddUserBtn.addEventListener('click', async () => {
        const email = document.getElementById('add-user-email')?.value?.trim();
        const name = document.getElementById('add-user-name')?.value?.trim();
        const role = document.getElementById('add-user-role')?.value;
        const expiry = document.getElementById('add-user-expiry')?.value;
        const credits = parseInt(document.getElementById('add-user-credits')?.value || '0', 10);

        if (!email || !role || !expiry) {
          alert('Compila tutti i campi obbligatori (Email, Ruolo, Scadenza).');
          return;
        }

        try {
          saveAddUserBtn.disabled = true;
          saveAddUserBtn.textContent = 'Creazione...';

          const res = await fetch('/api/create-user-and-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email.toLowerCase(),
              displayName: name || null,
              role,
              validUntil: expiry,
              credits: role === 'institutional' ? credits : 0,
              sendEmail: true
            })
          });

          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await res.text();
            throw new Error(
              `Il server ha restituito una risposta non valida (${res.status}). Dettagli: ${text.slice(0, 120)}`
            );
          }

          const payload = await res.json();
          if (!payload.ok) {
            throw new Error(payload.error || 'Errore nella creazione utente');
          }

          const tokenMessage = payload.token
            ? `\nToken: ${payload.token}\n\nIMPORTANTE: Salva questo token, non verrà mostrato di nuovo!`
            : '\nIl token è stato inviato via email.';

          alert(
            `✅ Utente creato con successo!\n\nEmail: ${email}\nRuolo: ${role}\nScadenza: ${new Date(
              expiry
            ).toLocaleDateString('it-IT')}${tokenMessage}`
          );

          addUserModal.hidden = true;
          addUserModal.style.display = 'none';
          await loadAllData();
        } catch (err) {
          Logger.error('Admin', 'Errore creazione utente', err);
          alert(err.message || 'Errore nella creazione utente.');
        } finally {
          saveAddUserBtn.disabled = false;
          saveAddUserBtn.textContent = 'Crea Utente';
        }
      });
    }

    if (typeof window !== 'undefined') {
      window.loadAllData = loadAllData;
    }

    await loadAllData();
  } catch (err) {
    Logger.error('Admin', 'init error', err);
    showError('Errore durante l\'inizializzazione della dashboard admin: ' + (err.message || 'Errore sconosciuto'));
  }
}

async function loadAllData() {
  try {
    await loadUsers();
    updateStatsDisplay();
    applyFilters();
  } catch (err) {
    Logger.error('Admin', 'load data error', err);
    showError('Errore durante il caricamento dei dati.');
  }
}

async function loadUsers() {
  try {
    if (USERS_TABLE_BODY) {
      USERS_TABLE_BODY.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--ink-soft);">
            Caricamento utenti...
          </td>
        </tr>
      `;
    }
    const response = await callAdminAPI('/api/admin/users');
    setAllUsers(response.users || []);
    latestStats = response.stats || computeStatsFromUsers(allUsers);
  } catch (err) {
    Logger.error('Admin', 'load users error', err);
    if (USERS_TABLE_BODY) {
      USERS_TABLE_BODY.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--ink-soft);">
            <div style="color: var(--danger, #f87171); margin-bottom: 0.5rem;">⚠️ Errore caricamento utenti</div>
            <div>${escapeHtml(err.message || 'Errore sconosciuto')}</div>
            <button class="btn btn-sm" onclick="location.reload()" style="margin-top: 1rem;">Ricarica pagina</button>
          </td>
        </tr>
      `;
    }
    throw err;
  }
}

function applyFilters() {
  const searchTerm = FILTER_SEARCH?.value.toLowerCase() || '';
  const roleFilter = FILTER_ROLE?.value || '';
  const statusFilter = FILTER_STATUS?.value || '';
  
  let filtered = allUsers;
  
  if (searchTerm) {
    filtered = filtered.filter(u => 
      (u.email && u.email.toLowerCase().includes(searchTerm)) ||
      (u.display_name && u.display_name.toLowerCase().includes(searchTerm))
    );
  }
  
  if (roleFilter) {
    filtered = filtered.filter(u => u.role === roleFilter);
  }
  
  if (statusFilter === 'active') {
    filtered = filtered.filter(u => u.role && !u.isExpired);
  } else if (statusFilter === 'expired') {
    filtered = filtered.filter(u => u.isExpired);
  }
  
  renderUsersTable(filtered);
}

function renderUsersTable(users) {
  if (!USERS_TABLE_BODY) return;
  
  if (users.length === 0) {
    USERS_TABLE_BODY.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: var(--ink-soft);">
          Nessun utente trovato
        </td>
      </tr>
    `;
    return;
  }
  
  USERS_TABLE_BODY.innerHTML = users.map(user => {
    const roleBadge = user.role 
      ? `<span class="role-badge ${user.isExpired ? 'expired' : user.role}">${user.isExpired ? 'Scaduto' : user.role}</span>`
      : '<span style="color: var(--ink-soft);">—</span>';
    
    const expiresText = user.valid_until
      ? new Date(user.valid_until).toLocaleDateString('it-IT')
      : 'Permanente';
    
    // Usa user_id se disponibile, altrimenti email come identificatore
    const identifier = user.user_id || user.email;
    const identifierType = user.user_id ? 'user_id' : 'email';
    
    return `
      <tr>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(user.display_name)}</td>
        <td>${roleBadge}</td>
        <td>${expiresText}</td>
        <td>${user.credits || 0}</td>
        <td>
          <div class="admin-actions">
            <button class="btn btn-outline btn-sm" onclick="editUser('${identifier}', '${identifierType}')">Modifica</button>
            ${user.user_id ? `<button class="btn btn-outline btn-sm" onclick="manageCredits('${identifier}', '${identifierType}')">Crediti</button>` : ''}
            ${user.user_id ? `<button class="btn btn-outline btn-sm" onclick="managePayments('${identifier}', '${identifierType}')">Pagamenti</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showError(message) {
  console.error('[Admin]', message);
  // Mostra errore nella tabella se disponibile
  if (USERS_TABLE_BODY) {
    USERS_TABLE_BODY.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: var(--ink-soft);">
          <div style="color: var(--danger, #f87171); margin-bottom: 0.5rem;">⚠️ Errore</div>
          <div>${escapeHtml(message)}</div>
          <button class="btn btn-sm" onclick="location.reload()" style="margin-top: 1rem;">Ricarica pagina</button>
        </td>
      </tr>
    `;
  } else {
    alert(message);
  }
}

// Global functions per onclick handlers (ora gestite da admin-complete.js)
window.editUser = window.openEditUserModal || function(identifier, type = 'user_id') {
  if (type === 'email') {
    const user = allUsers.find(u => u.email === identifier);
    if (user && window.openEditUserModal) {
      window.openEditUserModal(user.user_id || user.email, type);
    } else {
      alert(`Modifica utente ${identifier} - Funzionalità in caricamento...`);
    }
  } else {
    if (window.openEditUserModal) {
      window.openEditUserModal(identifier, type);
    } else {
      alert(`Modifica utente ${identifier} - Funzionalità in caricamento...`);
    }
  }
};

window.manageCredits = window.openManageCreditsModal || function(identifier, type = 'user_id') {
  if (type === 'email') {
    alert('Gestione crediti disponibile solo per utenti con user_id.');
    return;
  }
  if (window.openManageCreditsModal) {
    window.openManageCreditsModal(identifier, type);
  } else {
    alert(`Gestisci crediti per ${identifier} - Funzionalità in caricamento...`);
  }
};

// Gestione pagamenti manuali (Xolo)
window.managePayments = window.openManagePaymentsModal || function(identifier, type = 'user_id') {
  if (type === 'email') {
    alert('Gestione pagamenti disponibile solo per utenti con user_id.');
    return;
  }
  
  const user = allUsers.find(u => u.user_id === identifier);
  if (!user || !PAYMENTS_MODAL) {
    alert('Utente non trovato o modale non disponibile.');
    return;
  }
  
  PAYMENTS_USER_ID.value = user.user_id;
  PAYMENTS_USER_EMAIL.value = user.email || '';
  PAYMENTS_AMOUNT.value = '';
  PAYMENTS_STATUS.value = 'succeeded';
  PAYMENTS_INVOICE_NUMBER.value = '';
  PAYMENTS_PDF_URL.value = '';
  PAYMENTS_DESCRIPTION.value = '';
  
  PAYMENTS_MODAL.hidden = false;
};

if (PAYMENTS_CANCEL_BTN && PAYMENTS_MODAL) {
  PAYMENTS_CANCEL_BTN.addEventListener('click', () => {
    PAYMENTS_MODAL.hidden = true;
  });
}

if (PAYMENTS_SAVE_BTN && PAYMENTS_MODAL) {
  PAYMENTS_SAVE_BTN.addEventListener('click', async () => {
    const userId = PAYMENTS_USER_ID.value;
    const amountStr = PAYMENTS_AMOUNT.value;
    const status = PAYMENTS_STATUS.value || 'succeeded';
    const invoiceNumber = PAYMENTS_INVOICE_NUMBER.value.trim() || null;
    const pdfUrl = PAYMENTS_PDF_URL.value.trim() || null;
    const description = PAYMENTS_DESCRIPTION.value.trim() || null;
    
    const amount = parseFloat(amountStr);
    if (!userId || isNaN(amount) || amount <= 0) {
      alert('Inserisci un importo valido (maggiore di zero).');
      return;
    }
    
    try {
      const user = allUsers.find(u => u.user_id === userId);
      if (!user) {
        alert('Utente non trovato.');
        return;
      }

      PAYMENTS_SAVE_BTN.disabled = true;
      PAYMENTS_SAVE_BTN.textContent = 'Salvataggio...';

      await callAdminAPI('/api/admin/payments', {
        method: 'POST',
        body: {
          userId,
          email: user.email,
          amount,
          currency: 'EUR',
          status,
          invoiceNumber,
          pdfUrl,
          description,
          planRole: 'institutional',
          plan: 'desk_manual',
          months: 1,
          gateway: 'manual'
        }
      });

      if (status === 'succeeded') {
        try {
          await fetch('/api/request-dashboard-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, force: true })
          });
        } catch (tokenError) {
          console.warn('Admin', 'Errore generazione token (non bloccante)', tokenError);
        }
      }

      alert('Pagamento registrato correttamente.');
      PAYMENTS_MODAL.hidden = true;
      await loadAllData();
    } catch (err) {
      console.error('Admin', 'Errore salvataggio pagamento manuale', err);
      alert(err.message || 'Errore imprevisto durante il salvataggio del pagamento.');
    } finally {
      PAYMENTS_SAVE_BTN.disabled = false;
      PAYMENTS_SAVE_BTN.textContent = 'Salva pagamento';
    }
  });
}

// Export loadAllData per admin-complete.js
window.loadAllData = loadAllData;
