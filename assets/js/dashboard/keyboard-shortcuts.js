/**
 * Dashboard Keyboard Shortcuts System
 * Sistema completo di keyboard shortcuts con help modal
 * Best Practice: Separazione concerns - shortcuts separati da navigazione
 */

const SHORTCUTS = {
  search: { key: 'ctrl+k', mac: 'meta+k', description: 'Apri ricerca globale', action: () => import('./global-search.js').then(m => m.openSearch()) },
  help: { key: '?', mac: '?', description: 'Mostra aiuto shortcuts', action: () => openShortcutsHelp() },
  overview: { key: 'g o', mac: 'g o', description: 'Vai a Panoramica', action: () => { window.location.hash = 'overview'; } },
  reports: { key: 'g r', mac: 'g r', description: 'Vai a Report', action: () => { window.location.hash = 'reports'; } },
  settings: { key: 'g s', mac: 'g s', description: 'Vai a Impostazioni', action: () => { window.location.hash = 'settings'; } },
  watchlist: { key: 'g w', mac: 'g w', description: 'Vai a Preferiti', action: () => { window.location.hash = 'watchlist'; } },
  close: { key: 'escape', mac: 'escape', description: 'Chiudi modal/panel', action: () => { if (window.location.hash) window.location.hash = ''; } },
};

let keySequence = [];
let sequenceTimeout = null;

/**
 * Initialize keyboard shortcuts
 */
export function initKeyboardShortcuts() {
  document.addEventListener('keydown', handleKeyPress);
}

/**
 * Handle key press
 */
function handleKeyPress(e) {
  // Don't trigger shortcuts when typing in inputs
  if (
    e.target.tagName === 'INPUT' ||
    e.target.tagName === 'TEXTAREA' ||
    e.target.isContentEditable
  ) {
    // Allow Ctrl+K / Cmd+K even when typing
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    if (
      ((!isMac && e.ctrlKey) || (isMac && e.metaKey)) &&
      e.key.toLowerCase() === 'k'
    ) {
      e.preventDefault();
      SHORTCUTS.search.action();
    }
    if (e.key === '?') {
      e.preventDefault();
      SHORTCUTS.help.action();
    }
    return;
  }

  // Check single key shortcuts
  if (e.key === '?') {
    e.preventDefault();
    SHORTCUTS.help.action();
    return;
  }

  if (e.key === 'Escape') {
    SHORTCUTS.close.action();
    return;
  }

  // Handle g+key sequences
  if (e.key.toLowerCase() === 'g') {
    keySequence = ['g'];
    clearTimeout(sequenceTimeout);
    sequenceTimeout = setTimeout(() => {
      keySequence = [];
    }, 1000);
    return;
  }

  if (keySequence.length === 1 && keySequence[0] === 'g') {
    const shortcut = SHORTCUTS[`${keySequence[0]} ${e.key.toLowerCase()}`.replace(' ', '')];
    if (shortcut) {
      e.preventDefault();
      shortcut.action();
      keySequence = [];
      clearTimeout(sequenceTimeout);
    } else {
      keySequence = [];
      clearTimeout(sequenceTimeout);
    }
    return;
  }

  // Check Ctrl/Cmd combinations
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? e.metaKey : e.ctrlKey;

  if (modKey && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    SHORTCUTS.search.action();
    return;
  }
}

/**
 * Open shortcuts help modal
 */
function openShortcutsHelp() {
  // Create or show modal
  let modal = document.getElementById('shortcuts-help-modal');
  if (!modal) {
    modal = createShortcutsModal();
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Create shortcuts help modal
 */
function createShortcutsModal() {
  const modal = document.createElement('div');
  modal.id = 'shortcuts-help-modal';
  modal.className = 'shortcuts-help-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'Keyboard Shortcuts');
  modal.setAttribute('aria-modal', 'true');

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  modal.innerHTML = `
    <div class="shortcuts-help-overlay" aria-hidden="true"></div>
    <div class="shortcuts-help-content">
      <div class="shortcuts-help-header">
        <h2 class="shortcuts-help-title">Keyboard Shortcuts</h2>
        <button class="shortcuts-help-close" aria-label="Chiudi">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div class="shortcuts-help-body">
        ${Object.entries(SHORTCUTS)
          .map(([id, shortcut]) => {
            const keyDisplay = isMac && shortcut.mac ? shortcut.mac : shortcut.key;
            return `
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  ${keyDisplay
                    .split(' ')
                    .map((k) => `<kbd>${k === 'ctrl' ? 'Ctrl' : k === 'meta' ? 'Cmd' : k.toUpperCase()}</kbd>`)
                    .join(' ')}
                </div>
                <div class="shortcut-description">${shortcut.description}</div>
              </div>
            `;
          })
          .join('')}
      </div>
      <div class="shortcuts-help-footer">
        <div class="shortcuts-help-hint">
          Premi <kbd>?</kbd> per aprire questo menu in qualsiasi momento
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  modal.querySelector('.shortcuts-help-overlay').addEventListener('click', () => closeShortcutsHelp());
  modal.querySelector('.shortcuts-help-close').addEventListener('click', () => closeShortcutsHelp());
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeShortcutsHelp();
    }
  });

  return modal;
}

/**
 * Close shortcuts help modal
 */
function closeShortcutsHelp() {
  const modal = document.getElementById('shortcuts-help-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

