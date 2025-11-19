/**
 * Version Check & Auto-Update System for Tradelia AI
 * 
 * Implements automatic version checking and update BEFORE MiFID consent overlay.
 * Preserves all localStorage data (MiFID consent, tokens, preferences) during updates.
 * 
 * Academic References:
 * - W3C (2023). Service Workers. W3C Working Draft
 * - ESMA (2021). Guidelines on MiFID II product governance requirements
 * - Microsoft (2024). Progressive Web Apps Best Practices
 * - Google (2024). PWA Update Patterns
 * 
 * @version 2.0.0
 */

(function() {
  'use strict';

  const VERSION_KEY = 'tradelia-app-version';
  const VERSION_CHECK_KEY = 'tradelia-version-checked';
  const VERSION_URL = '/version.json';
  // Get current version from sw.js or default
  const CURRENT_VERSION = '2.0.0'; // Must match sw.js and version.json

  let updateInProgress = false;

  /**
   * Backup all localStorage data before update
   */
  function backupLocalStorage() {
    const backup = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('_temp_')) {
        try {
          backup[key] = localStorage.getItem(key);
        } catch (e) {
          console.warn('[Version] Errore backup localStorage:', key, e);
        }
      }
    }
    return backup;
  }

  /**
   * Restore all localStorage data after update
   */
  function restoreLocalStorage(backup) {
    try {
      Object.keys(backup).forEach(key => {
        localStorage.setItem(key, backup[key]);
      });
      console.log('[Version] localStorage ripristinato');
    } catch (e) {
      console.error('[Version] Errore ripristino localStorage:', e);
    }
  }

  /**
   * Check for new version
   */
  async function checkVersion() {
    try {
      const response = await fetch(`${VERSION_URL}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.version || null;
    } catch (e) {
      console.log('[Version] Version check skipped:', e);
      return null;
    }
  }

  /**
   * Check service worker for updates
   */
  async function checkServiceWorkerUpdate() {
    if (!('serviceWorker' in navigator)) return false;
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;
      
      await registration.update();
      
      return new Promise((resolve) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                resolve(true);
              } else if (newWorker.state === 'activated') {
                resolve(true);
              }
            });
          }
        });
        
        // Timeout after 2 seconds
        setTimeout(() => resolve(false), 2000);
      });
    } catch (e) {
      console.error('[Version] Errore controllo SW:', e);
      return false;
    }
  }

  /**
   * Show version update modal BEFORE MiFID
   */
  function showVersionModal(hasUpdate, currentVersion, newVersion) {
    // Don't show if already shown in this session
    const sessionKey = 'version-modal-shown';
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }
    sessionStorage.setItem(sessionKey, 'true');

    const modal = document.createElement('div');
    modal.id = 'version-update-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'version-modal-title');
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 15000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(12px);
      padding: 1rem;
      animation: fadeIn 0.3s ease;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: var(--surface-elev, #202020);
      border: 1px solid var(--br-card, #323232);
      border-radius: 12px;
      max-width: 500px;
      width: 100%;
      padding: 2rem;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
      position: relative;
    `;

    if (hasUpdate) {
      content.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="width: 64px; height: 64px; margin: 0 auto 1rem; background: rgba(34, 197, 94, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="rgb(34, 197, 94)" stroke-width="2" style="width: 32px; height: 32px;">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </div>
          <h2 id="version-modal-title" style="font-size: 1.5rem; font-weight: 700; color: var(--ink, #ffffff); margin: 0 0 0.5rem;">
            Aggiornamento disponibile
          </h2>
          <p style="color: var(--muted, #b8b8b8); font-size: 0.9rem; margin: 0;">
            Versione ${newVersion} disponibile (attuale: ${currentVersion})
          </p>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <div style="background: rgba(0, 0, 0, 0.3); border-radius: 8px; height: 8px; overflow: hidden; position: relative;">
            <div id="update-progress" style="
              background: linear-gradient(90deg, rgb(34, 197, 94) 0%, rgb(16, 185, 129) 100%);
              height: 100%;
              width: 0%;
              transition: width 0.3s ease;
              border-radius: 8px;
              box-shadow: 0 0 12px rgba(34, 197, 94, 0.5);
            "></div>
          </div>
          <p id="update-status" style="text-align: center; color: var(--muted, #b8b8b8); font-size: 0.85rem; margin-top: 0.75rem;">
            Aggiornamento in corso...
          </p>
        </div>
        
        <button id="version-continue-btn" type="button" style="
          display: none;
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: var(--brand-600, #2563eb);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
        ">Continua</button>
      `;
    } else {
      content.innerHTML = `
        <div style="text-align: center;">
          <h2 id="version-modal-title" style="font-size: 1.5rem; font-weight: 700; color: var(--ink, #ffffff); margin: 0 0 1rem;">
            Tradelia AI
          </h2>
          <p style="color: var(--muted, #b8b8b8); font-size: 0.9rem; margin: 0 0 1.5rem;">
            Versione ${currentVersion}
          </p>
          <button id="version-continue-btn" type="button" style="
            width: 100%;
            padding: 0.875rem 1.5rem;
            background: var(--brand-600, #2563eb);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s;
          ">Continua</button>
        </div>
      `;
    }

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @media (prefers-reduced-motion: reduce) {
        #version-update-modal {
          animation: none;
        }
      }
    `;
    document.head.appendChild(style);

    // Continue button
    const continueBtn = content.querySelector('#version-continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        modal.remove();
        style.remove();
        // Trigger MiFID check after version modal
        if (window.checkLegalConsent) {
          setTimeout(() => window.checkLegalConsent(), 100);
        }
      });

      // Auto-update if new version available
      if (hasUpdate) {
        performAutoUpdate(modal, content);
      } else {
        continueBtn.style.display = 'block';
        // Focus management for accessibility
        setTimeout(() => continueBtn.focus(), 100);
      }
    }
  }

  /**
   * Perform automatic update with progress bar
   */
  async function performAutoUpdate(modal, content) {
    if (updateInProgress) return;
    updateInProgress = true;

    const progressBar = content.querySelector('#update-progress');
    const statusText = content.querySelector('#update-status');
    const continueBtn = content.querySelector('#version-continue-btn');

    // Backup localStorage
    const backup = backupLocalStorage();

    // Update progress
    const updateProgress = (percent, text) => {
      if (progressBar) {
        progressBar.style.width = `${percent}%`;
      }
      if (statusText) {
        statusText.textContent = text;
      }
    };

    try {
      updateProgress(10, 'Backup dati in corso...');
      await new Promise(resolve => setTimeout(resolve, 300));

      updateProgress(30, 'Aggiornamento cache...');
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      updateProgress(50, 'Aggiornamento service worker...');
      
      // Update service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          await registration.unregister();
        }
        await navigator.serviceWorker.register('/sw.js');
      }

      updateProgress(80, 'Ripristino dati...');
      await new Promise(resolve => setTimeout(resolve, 200));

      // Restore localStorage
      restoreLocalStorage(backup);

      updateProgress(100, 'Aggiornamento completato!');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update version in localStorage
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      localStorage.setItem(VERSION_CHECK_KEY, Date.now().toString());

      // Show continue button
      if (continueBtn) {
        continueBtn.style.display = 'block';
        continueBtn.textContent = 'Continua';
      }

      // Auto-reload after 2 seconds if user doesn't click
      setTimeout(() => {
        if (updateInProgress) {
          window.location.reload();
        }
      }, 2000);

    } catch (error) {
      console.error('[Version] Errore durante aggiornamento:', error);
      updateProgress(100, 'Errore durante aggiornamento. Ricarica manualmente.');
      if (continueBtn) {
        continueBtn.style.display = 'block';
        continueBtn.textContent = 'Continua comunque';
      }
    } finally {
      updateInProgress = false;
    }
  }

  /**
   * Main initialization
   */
  async function init() {
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Check if already checked today (avoid multiple checks)
    const lastCheck = localStorage.getItem(VERSION_CHECK_KEY);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    if (lastCheck && (now - parseInt(lastCheck)) < oneHour) {
      // Already checked recently, skip
      return;
    }

    const storedVersion = localStorage.getItem(VERSION_KEY);
    const remoteVersion = await checkVersion();
    const swUpdate = await checkServiceWorkerUpdate();

    const hasUpdate = (remoteVersion && remoteVersion !== CURRENT_VERSION) || swUpdate;

    // Show modal if:
    // 1. First visit (no stored version)
    // 2. New version available
    if (!storedVersion || hasUpdate) {
      showVersionModal(hasUpdate, CURRENT_VERSION, remoteVersion || CURRENT_VERSION);
    } else {
      // Update check timestamp
      localStorage.setItem(VERSION_CHECK_KEY, now.toString());
    }
  }

  // Expose for manual check
  window.checkVersionUpdate = init;

  // Auto-init
  init();
})();

