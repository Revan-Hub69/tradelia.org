/* eslint-env browser */
/**
 * Dashboard Account Status Banner
 * Mostra stato account, saldo, toggle PWA e notifiche
 */

import { getUserRole, logout, getPlanData } from './auth.js';

let currentRole = null;
let currentPlanData = null;

/**
 * Inizializza e renderizza il banner account
 */
export async function initAccountBanner() {
  const bannerContainer = document.getElementById('account-banner-slot');
  if (!bannerContainer) {
    console.warn('[Account Banner] Container non trovato');
    return;
  }

  currentRole = await getUserRole();
  currentPlanData = await getPlanData();
  renderBanner(bannerContainer, currentRole, currentPlanData);
  bindBannerEvents(bannerContainer, currentRole);
}

/**
 * Renderizza il banner in base al ruolo e plan data
 */
function renderBanner(container, role, planData) {
  if (role.role === 'guest') {
    container.innerHTML = `
      <div class="account-banner account-banner-guest">
        <div class="account-banner-content">
          <div class="account-banner-icon">👤</div>
          <div class="account-banner-info">
            <div class="account-banner-title">Accesso Libero</div>
            <div class="account-banner-subtitle">Accedi per sbloccare PDF e analisi</div>
          </div>
          <div class="account-banner-actions">
            <a href="/accesso.html" class="btn btn-primary btn-sm">Accedi</a>
          </div>
        </div>
      </div>
    `;
    return;
  }

  const plan = planData?.plan || {};
  const usage = planData?.usage || {};
  const email = role.user?.email || 'Utente';

  if (role.role === 'authenticated' || role.role === 'pro' || plan.type === 'pro') {
    // Pro: 19€/mese, 1 analisi inclusa, max 3 extra a 29€
    const proIncludedRemaining = usage.proIncludedRemaining || 0;
    const proExtraRemaining = usage.proExtraRemaining || 0;
    const paymentDueDate = plan.xoloPaymentDueDate;

    let statusBadge = '';
    if (plan.status === 'pending_manual' || plan.status === 'pending_payment') {
      const dueDate = paymentDueDate ? new Date(paymentDueDate) : null;
      const daysLeft = dueDate ? Math.max(0, Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24))) : 0;
      statusBadge = `<span class="account-banner-badge badge-pending">Pagamento in attesa (${daysLeft} giorni)</span>`;
    }

    container.innerHTML = `
      <div class="account-banner account-banner-authenticated">
        <div class="account-banner-content">
          <div class="account-banner-icon">👤</div>
          <div class="account-banner-info">
            <div class="account-banner-title">
              ${escapeHtml(email)} • Pro
              ${statusBadge}
            </div>
            <div class="account-banner-subtitle">
              Analisi inclusa: <strong>${proIncludedRemaining}/1</strong> • 
              Analisi extra: <strong>${proExtraRemaining}/3</strong> a 29€ • 
              PDF: <strong>10€</strong>
            </div>
          </div>
          <div class="account-banner-actions">
            ${plan.status === 'pending_manual' || plan.status === 'pending_payment' 
              ? `<span class="account-banner-warning">Attendi attivazione</span>`
              : `<a href="#on-demand" class="btn btn-primary btn-sm" data-action="activate-desk">Attiva Desk</a>`
            }
            <button class="btn btn-secondary btn-sm" id="btn-logout">Esci</button>
          </div>
        </div>
      </div>
    `;
    return;
  }

  if (role.role === 'desk' || plan.type === 'desk') {
    const desk = plan.desk || {};
    const expiresAt = plan.expiresAt ? new Date(plan.expiresAt) : null;
    const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24))) : 0;
    const analysesRemaining = desk.analysesRemaining || usage.deskIncludedRemaining || 0;
    const credits = plan.credits || 0;

    const expiresText = expiresAt 
      ? `Scade: ${expiresAt.toLocaleDateString('it-IT')} (${daysLeft} giorni)`
      : 'Scade: —';

    container.innerHTML = `
      <div class="account-banner account-banner-desk">
        <div class="account-banner-content">
          <div class="account-banner-icon">💼</div>
          <div class="account-banner-info">
            <div class="account-banner-title">${escapeHtml(email)} • Desk Attivo</div>
            <div class="account-banner-subtitle">
              ${expiresText} • Analisi incluse: <strong>${analysesRemaining}/2</strong>
              ${credits > 0 ? ` • Saldo: <strong>${credits.toFixed(2)}€</strong>` : ''}
            </div>
          </div>
          <div class="account-banner-actions">
            <label class="toggle-switch" title="Notifiche">
              <input type="checkbox" id="toggle-notifications" ${getNotificationPreference() ? 'checked' : ''}>
              <span class="toggle-slider"></span>
              <span class="toggle-label">Notifiche</span>
            </label>
            <button class="btn btn-secondary btn-sm" id="btn-logout">Esci</button>
          </div>
        </div>
      </div>
    `;
    return;
  }
}

/**
 * Bind event listeners al banner
 */
function bindBannerEvents(container, role) {
  // Logout button
  const logoutBtn = container.querySelector('#btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('Sei sicuro di voler uscire?')) {
        await logout();
      }
    });
  }

  // Toggle notifiche (solo Desk)
  if (role.role === 'desk') {
    const notificationsToggle = container.querySelector('#toggle-notifications');
    if (notificationsToggle) {
      notificationsToggle.addEventListener('change', (e) => {
        setNotificationPreference(e.target.checked);
        // TODO: Integrare con sistema notifiche
        console.log('[Account Banner] Notifiche:', e.target.checked ? 'attivate' : 'disattivate');
      });
    }
  }

  // Activate Desk button (solo Autenticato/Pro)
  if (role.role === 'authenticated' || role.role === 'pro') {
    const activateDeskBtn = container.querySelector('[data-action="activate-desk"]');
    if (activateDeskBtn) {
      activateDeskBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // TODO: Aprire modale o reindirizzare a pagina attivazione Desk
        window.location.hash = 'on-demand';
        // Scroll al form attivazione Desk
        setTimeout(() => {
          const deskForm = document.querySelector('[data-desk-activation]');
          if (deskForm) {
            deskForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      });
    }
  }
}

/**
 * Utility: escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Ottiene preferenza notifiche da localStorage
 */
function getNotificationPreference() {
  const pref = localStorage.getItem('tradelia-notifications-enabled');
  return pref === 'true';
}

/**
 * Salva preferenza notifiche in localStorage
 */
function setNotificationPreference(enabled) {
  localStorage.setItem('tradelia-notifications-enabled', enabled ? 'true' : 'false');
}

/**
 * Aggiorna il banner (utile dopo azioni che cambiano lo stato)
 */
export async function refreshAccountBanner() {
  currentRole = await getUserRole();
  currentPlanData = await getPlanData();
  const bannerContainer = document.getElementById('account-banner-slot');
  if (bannerContainer) {
    renderBanner(bannerContainer, currentRole, currentPlanData);
    bindBannerEvents(bannerContainer, currentRole);
  }
}

/**
 * Ottiene il ruolo corrente (cached)
 */
export function getCurrentRole() {
  return currentRole;
}

