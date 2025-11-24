/**
 * Test Helpers
 * FASE 3: Testing Framework Setup
 * Utility functions per i test
 */

/**
 * Crea un elemento DOM mock
 */
export function createMockElement(tag = "div", attributes = {}) {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "textContent") {
      element.textContent = value;
    } else if (key === "innerHTML") {
      element.innerHTML = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  return element;
}

/**
 * Crea un mock state per dashboard
 */
export function createMockState(overrides = {}) {
  return {
    currentModule: null,
    reports: [],
    filteredReports: [],
    ...overrides,
  };
}

/**
 * Attendi che un elemento sia presente nel DOM
 */
export function waitForElement(selector, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      } else {
        setTimeout(checkElement, 50);
      }
    };
    checkElement();
  });
}

/**
 * Mock fetch response
 */
export function createMockFetchResponse(data, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers(),
  });
}
