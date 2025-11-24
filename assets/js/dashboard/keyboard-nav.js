/**
 * Keyboard Navigation & Focus Trap Utility
 * Best Practice: Focus trap in modali/panels per accessibilità WCAG 2.2
 * Paper Accademico: "Keyboard Navigation Patterns" (2023)
 */

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement[]} Array of focusable elements
 */
function getFocusableElements(container) {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  return Array.from(container.querySelectorAll(selector)).filter(
    (el) => !el.hasAttribute("hidden") && el.offsetParent !== null
  );
}

/**
 * Focus trap implementation
 * Best Practice: Traps focus within a container (for modals/panels)
 * Enhanced for complex modals with nested focusable elements
 */
class FocusTrap {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      initialFocus: options.initialFocus || null,
      fallbackFocus: options.fallbackFocus || null,
      returnFocus: options.returnFocus !== false,
      preventScroll: options.preventScroll || false,
      ...options,
    };
    this.focusableElements = [];
    this.firstFocusable = null;
    this.lastFocusable = null;
    this.previousActiveElement = null;
    this.handleKeyDown = null;
    this.handleEscape = null;
  }

  /**
   * Activate focus trap (enhanced for complex modals)
   */
  activate() {
    if (!this.container) {
      return;
    }

    // Store previous active element
    if (this.options.returnFocus) {
      this.previousActiveElement = document.activeElement;
    }

    // Get focusable elements (refresh to handle dynamic content)
    this.updateFocusableElements();

    if (this.focusableElements.length === 0) {
      // Try fallback focus
      const fallback = this.options.fallbackFocus
        ? typeof this.options.fallbackFocus === "string"
          ? this.container.querySelector(this.options.fallbackFocus)
          : this.options.fallbackFocus
        : this.container;

      if (fallback && typeof fallback.focus === "function") {
        fallback.focus();
      }
      return;
    }

    this.firstFocusable = this.focusableElements[0];
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];

    // Focus initial element or first element
    const initialFocus = this.options.initialFocus
      ? typeof this.options.initialFocus === "string"
        ? this.container.querySelector(this.options.initialFocus)
        : this.options.initialFocus
      : this.firstFocusable;

    if (initialFocus && typeof initialFocus.focus === "function") {
      initialFocus.focus({ preventScroll: this.options.preventScroll });
    } else {
      this.firstFocusable?.focus({ preventScroll: this.options.preventScroll });
    }

    // Handle Tab key to trap focus
    this.handleKeyDown = (e) => {
      if (e.key !== "Tab") {
        return;
      }

      // Update focusable elements (in case of dynamic content)
      this.updateFocusableElements();
      if (this.focusableElements.length === 0) {
        return;
      }

      this.firstFocusable = this.focusableElements[0];
      this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];

      // Shift + Tab (backward)
      if (e.shiftKey) {
        if (document.activeElement === this.firstFocusable) {
          e.preventDefault();
          this.lastFocusable?.focus({ preventScroll: this.options.preventScroll });
        }
      }
      // Tab (forward)
      else {
        if (document.activeElement === this.lastFocusable) {
          e.preventDefault();
          this.firstFocusable?.focus({ preventScroll: this.options.preventScroll });
        }
      }
    };

    // Handle ESC key
    this.handleEscape = (e) => {
      if (e.key === "Escape") {
        // Allow ESC to close modal (handled by app.js)
        // Don't prevent default here
      }
    };

    this.container.addEventListener("keydown", this.handleKeyDown);
    if (this.handleEscape) {
      this.container.addEventListener("keydown", this.handleEscape);
    }

    // Prevent scroll on focus
    if (this.options.preventScroll) {
      this.container.addEventListener(
        "focus",
        (e) => {
          e.target.scrollIntoView({ behavior: "smooth", block: "nearest" });
        },
        true
      );
    }
  }

  /**
   * Update focusable elements list
   */
  updateFocusableElements() {
    this.focusableElements = getFocusableElements(this.container);
  }

  /**
   * Deactivate focus trap
   */
  deactivate() {
    // Remove event listeners
    if (this.handleKeyDown) {
      this.container.removeEventListener("keydown", this.handleKeyDown);
      this.handleKeyDown = null;
    }

    if (this.handleEscape) {
      this.container.removeEventListener("keydown", this.handleEscape);
      this.handleEscape = null;
    }

    // Remove visual indicator
    this.container.classList.remove("focus-trap-active");

    // Restore previous focus
    if (this.options.returnFocus && this.previousActiveElement) {
      // Check if element is still in DOM
      if (document.body.contains(this.previousActiveElement)) {
        this.previousActiveElement.focus();
      }
    }

    // Cleanup
    this.focusableElements = [];
    this.firstFocusable = null;
    this.lastFocusable = null;
    this.previousActiveElement = null;
  }
}

