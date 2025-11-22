/**
 * Compliance Info Component
 * Spiega facilmente PERCHÉ ogni scelta è fatta così (standard accademici)
 * Best Practice: Tooltip/popover con spiegazioni semplici e accessibili
 */

const COMPLIANCE_EXPLANATIONS = {
  // Password
  "password-min-12": {
    title: "Perché minimo 12 caratteri?",
    explanation:
      "Secondo NIST 800-63B (2020), password più lunghe sono più sicure. 12 caratteri offrono un buon equilibrio tra sicurezza e usabilità.",
    source: "NIST SP 800-63B",
    link: "/docs/signup-flow-optimal-academic.md#password",
  },
  "password-strength": {
    title: "Perché lo strength indicator?",
    explanation:
      "Nielsen Norman Group raccomanda feedback visivo immediato. Aiuta a creare password sicure senza frustrazione.",
    source: "NNG (2024)",
    link: "/docs/signup-flow-optimal-academic.md#password",
  },
  "password-no-complexity": {
    title: "Perché non forziamo simboli obbligatori?",
    explanation:
      "NIST 800-63B: forzare complessità eccessiva porta a password prevedibili. La lunghezza è più importante.",
    source: "NIST SP 800-63B",
    link: "/docs/signup-flow-optimal-academic.md#password",
  },

  // Email
  "email-realtime-validation": {
    title: "Perché validazione in tempo reale?",
    explanation:
      "Nielsen Norman Group: feedback immediato riduce errori e migliora l'esperienza utente.",
    source: "NNG (2024)",
    link: "/docs/signup-flow-optimal-academic.md#email",
  },

  // Privacy
  "privacy-checkbox": {
    title: "Perché checkbox non pre-selezionata?",
    explanation:
      "GDPR Art. 7: il consenso deve essere esplicito. Checkbox pre-selezionate sono illegali.",
    source: "GDPR (2018)",
    link: "/docs/signup-flow-optimal-academic.md#privacy",
  },

  // Rate Limiting
  "rate-limiting": {
    title: "Perché max 5 tentativi?",
    explanation:
      "OWASP e NIST: limitare tentativi previene attacchi brute-force. 5 tentativi è il compromesso ottimale.",
    source: "OWASP, NIST 800-63B",
    link: "/docs/signup-flow-optimal-academic.md#rate-limiting",
  },

  // Billing
  "billing-progressive-disclosure": {
    title: "Perché chiediamo fatturazione solo prima del checkout?",
    explanation:
      "Progressive Disclosure (NNG): chiediamo dati solo quando servono. Non sovraccarichiamo l'utente durante registrazione.",
    source: "Nielsen Norman Group",
    link: "/docs/signup-flow-optimal-academic.md#billing",
  },

  // Modals
  "modal-focus-trap": {
    title: "Perché il focus è intrappolato nel modale?",
    explanation:
      "WCAG 2.2: utenti con screen reader devono navigare solo nel modale. Il focus trap è obbligatorio per accessibilità.",
    source: "WCAG 2.2 AA",
    link: "/docs/signup-flow-optimal-academic.md#modals",
  },
  "modal-aria": {
    title: 'Perché role="dialog" e aria-modal?',
    explanation:
      "WAI-ARIA 1.2: gli screen reader devono sapere che è un dialogo modale. Senza questi attributi, l'accessibilità è compromessa.",
    source: "WAI-ARIA 1.2",
    link: "/docs/signup-flow-optimal-academic.md#modals",
  },
  "modal-escape": {
    title: "Perché Escape chiude il modale?",
    explanation:
      "Nielsen Norman Group: Escape è la convenzione universale per chiudere modali. Utenti si aspettano questo comportamento.",
    source: "NNG (2024)",
    link: "/docs/signup-flow-optimal-academic.md#modals",
  },

  // Accessibility
  "label-explicit": {
    title: "Perché label espliciti?",
    explanation:
      "WCAG 2.2: ogni input deve avere un label associato. Screen reader e utenti con disabilità ne hanno bisogno.",
    source: "WCAG 2.2 AA",
    link: "/docs/signup-flow-optimal-academic.md#accessibility",
  },
  "error-field-association": {
    title: "Perché errori associati ai campi?",
    explanation:
      "WCAG 3.3.1: gli errori devono essere chiaramente associati ai campi. Utenti con screen reader devono sapere quale campo ha l'errore.",
    source: "WCAG 2.2 AA",
    link: "/docs/signup-flow-optimal-academic.md#accessibility",
  },
};

