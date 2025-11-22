/* eslint-env browser */
/**
 * Accessibility Enhancements
 * BEST PRACTICE: WCAG 2.2 Compliance (WebAIM 2025 Report)
 * Implementa accessibilità completa per screen reader e navigazione tastiera
 */

/**
 * Announce to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' | 'assertive'
 */
export function announceToScreenReader(message, priority = "polite") {
  const container =
    priority === "assertive"
      ? document.getElementById("sr-critical")
      : document.getElementById("sr-announcements");

  if (container) {
    container.textContent = "";
    // Use setTimeout to ensure screen reader picks up the change
    setTimeout(() => {
      container.textContent = message;
    }, 100);
  }
}

/**
 * Setup accessibility enhancements
 */
export function initAccessibility() {
  // Add aria-live regions if not present
  if (!document.getElementById("sr-announcements")) {
    const polite = document.createElement("div");
    polite.id = "sr-announcements";
    polite.className = "sr-only";
    polite.setAttribute("role", "status");
    polite.setAttribute("aria-live", "polite");
    polite.setAttribute("aria-atomic", "true");
    document.body.appendChild(polite);
  }

  if (!document.getElementById("sr-critical")) {
    const assertive = document.createElement("div");
    assertive.id = "sr-critical";
    assertive.className = "sr-only";
    assertive.setAttribute("role", "alert");
    assertive.setAttribute("aria-live", "assertive");
    assertive.setAttribute("aria-atomic", "true");
    document.body.appendChild(assertive);
  }

  // Enhance all interactive elements with proper ARIA
  enhanceInteractiveElements();

  // Setup keyboard navigation improvements
  setupKeyboardNavigation();

  // Enhance form accessibility
  enhanceForms();
}

/**
 * Enhance interactive elements with proper ARIA
 */
function enhanceInteractiveElements() {
  // Buttons without labels
  document.querySelectorAll("button:not([aria-label]):not([aria-labelledby])").forEach((btn) => {
    if (!btn.textContent.trim() && !btn.querySelector("svg")) {
      // Icon-only button - add aria-label from title or generate
      const title = btn.getAttribute("title");
      if (title) {
        btn.setAttribute("aria-label", title);
      }
    }
  });

  // Links without accessible names
  document.querySelectorAll("a:not([aria-label]):not([aria-labelledby])").forEach((link) => {
    if (!link.textContent.trim() && link.querySelector("svg")) {
      // Icon-only link
      const title = link.getAttribute("title") || link.getAttribute("aria-label");
      if (!title) {
        const href = link.getAttribute("href");
        if (href) {
          link.setAttribute("aria-label", `Link a ${href.replace("#", "").replace(/-/g, " ")}`);
        }
      }
    }
  });

  // Decorative images
  document.querySelectorAll("img:not([alt])").forEach((img) => {
    // If image is decorative (no meaningful content), add empty alt
    const role = img.getAttribute("role");
    if (role === "presentation" || img.closest(".decorative")) {
      img.setAttribute("alt", "");
    }
  });
}

/**
 * Setup enhanced keyboard navigation
 */
function setupKeyboardNavigation() {
  // Skip to main content link
  const skipLink = document.querySelector(".skip-link");
  if (skipLink) {
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      const main = document.getElementById("main-content") || document.querySelector("main");
      if (main) {
        main.focus();
        main.scrollIntoView({ behavior: "smooth", block: "start" });
        announceToScreenReader("Saltato al contenuto principale");
      }
    });
  }

  // Focus trap for modals (already implemented but enhance)
  document.querySelectorAll('[role="dialog"]').forEach((dialog) => {
    if (!dialog.hasAttribute("aria-labelledby") && !dialog.hasAttribute("aria-label")) {
      const title = dialog.querySelector('h1, h2, h3, [class*="title"]');
      if (title) {
        const id = title.id || `dialog-title-${Date.now()}`;
        title.id = id;
        dialog.setAttribute("aria-labelledby", id);
      }
    }
  });
}

/**
 * Enhance form accessibility
 */
function enhanceForms() {
  document.querySelectorAll("form").forEach((form) => {
    // Add aria-describedby for error messages
    form.querySelectorAll("input, textarea, select").forEach((input) => {
      const name = input.getAttribute("name") || input.id;
      if (name) {
        const errorId = `${name}-error`;
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
          input.setAttribute("aria-describedby", errorId);
          input.setAttribute("aria-invalid", "false");
        }
      }
    });
  });
}

/**
 * Announce page changes to screen readers
 */
export function announcePageChange(pageName) {
  announceToScreenReader(`Navigato a ${pageName}`);
}

/**
 * Announce loading state
 */
export function announceLoading(message = "Caricamento in corso") {
  announceToScreenReader(message);
}

/**
 * Announce error to screen reader
 */
export function announceError(message) {
  announceToScreenReader(message, "assertive");
}
