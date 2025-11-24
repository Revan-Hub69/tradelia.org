/**
 * Test: Dashboard State Management
 * FASE 3: Testing Framework Setup
 * Test per gestione stato dashboard
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createMockState } from "../utils/test-helpers.js";

describe("Dashboard State Management", () => {
  let state;

  beforeEach(() => {
    state = createMockState();
  });

  it("dovrebbe inizializzare state vuoto", () => {
    expect(state.currentModule).toBe(null);
    expect(state.reports).toEqual([]);
    expect(state.filteredReports).toEqual([]);
  });

  it("dovrebbe permettere override di state", () => {
    const customState = createMockState({
      currentModule: "reports",
      reports: [{ id: "1", ticker: "AAPL" }],
    });

    expect(customState.currentModule).toBe("reports");
    expect(customState.reports).toHaveLength(1);
    expect(customState.reports[0].ticker).toBe("AAPL");
  });

  it("dovrebbe gestire filteredReports separatamente da reports", () => {
    state.reports = [
      { id: "1", ticker: "AAPL" },
      { id: "2", ticker: "MSFT" },
      { id: "3", ticker: "GOOGL" },
    ];

    state.filteredReports = state.reports.filter((r) => r.ticker === "AAPL");

    expect(state.reports).toHaveLength(3);
    expect(state.filteredReports).toHaveLength(1);
    expect(state.filteredReports[0].ticker).toBe("AAPL");
  });

  it("dovrebbe supportare cambio modulo corrente", () => {
    state.currentModule = "overview";
    expect(state.currentModule).toBe("overview");

    state.currentModule = "reports";
    expect(state.currentModule).toBe("reports");

    state.currentModule = null;
    expect(state.currentModule).toBe(null);
  });
});
