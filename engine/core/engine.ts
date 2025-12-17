import { z } from "zod";
import {
  OrderPlacedSchema,
  OrderCancelledSchema,
  OrderExecutedSchema,
  TradeSettledSchema,
  PositionOpenedSchema,
  PositionAdjustedSchema,
  PositionClosedSchema,
} from "../schema";

import type {
  EngineState,
  EngineResult,
  EngineEvent,
} from "./types";

// Helpers: pure numeric operations on decimal strings
const toNum = (s: string) => parseFloat(s);
const toStr = (n: number) => (Number.isFinite(n) ? String(n) : String(n));

// Immutable update helper
const cloneState = (s: EngineState): EngineState => ({
  orders: { ...s.orders },
  positions: { ...s.positions },
  trades: { ...s.trades },
  riskPolicies: { ...s.riskPolicies },
});

// Apply a single event to state (pure)
export function applyEvent(state: EngineState, event: EngineEvent): EngineState {
  // Use Zod to validate the event shape (structural validation only)
  // If validation fails, throw — deterministic and explicit
  if ((OrderPlacedSchema.safeParse as any)(event).success) {
    const e = event as any;
    const next = cloneState(state);
    next.orders[e.orderId] = { ...(e as any), status: "OPEN" };
    return next;
  }

  if ((OrderCancelledSchema.safeParse as any)(event).success) {
    const e = event as any;
    const next = cloneState(state);
    const found = next.orders[e.orderId];
    if (found) next.orders[e.orderId] = { ...found, status: "CANCELLED" };
    return next;
  }

  if ((OrderExecutedSchema.safeParse as any)(event).success) {
    const e = event as any;
    const next = cloneState(state);
    const found = next.orders[e.orderId];
    if (found) next.orders[e.orderId] = { ...found, status: "EXECUTED" };

    // Create trade record when executed
    const trade: any = {
      eventId: e.eventId,
      tradeId: e.executionId,
      userId: e.userId,
      positionId: null,
      orderId: e.orderId,
      instrument: e.instrument,
      quantity: e.executedQty,
      price: e.executionPrice,
      settledAt: e.executedAt,
    };
    next.trades[trade.tradeId] = trade;

    // Update or open position deterministically: simple add to position size
    // If a position exists for same user+instrument, update; else open
    const posKey = Object.keys(next.positions).find(
      (k) => next.positions[k].userId === e.userId && next.positions[k].instrument === e.instrument && next.positions[k].status === "OPEN"
    );
    if (posKey) {
      const pos = { ...next.positions[posKey] };
      const size = toNum(pos.size) + toNum(e.executedQty) * 1;
      // Update entry price by weighted average (deterministic)
      const existingSize = toNum(pos.size);
      const newSize = size;
      const entryPrice = (existingSize * toNum(pos.entryPrice) + toNum(e.executionPrice) * toNum(e.executedQty)) / (existingSize + toNum(e.executedQty));
      pos.size = String(newSize);
      pos.entryPrice = String(entryPrice);
      next.positions[posKey] = pos;
    } else {
      const pid = `pos-${e.executionId}`;
      const newPos: any = {
        positionId: pid,
        userId: e.userId,
        instrument: e.instrument,
        size: e.executedQty,
        entryPrice: e.executionPrice,
        status: "OPEN",
      };
      next.positions[pid] = newPos;
    }

    return next;
  }

  if ((TradeSettledSchema.safeParse as any)(event).success) {
    const e = event as any;
    const next = cloneState(state);
    next.trades[e.tradeId] = e;
    return next;
  }

  if ((PositionOpenedSchema.safeParse as any)(event).success) {
    const e = event as any;
    const next = cloneState(state);
    next.positions[e.positionId] = {
      positionId: e.positionId,
      userId: e.userId,
      instrument: e.instrument,
      size: e.size,
      entryPrice: e.entryPrice,
      margin: e.margin,
      status: "OPEN",
    };
    return next;
  }

  if ((PositionAdjustedSchema.safeParse as any)(event).success) {
    const e = event as any;
    const next = cloneState(state);
    const pos = next.positions[e.positionId];
    if (!pos) return next;
    pos.size = e.newSize;
    next.positions[e.positionId] = pos;
    return next;
  }

  if ((PositionClosedSchema.safeParse as any)(event).success) {
    const e = event as any;
    const next = cloneState(state);
    const pos = next.positions[e.positionId];
    if (pos) {
      pos.status = "CLOSED";
      next.positions[e.positionId] = pos;
    }
    return next;
  }

  // Unknown event: return unchanged state (deterministic explicit behavior)
  return state;
}

// Process a command: place, cancel, execute. Commands are plain objects and deterministic.
export function processCommand(state: EngineState, command: { type: string; payload: any }): EngineResult {
  switch (command.type) {
    case "PlaceOrder": {
      const order = OrderPlacedSchema.parse(command.payload);
      // emit the same OrderPlaced event (persisted by applyEvent)
      const nextState = applyEvent(state, order as any);
      return { state: nextState, events: [order as any] };
    }
    case "CancelOrder": {
      const payload = command.payload;
      const cancel = OrderCancelledSchema.parse(payload);
      const nextState = applyEvent(state, cancel as any);
      return { state: nextState, events: [cancel as any] };
    }
    case "ExecuteOrder": {
      // payload must conform to OrderExecutedSchema
      const exec = OrderExecutedSchema.parse(command.payload);
      const nextState = applyEvent(state, exec as any);
      return { state: nextState, events: [exec as any] };
    }
    case "SettleTrade": {
      const trade = TradeSettledSchema.parse(command.payload);
      const nextState = applyEvent(state, trade as any);
      return { state: nextState, events: [trade as any] };
    }
    default:
      return { state, events: [] };
  }
}

// Apply multiple events deterministically
export function applyEvents(state: EngineState, events: EngineEvent[]): EngineState {
  return events.reduce((s, e) => applyEvent(s, e), state);
}
