/* eslint-env browser */
/**
 * Theme Toggle (Dark/Light Mode)
 * BEST PRACTICE: Dark Mode UX Research 2024-2025, Apple HIG
 * Toggle tra dark e light mode con supporto prefers-color-scheme
 */

const THEME_STORAGE_KEY = "dashboard-theme";

/**
 * Initialize theme toggle
 */
export function initThemeToggle() {
  // Detect system preference
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Get saved theme or use system preference
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

  // Apply theme
  setTheme(initialTheme);

  // Setup toggle button
  setupToggleButton();

  // Listen for system preference changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      // Only auto-switch if user hasn't manually set a preference
      setTheme(e.matches ? "dark" : "light");
    }
  });
}

/**
 * Setup toggle button
 */
function setupToggleButton() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) {
    return;
  }

  toggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    saveTheme(newTheme);

    // Haptic feedback
    if (window.triggerHapticFeedback) {
      window.triggerHapticFeedback("light");
    }

    // Screen reader announcement
    if (window.announceToScreenReader) {
      window.announceToScreenReader(`Tema cambiato a ${newTheme === "dark" ? "scuro" : "chiaro"}`);
    }
  });

  // Keyboard support
  toggleBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleBtn.click();
    }
  });
}

/**
 * Set theme
 */
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-theme-manual", "true");

  // Update toggle button icon
  updateToggleIcon(theme);

  // Update meta theme-color
  updateThemeColor(theme);
}

/**
 * Update toggle button icon
 */
function updateToggleIcon(theme) {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) {
    return;
  }

  const svg = toggleBtn.querySelector("svg");
  if (!svg) {
    return;
  }

  if (theme === "dark") {
    // Moon icon for dark mode (switch to light)
    svg.innerHTML = `
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    `;
    toggleBtn.setAttribute("aria-label", "Passa a tema chiaro");
  } else {
    // Sun icon for light mode (switch to dark)
    svg.innerHTML = `
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    `;
    toggleBtn.setAttribute("aria-label", "Passa a tema scuro");
  }
}

/**
 * Update meta theme-color
 */
function updateThemeColor(theme) {
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement("meta");
    metaThemeColor.setAttribute("name", "theme-color");
    document.head.appendChild(metaThemeColor);
  }

  metaThemeColor.setAttribute("content", theme === "dark" ? "#0a0a0a" : "#ffffff");
}

/**
 * Save theme preference
 */
function saveTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Get current theme
 */
export function getCurrentTheme() {
  return document.documentElement.getAttribute("data-theme") || "dark";
}

// setTheme e saveTheme sono già esportati sopra, non serve ridefinirli
