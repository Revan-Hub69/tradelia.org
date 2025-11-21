// /report/assets/js/components/popover.js
// Sistema Popover Avanzato 2025 - Best Practices Finanza
// Per informazioni contestuali più ricche dei tooltip
// -----------------------------------------------------------

import Logger from '../utils/logger.js';
import { registerOverlay, unregisterOverlay, OVERLAY_TYPES } from '../utils/overlay-manager.js';

const POPOVER = {
  _instances: new Map(),
  _activePopover: null,
};

// ===== UTILITIES =====
function createEl(tag, className, text = null) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== null) el.textContent = text;
  return el;
}

function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// ===== POSITIONING =====
function calculatePopoverPosition(trigger, popover, placement = 'bottom') {
  const triggerRect = trigger.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const spacing = 8;
  let top = 0;
  let left = 0;

  switch (placement) {
    case 'top':
      top = triggerRect.top - popoverRect.height - spacing;
      left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
      break;
    case 'bottom':
      top = triggerRect.bottom + spacing;
      left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
      break;
    case 'left':
      top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
      left = triggerRect.left - popoverRect.width - spacing;
      break;
    case 'right':
      top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
      left = triggerRect.right + spacing;
      break;
  }

  // Boundary detection
  if (left < 8) left = 8;
  if (left + popoverRect.width > viewport.width - 8) {
    left = viewport.width - popoverRect.width - 8;
  }
  if (top < 8) top = 8;
  if (top + popoverRect.height > viewport.height - 8) {
    top = viewport.height - popoverRect.height - 8;
  }

  return { top, left };
}

// ===== RENDERING =====
function createPopoverElement(content, options = {}) {
  const { placement = 'bottom', title = null, maxWidth = '320px', html = false } = options;

  const popover = createEl('div', `popover popover--${placement}`);
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-modal', 'false');
  popover.style.maxWidth = maxWidth;

  if (title) {
    const header = createEl('header', 'popover-header');
    header.innerHTML = `<h3 class="popover-title">${escapeHtml(title)}</h3>`;
    popover.appendChild(header);
  }

  const body = createEl('div', 'popover-body');
  if (html) {
    body.innerHTML = content;
  } else {
    body.textContent = content;
  }
  popover.appendChild(body);

  // Arrow
  const arrow = createEl('div', 'popover-arrow');
  popover.appendChild(arrow);

  // Close button (opzionale)
  if (options.closable) {
    const closeBtn = createEl('button', 'popover-close');
    closeBtn.setAttribute('aria-label', 'Chiudi');
    closeBtn.innerHTML = '×';
    popover.appendChild(closeBtn);
  }

  return popover;
}

// ===== SHOW/HIDE =====
function showPopover(trigger, content, options = {}) {
  if (POPOVER._activePopover && POPOVER._activePopover !== trigger) {
    hidePopover(POPOVER._activePopover);
  }

  const popover = createPopoverElement(content, options);
  document.body.appendChild(popover);

  const position = calculatePopoverPosition(trigger, popover, options.placement);
  popover.style.top = `${position.top}px`;
  popover.style.left = `${position.left}px`;

  const popoverId = `popover-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  popover.id = popoverId;
  trigger.setAttribute('aria-describedby', popoverId);

  // Close button handler
  const closeBtn = popover.querySelector('.popover-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => hidePopover(trigger));
  }

  // Click outside handler
  const handleClickOutside = (e) => {
    if (!popover.contains(e.target) && e.target !== trigger) {
      hidePopover(trigger);
      document.removeEventListener('click', handleClickOutside);
    }
  };

  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 0);

  POPOVER._instances.set(trigger, { popover, options, handleClickOutside });
  POPOVER._activePopover = trigger;

  requestAnimationFrame(() => {
    popover.classList.add('popover--visible');
  });

  // Registra overlay
  registerOverlay(popoverId, OVERLAY_TYPES.POPOVER, popover);

  Logger.debug('Popover', `Popover mostrato per: ${trigger}`);
}

function hidePopover(trigger) {
  const instance = POPOVER._instances.get(trigger);
  if (!instance) return;

  const { popover, handleClickOutside } = instance;

  if (handleClickOutside) {
    document.removeEventListener('click', handleClickOutside);
  }

  trigger.removeAttribute('aria-describedby');

  popover.classList.remove('popover--visible');

  setTimeout(() => {
    if (popover.parentNode) {
      popover.parentNode.removeChild(popover);
    }
    POPOVER._instances.delete(trigger);

    if (POPOVER._activePopover === trigger) {
      POPOVER._activePopover = null;
    }

    unregisterOverlay(popover.id);
  }, 200);

  Logger.debug('Popover', `Popover nascosto per: ${trigger}`);
}

// ===== SETUP =====
function setupPopover(trigger, content, options = {}) {
  if (!trigger || !content) {
    Logger.warn('Popover', 'Trigger o content mancante');
    return;
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (POPOVER._instances.has(trigger)) {
      hidePopover(trigger);
    } else {
      showPopover(trigger, content, options);
    }
  });

  Logger.debug('Popover', `Popover configurato per: ${trigger}`);
}

// ===== PUBLIC API =====
export const popover = {
  setup(trigger, content, options = {}) {
    const element = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;

    if (!element) {
      Logger.warn('Popover', `Elemento non trovato: ${trigger}`);
      return;
    }

    setupPopover(element, content, options);
  },

  show(trigger, content, options = {}) {
    if (!trigger) return;
    showPopover(trigger, content, options);
  },

  hide(trigger) {
    if (!trigger) return;
    hidePopover(trigger);
  },

  hideAll() {
    POPOVER._instances.forEach((instance, trigger) => {
      hidePopover(trigger);
    });
  },
};
