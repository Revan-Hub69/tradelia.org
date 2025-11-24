// /report/assets/js/components/tooltip.js
// Sistema Tooltip Avanzato 2025 - Best Practices Finanza
// Accessibile, Responsive, Touch-Friendly
// -----------------------------------------------------------

import Logger from '../utils/logger.js';

const TOOLTIP = {
  _instances: new Map(),
  _activeTooltip: null,
  _hideTimeout: null,
  _showTimeout: null,
};

// ===== UTILITIES =====
function createEl(tag, className, text = null) {
  const el = document.createElement(tag);
  if (className) {el.className = className;}
  if (text !== null) {el.textContent = text;}
  return el;
}

function escapeHtml(str) {
  if (str == null) {return '';}
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// ===== POSITIONING =====
function calculatePosition(trigger, tooltip, placement = 'top') {
  const triggerRect = trigger.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const spacing = 8; // Spazio tra trigger e tooltip
  let top = 0;
  let left = 0;

  switch (placement) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - spacing;
      left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      break;
    case 'bottom':
      top = triggerRect.bottom + spacing;
      left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      break;
    case 'left':
      top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
      left = triggerRect.left - tooltipRect.width - spacing;
      break;
    case 'right':
      top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
      left = triggerRect.right + spacing;
      break;
  }

  // Boundary detection e correzione
  if (left < 8) {
    left = 8;
  } else if (left + tooltipRect.width > viewport.width - 8) {
    left = viewport.width - tooltipRect.width - 8;
  }

  if (top < 8) {
    top = 8;
  } else if (top + tooltipRect.height > viewport.height - 8) {
    top = viewport.height - tooltipRect.height - 8;
  }

  return { top, left };
}

// ===== RENDERING =====
function createTooltipElement(content, options = {}) {
  const {
    placement = 'top',
    variant = 'default', // 'default' | 'info' | 'warning' | 'error' | 'success'
    maxWidth = '280px',
    html = false,
  } = options;

  const tooltip = createEl('div', `tooltip tooltip--${variant} tooltip--${placement}`);
  tooltip.setAttribute('role', 'tooltip');
  tooltip.setAttribute('aria-live', 'polite');
  tooltip.style.maxWidth = maxWidth;

  if (html) {
    tooltip.innerHTML = content;
  } else {
    tooltip.textContent = content;
  }

  // Arrow
  const arrow = createEl('div', 'tooltip-arrow');
  tooltip.appendChild(arrow);

  return tooltip;
}

// ===== SHOW/HIDE =====
function showTooltip(trigger, content, options = {}) {
  // Nascondi tooltip attivo se presente
  if (TOOLTIP._activeTooltip && TOOLTIP._activeTooltip !== trigger) {
    hideTooltip(TOOLTIP._activeTooltip);
  }

  // Clear timeout esistenti
  if (TOOLTIP._hideTimeout) {
    clearTimeout(TOOLTIP._hideTimeout);
    TOOLTIP._hideTimeout = null;
  }

  // Delay per show (solo su hover, non su focus)
  if (options.delay && options.delay > 0 && !trigger.matches(':focus-visible')) {
    TOOLTIP._showTimeout = setTimeout(() => {
      actuallyShowTooltip(trigger, content, options);
    }, options.delay);
    return;
  }

  actuallyShowTooltip(trigger, content, options);
}

