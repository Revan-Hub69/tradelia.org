/**
 * Loading Skeleton Utility
 * Best Practice: Skeleton screens per perceived performance
 * Paper Accademico: "Loading States UX" (Nielsen Norman Group 2024)
 */

/**
 * Create skeleton element
 * @param {string} type - Skeleton type: 'text', 'card', 'list', 'stat'
 * @param {Object} options - Options for skeleton
 * @returns {HTMLElement} Skeleton element
 */
export function createSkeleton(type = "card", options = {}) {
  const skeleton = document.createElement("div");
  skeleton.className = `loading-skeleton loading-skeleton-${type}`;
  skeleton.setAttribute("aria-hidden", "true");
  skeleton.setAttribute("role", "presentation");

  switch (type) {
    case "text":
      skeleton.innerHTML = `
        <div class="skeleton-line" style="width: ${options.width || "100%"}; height: ${options.height || "1rem"};"></div>
      `;
      break;

    case "card":
      skeleton.innerHTML = `
        <div class="skeleton-header">
          <div class="skeleton-line skeleton-avatar" style="width: 40px; height: 40px; border-radius: 50%;"></div>
          <div class="skeleton-content">
            <div class="skeleton-line" style="width: 60%; height: 1rem; margin-bottom: 0.5rem;"></div>
            <div class="skeleton-line" style="width: 80%; height: 0.875rem;"></div>
          </div>
        </div>
        <div class="skeleton-body">
          <div class="skeleton-line" style="width: 100%; height: 0.875rem; margin-bottom: 0.5rem;"></div>
          <div class="skeleton-line" style="width: 90%; height: 0.875rem;"></div>
        </div>
      `;
      break;

    case "list":
      const items = options.items || 3;
      skeleton.innerHTML = Array.from(
        { length: items },
        () => `
        <div class="skeleton-list-item">
          <div class="skeleton-line skeleton-icon" style="width: 24px; height: 24px; border-radius: 4px;"></div>
          <div class="skeleton-content">
            <div class="skeleton-line" style="width: 70%; height: 1rem; margin-bottom: 0.375rem;"></div>
            <div class="skeleton-line" style="width: 50%; height: 0.75rem;"></div>
          </div>
        </div>
      `
      ).join("");
      break;

    case "stat":
      skeleton.innerHTML = `
        <div class="skeleton-stat-label" style="width: 60%; height: 0.875rem; margin-bottom: 0.75rem;"></div>
        <div class="skeleton-stat-value" style="width: 80%; height: 2rem; margin-bottom: 0.5rem;"></div>
        <div class="skeleton-stat-change" style="width: 40%; height: 0.75rem;"></div>
      `;
      break;

    default:
      skeleton.innerHTML = '<div class="skeleton-line" style="width: 100%; height: 1rem;"></div>';
  }

  return skeleton;
}

/**
 * Show skeleton loading in container
 * @param {HTMLElement|string} container - Container element or selector
 * @param {string} type - Skeleton type
 * @param {Object} options - Options
 * @returns {HTMLElement} Skeleton element
 */
export function showSkeleton(container, type = "card", options = {}) {
  const containerEl = typeof container === "string" ? document.querySelector(container) : container;

  if (!containerEl) {
    console.warn("[LoadingSkeleton] Container not found:", container);
    return null;
  }

  // Create skeleton
  const skeleton = createSkeleton(type, options);

  // Add to container
  containerEl.appendChild(skeleton);

  return skeleton;
}

/**
 * Show multiple skeletons
 * @param {HTMLElement|string} container - Container element or selector
 * @param {string} type - Skeleton type
 * @param {number} count - Number of skeletons
 * @param {Object} options - Options
 */
export function showSkeletons(container, type = "card", count = 3, options = {}) {
  const containerEl = typeof container === "string" ? document.querySelector(container) : container;

  if (!containerEl) {
    console.warn("[LoadingSkeleton] Container not found:", container);
    return;
  }

  for (let i = 0; i < count; i++) {
    showSkeleton(containerEl, type, options);
  }
}

/**
 * Remove skeleton from container
 * @param {HTMLElement|string} container - Container element or selector
 */
export function hideSkeleton(container) {
  const containerEl = typeof container === "string" ? document.querySelector(container) : container;

  if (!containerEl) {
    return;
  }

  const skeletons = containerEl.querySelectorAll(".loading-skeleton");
  skeletons.forEach((skeleton) => skeleton.remove());
}
