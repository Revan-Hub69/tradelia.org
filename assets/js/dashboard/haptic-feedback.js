/* eslint-env browser */
/**
 * Haptic Feedback
 * BEST PRACTICE: Mobile UX Patterns (iOS/Android)
 * Vibrazione per feedback tattile su azioni importanti
 */

/**
 * Trigger haptic feedback
 * @param {string} type - 'light' | 'medium' | 'heavy' | 'success' | 'error'
 */
export function triggerHapticFeedback(type = "light") {
  if (!("vibrate" in navigator)) {
    return; // Vibration API non supportata
  }

  const patterns = {
    light: 10, // 10ms
    medium: 20, // 20ms
    heavy: 30, // 30ms
    success: [10, 50, 10], // Pattern per successo
    error: [20, 50, 20, 50, 20], // Pattern per errore
  };

  const pattern = patterns[type] || patterns.light;
  navigator.vibrate(pattern);
}

/**
 * Setup haptic feedback for common interactions
 */
export function setupHapticFeedback() {
  if (!("vibrate" in navigator)) {
    return; // Vibration API non supportata
  }

  // Haptic feedback per bottoni importanti
  document.querySelectorAll(".btn-primary, .btn-danger").forEach((btn) => {
    btn.addEventListener("click", () => {
      triggerHapticFeedback("medium");
    });
  });

  // Haptic feedback per toggle switches
  document.querySelectorAll(".toggle-switch input[type='checkbox']").forEach((toggle) => {
    toggle.addEventListener("change", () => {
      triggerHapticFeedback("light");
    });
  });

  // Haptic feedback per card clicks
  document.querySelectorAll(".module-card").forEach((card) => {
    card.addEventListener("click", () => {
      triggerHapticFeedback("light");
    });
  });
}