function actuallyShowTooltip(trigger, content, options = {}) {
  // Crea tooltip element
  const tooltip = createTooltipElement(content, options);
  document.body.appendChild(tooltip);

  // Calcola posizione
  const position = calculatePosition(trigger, tooltip, options.placement);
  tooltip.style.top = `${position.top}px`;
  tooltip.style.left = `${position.left}px`;

  // Trigger aria-describedby
  const tooltipId = `tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  tooltip.id = tooltipId;
  trigger.setAttribute('aria-describedby', tooltipId);

  // Salva riferimento
  TOOLTIP._instances.set(trigger, { tooltip, options });
  TOOLTIP._activeTooltip = trigger;

  // Trigger animazione
  requestAnimationFrame(() => {
    tooltip.classList.add('tooltip--visible');
  });

  Logger.debug('Tooltip', `Tooltip mostrato per: ${trigger}`);
}

function hideTooltip(trigger) {
  const instance = TOOLTIP._instances.get(trigger);
  if (!instance) {return;}

  const { tooltip } = instance;

  // Rimuovi aria-describedby
  trigger.removeAttribute('aria-describedby');

  // Animazione fade out
  tooltip.classList.remove('tooltip--visible');

  // Rimuovi dopo animazione
  setTimeout(() => {
    if (tooltip.parentNode) {
      tooltip.parentNode.removeChild(tooltip);
    }
    TOOLTIP._instances.delete(trigger);

    if (TOOLTIP._activeTooltip === trigger) {
      TOOLTIP._activeTooltip = null;
    }
  }, 200);

  Logger.debug('Tooltip', `Tooltip nascosto per: ${trigger}`);
}

// ===== SETUP =====
function setupTooltip(trigger, content, options = {}) {
  if (!trigger || !content) {
    Logger.warn('Tooltip', 'Trigger o content mancante');
    return;
  }

  const {
    placement = 'top',
    delay = 300, // Delay default 300ms
    hideDelay = 100, // Delay per nascondere
    triggerEvents = ['mouseenter', 'focus'], // Eventi che mostrano tooltip
    hideEvents = ['mouseleave', 'blur'], // Eventi che nascondono tooltip
  } = options;

  // Event listeners per show
  triggerEvents.forEach((eventType) => {
    trigger.addEventListener(
      eventType,
      (e) => {
        if (eventType === 'mouseenter' && e.type === 'mouseenter') {
          // Solo su mouse, non su touch
          if ('ontouchstart' in window) {return;}
        }

        if (TOOLTIP._showTimeout) {
          clearTimeout(TOOLTIP._showTimeout);
        }

        showTooltip(trigger, content, { ...options, placement, delay });
      },
      { passive: true }
    );
  });

  // Event listeners per hide
  hideEvents.forEach((eventType) => {
    trigger.addEventListener(
      eventType,
      () => {
        if (TOOLTIP._showTimeout) {
          clearTimeout(TOOLTIP._showTimeout);
          TOOLTIP._showTimeout = null;
        }

        if (hideDelay > 0) {
          TOOLTIP._hideTimeout = setTimeout(() => {
            hideTooltip(trigger);
          }, hideDelay);
        } else {
          hideTooltip(trigger);
        }
      },
      { passive: true }
    );
  });

  // Keyboard: ESC chiude tooltip
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && TOOLTIP._instances.has(trigger)) {
      hideTooltip(trigger);
    }
  });

  Logger.debug('Tooltip', `Tooltip configurato per: ${trigger}`);
}

// ===== PUBLIC API =====
export const tooltip = {
  /**
   * Configura tooltip per un elemento
   * @param {HTMLElement|string} trigger - Elemento trigger o selector
   * @param {string} content - Contenuto tooltip
   * @param {Object} options - Opzioni tooltip
   */
  setup(trigger, content, options = {}) {
    const element = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;

    if (!element) {
      Logger.warn('Tooltip', `Elemento non trovato: ${trigger}`);
      return;
    }

    setupTooltip(element, content, options);
  },

  /**
   * Mostra tooltip manualmente
   * @param {HTMLElement} trigger - Elemento trigger
   * @param {string} content - Contenuto tooltip
   * @param {Object} options - Opzioni tooltip
   */
  show(trigger, content, options = {}) {
    if (!trigger) {return;}
    showTooltip(trigger, content, options);
  },

  /**
   * Nascondi tooltip manualmente
   * @param {HTMLElement} trigger - Elemento trigger
   */
  hide(trigger) {
    if (!trigger) {return;}
    hideTooltip(trigger);
  },

  /**
   * Nascondi tutti i tooltip
   */
  hideAll() {
    TOOLTIP._instances.forEach((instance, trigger) => {
      hideTooltip(trigger);
    });
  },

  /**
   * Rimuovi tooltip da un elemento
   * @param {HTMLElement} trigger - Elemento trigger
   */
  remove(trigger) {
    hideTooltip(trigger);
    // Rimuovi event listeners (se necessario)
  },
};

// Auto-setup per elementi con data-tooltip
function autoSetup() {
  const elements = document.querySelectorAll('[data-tooltip]');
  elements.forEach((el) => {
    const content = el.getAttribute('data-tooltip');
    const placement = el.getAttribute('data-tooltip-placement') || 'top';
    const variant = el.getAttribute('data-tooltip-variant') || 'default';
    const delay = parseInt(el.getAttribute('data-tooltip-delay')) || 300;

    tooltip.setup(el, content, { placement, variant, delay });
  });
}

// Auto-setup al DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoSetup);
} else {
  autoSetup();
}

// Nascondi tooltip su scroll
let scrollTimeout;
window.addEventListener(
  'scroll',
  () => {
    if (scrollTimeout) {clearTimeout(scrollTimeout);}
    scrollTimeout = setTimeout(() => {
      tooltip.hideAll();
    }, 100);
  },
  { passive: true }
);

// Nascondi tooltip su resize
let resizeTimeout;
window.addEventListener(
  'resize',
  () => {
    if (resizeTimeout) {clearTimeout(resizeTimeout);}
    resizeTimeout = setTimeout(() => {
      tooltip.hideAll();
    }, 100);
  },
  { passive: true }
);
