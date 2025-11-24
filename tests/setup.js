/**
 * Vitest Setup File
 * FASE 3: Testing Framework Setup
 * Configurazione globale per tutti i test
 */

import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/dom";
import * as matchers from "@testing-library/jest-dom/matchers";

// Estendi expect con matchers di testing-library
expect.extend(matchers);

// Cleanup dopo ogni test
afterEach(() => {
  cleanup();
});

// Mock globals se necessario
global.console = {
  ...console,
  // Silenzia console.log durante i test (opzionale)
  log: () => {},
  warn: () => {},
  error: () => {},
};
