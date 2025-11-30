/**
 * Accessibility utilities
 * WCAG 2.1 AA compliance helpers
 */

/**
 * Generate unique ID for ARIA attributes
 */
let idCounter = 0;
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Get ARIA label for icon-only buttons
 */
export function getIconButtonLabel(iconName: string, action: string): string {
  return `${action} ${iconName}`;
}

/**
 * Format number for screen readers
 */
export function formatNumberForScreenReader(num: number): string {
  return num.toLocaleString('it-IT');
}

/**
 * Format date for screen readers
 */
export function formatDateForScreenReader(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get ARIA live region politeness level
 */
export function getLiveRegionPoliteness(priority: 'low' | 'high'): 'polite' | 'assertive' {
  return priority === 'high' ? 'assertive' : 'polite';
}

/**
 * Check if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return element.matches(focusableSelectors);
}

/**
 * Get all focusable elements within container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
}

/**
 * Trap focus within container
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTab);
  firstElement?.focus();

  return () => {
    container.removeEventListener('keydown', handleTab);
  };
}