/**
 * Keyboard navigation manager for dashboard
 */
class KeyboardNavManager {
  constructor() {
    this.activeFocusTrap = null;
    this.moduleCards = [];
    this.currentModuleIndex = -1;
    this.handleArrowKeys = null;
  }

  /**
   * Initialize keyboard navigation
   */
  init() {
    // Get all module cards
    this.updateModuleCards();

    // Handle Arrow keys for module navigation
    this.handleArrowKeys = (e) => {
      if (
        e.key !== "ArrowLeft" &&
        e.key !== "ArrowRight" &&
        e.key !== "ArrowUp" &&
        e.key !== "ArrowDown"
      ) {
        return;
      }

      // Only if we're on modules view (not in a panel)
      const modulesView = document.getElementById("modules-view");
      if (!modulesView || !modulesView.classList.contains("active")) {
        return;
      }

      if (this.moduleCards.length === 0) {
        this.updateModuleCards();
        return;
      }

      e.preventDefault();

      // Arrow Left/Up: previous module
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        this.currentModuleIndex =
          this.currentModuleIndex <= 0 ? this.moduleCards.length - 1 : this.currentModuleIndex - 1;
      }
      // Arrow Right/Down: next module
      else {
        this.currentModuleIndex =
          this.currentModuleIndex >= this.moduleCards.length - 1 ? 0 : this.currentModuleIndex + 1;
      }

      // Focus and activate module
      const card = this.moduleCards[this.currentModuleIndex];
      if (card) {
        card.focus();
        card.click();
      }
    };

    document.addEventListener("keydown", this.handleArrowKeys);
  }

  /**
   * Update module cards list
   */
  updateModuleCards() {
    this.moduleCards = Array.from(document.querySelectorAll(".module-card")).filter(
      (card) => card.offsetParent !== null && card.style.display !== "none"
    );
  }

  /**
   * Activate focus trap for a panel
   * @param {HTMLElement} panel - Panel element
   * @param {Object} options - Options for focus trap
   */
  activateFocusTrap(panel, options = {}) {
    // Deactivate previous trap
    if (this.activeFocusTrap) {
      this.activeFocusTrap.deactivate();
    }

    // Activate new trap with enhanced options
    this.activeFocusTrap = new FocusTrap(panel, options);
    this.activeFocusTrap.activate();

    // Add visual indicator for focus trap
    if (panel && options.showIndicator !== false) {
      panel.classList.add("focus-trap-active");
    }
  }

  /**
   * Deactivate focus trap
   */
  deactivateFocusTrap() {
    if (this.activeFocusTrap) {
      this.activeFocusTrap.deactivate();
      this.activeFocusTrap = null;
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.deactivateFocusTrap();
    if (this.handleArrowKeys) {
      document.removeEventListener("keydown", this.handleArrowKeys);
      this.handleArrowKeys = null;
    }
    this.moduleCards = [];
  }
}

// Create global instance
export const keyboardNav = new KeyboardNavManager();

// Initialize on module load
if (typeof window !== "undefined") {
  // Initialize after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => keyboardNav.init());
  } else {
    keyboardNav.init();
  }
}
