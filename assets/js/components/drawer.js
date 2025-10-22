// /assets/js/components/drawer.js
// Drawer side-panel (desktop) / bottom-sheet (mobile)
// - API: window.Tradelia.openDrawer(), window.Tradelia.closeDrawer()
// - A11y: role="dialog", aria-modal, focus management, ESC to close
// - UX: body scroll lock, backdrop click, responsive mode flag

export function initDrawerAPI() {
  const drawer = document.getElementById('mod-drawer');
  if (!drawer) {
    console.warn('[drawer] #mod-drawer non trovato');
    return;
  }
  const panel  = drawer.querySelector('aside');
  const header = drawer.querySelector('header');
  const btnClose = document.getElementById('drawer-close');
  const btnPrint = document.getElementById('drawer-print');

  if (!panel) {
    console.warn('[drawer] aside non trovato dentro #mod-drawer');
    return;
  }

  // Aggiusta attributi ARIA
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');

  // Inject sheet handle per mobile (se non presente)
  if (!panel.querySelector('.sheet-handle')) {
    const handle = document.createElement('div');
    handle.className = 'sheet-handle';
    panel.insertBefore(handle, header || panel.firstChild);
  }

  const isMobile = () => window.matchMedia('(max-width: 640px)').matches;

  let isOpen = false;
  let prevOverflow = '';
  let escHandler = null;

  function lockScroll() {
    prevOverflow = document.documentElement.style.overflow || '';
    document.documentElement.style.overflow = 'hidden';
  }
  function unlockScroll() {
    document.documentElement.style.overflow = prevOverflow;
  }

  function setModeFlag() {
    drawer.setAttribute('data-mode', String(isMobile()));
  }

  function onEsc(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDrawer();
    }
  }

  function openDrawer() {
    if (isOpen) return;
    isOpen = true;

    setModeFlag();
    drawer.classList.remove('hidden');

    // Scroll lock & focus
    lockScroll();
    // Ritarda la transizione per permettere al browser di applicare display
    requestAnimationFrame(() => {
      if (isMobile()) {
        panel.style.transform = 'translateY(0)';
      } else {
        panel.style.transform = 'translateX(0)';
      }
      // Focus nel titolo o nel primo focusable
      const focusable = panel.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      (focusable || panel).focus({ preventScroll: true });
    });

    // ESC to close
    escHandler = onEsc;
    document.addEventListener('keydown', escHandler, { passive: false });
  }

  function closeDrawer() {
    if (!isOpen) return;
    isOpen = false;

    // Anima chiusura secondo layout corrente
    if (isMobile()) {
      panel.style.transform = 'translateY(100%)';
    } else {
      panel.style.transform = 'translateX(100%)';
    }

    const onEnd = () => {
      drawer.classList.add('hidden');
      panel.removeEventListener('transitionend', onEnd);
      unlockScroll();
      if (escHandler) {
        document.removeEventListener('keydown', escHandler);
        escHandler = null;
      }
    };
    panel.addEventListener('transitionend', onEnd, { once: true });
  }

  // Backdrop click
  drawer.addEventListener('click', (e) => {
    if (e.target && e.target.dataset && e.target.dataset.close === 'backdrop') {
      closeDrawer();
    }
  });

  // Header controls
  btnClose?.addEventListener('click', closeDrawer);
  btnPrint?.addEventListener('click', () => window.print());

  // Aggiorna mode flag su resize (utile se si ruota lo schermo)
  window.addEventListener('resize', () => {
    if (!isOpen) return;
    setModeFlag();
  });

  // API globale
  window.Tradelia = window.Tradelia || {};
  Object.assign(window.Tradelia, { openDrawer, closeDrawer });
}
