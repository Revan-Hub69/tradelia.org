import type {
  OrderPlaced,
  OrderExecuted,
  OrderCancelled,
  PositionOpened,
  PositionAdjusted,
  PositionClosed,
  TradeSettled,
  RiskPolicy,
} from "../schema";

// Lightweight engine-side position representation
export type PositionState = {
  positionId: string;
  userId: string;
  instrument: string;
  size: string; // DecimalString
  entryPrice: string;
  margin?: string;
  status: "OPEN" | "CLOSED" | "LIQUIDATED";
  meta?: Record<string, unknown>;
};

export type OrderState = OrderPlaced & {
  status: "OPEN" | "EXECUTED" | "CANCELLED";
};

export type EngineState = {
  orders: Record<string, OrderState>;
  positions: Record<string, PositionState>;
  trades: Record<string, TradeSettled>;
  riskPolicies: Record<string, RiskPolicy>;
};

export type EngineEvent =
  | OrderPlaced
  | OrderExecuted
  | OrderCancelled
  | PositionOpened
  | PositionAdjusted
  | PositionClosed
  | TradeSettled;

export type EngineResult = {
  state: EngineState;
  events: EngineEvent[];
};