/**
 * Create info icon with tooltip
 * @param {string} key - Key in COMPLIANCE_EXPLANATIONS
 * @param {string} position - 'top' | 'right' | 'bottom' | 'left'
 * @returns {HTMLElement}
 */
export function createComplianceInfo(key, position = "top") {
  const explanation = COMPLIANCE_EXPLANATIONS[key];
  if (!explanation) {
    console.warn(`[ComplianceInfo] Key "${key}" not found`);
    return null;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "compliance-info-icon";
  button.setAttribute("aria-label", `Info: ${explanation.title}`);
  button.setAttribute("data-compliance-key", key);
  button.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  `;

  // Tooltip
  const tooltip = document.createElement("div");
  tooltip.className = `compliance-info-tooltip compliance-info-tooltip-${position}`;
  tooltip.setAttribute("role", "tooltip");
  tooltip.innerHTML = `
    <div class="compliance-info-tooltip-content">
      <div class="compliance-info-tooltip-title">${escapeHtml(explanation.title)}</div>
      <div class="compliance-info-tooltip-text">${escapeHtml(explanation.explanation)}</div>
      <div class="compliance-info-tooltip-source">
        <span class="compliance-info-tooltip-source-label">Fonte:</span>
        <span class="compliance-info-tooltip-source-text">${escapeHtml(explanation.source)}</span>
      </div>
      ${
        explanation.link
          ? `
        <a href="${explanation.link}" class="compliance-info-tooltip-link" target="_blank" rel="noopener noreferrer">
          Leggi documentazione completa →
        </a>
      `
          : ""
      }
    </div>
  `;

  // Event listeners
  let timeoutId = null;
  let isVisible = false;

  function showTooltip() {
    if (isVisible) {
      return;
    }
    isVisible = true;
    button.appendChild(tooltip);
    button.setAttribute("aria-expanded", "true");

    // Position tooltip
    setTimeout(() => {
      positionTooltip(tooltip, button, position);
    }, 10);
  }

  function hideTooltip() {
    if (!isVisible) {
      return;
    }
    isVisible = false;
    tooltip.remove();
    button.setAttribute("aria-expanded", "false");
  }

  // Hover
  button.addEventListener("mouseenter", () => {
    clearTimeout(timeoutId);
    showTooltip();
  });

  button.addEventListener("mouseleave", () => {
    timeoutId = setTimeout(() => {
      hideTooltip();
    }, 100);
  });

  // Focus (keyboard)
  button.addEventListener("focus", () => {
    showTooltip();
  });

  button.addEventListener("blur", () => {
    hideTooltip();
  });

  // Click (mobile)
  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isVisible) {
      hideTooltip();
    } else {
      showTooltip();
    }
  });

  return button;
}

/**
 * Position tooltip relative to button
 */
function positionTooltip(tooltip, button, position) {
  const buttonRect = button.getBoundingClientRect();
  const spacing = 8;

  switch (position) {
    case "top":
      tooltip.style.bottom = `${buttonRect.height + spacing}px`;
      tooltip.style.left = "50%";
      tooltip.style.transform = "translateX(-50%)";
      break;
    case "bottom":
      tooltip.style.top = `${buttonRect.height + spacing}px`;
      tooltip.style.left = "50%";
      tooltip.style.transform = "translateX(-50%)";
      break;
    case "right":
      tooltip.style.left = `${buttonRect.width + spacing}px`;
      tooltip.style.top = "50%";
      tooltip.style.transform = "translateY(-50%)";
      break;
    case "left":
      tooltip.style.right = `${buttonRect.width + spacing}px`;
      tooltip.style.top = "50%";
      tooltip.style.transform = "translateY(-50%)";
      break;
  }

  // Keep tooltip in viewport
  const tooltipFinalRect = tooltip.getBoundingClientRect();
  if (tooltipFinalRect.left < 0) {
    tooltip.style.left = `${spacing}px`;
    tooltip.style.transform = "";
  }
  if (tooltipFinalRect.right > window.innerWidth) {
    tooltip.style.right = `${spacing}px`;
    tooltip.style.left = "auto";
    tooltip.style.transform = "";
  }
  if (tooltipFinalRect.top < 0) {
    tooltip.style.top = `${spacing}px`;
    tooltip.style.transform = "";
  }
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
