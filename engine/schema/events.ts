import { z } from "zod";

export const UUIDSchema = z.string().uuid();
export const TimestampSchema = z.string().datetime({ offset: true });
export const DecimalSchema = z.string().regex(/^\d+(\.\d{1,10})?$/);

export const EventActorSchema = z.enum([
  "SYSTEM",
  "TRADER",
  "API",
  "RISK_ENGINE",
]);
export type EventActor = z.infer<typeof EventActorSchema>;

export const EventTypeSchema = z.enum([
  "OrderPlaced",
  "OrderExecuted",
  "OrderCancelled",
  "PositionOpened",
  "PositionAdjusted",
  "PartialClose",
  "PositionClosed",
  "TradeSettled",
  "OrderRejected",
  "RiskGateTriggered",
  "ExposureViolation",
  "DDPercentageExceeded",
  "LossLimitBreached",
  "MarketDataSnapshot",
  "VolumeSpike",
  "SpreadWiden",
  "SessionStarted",
  "SessionEnded",
  "ConfigurationUpdated",
]);
export type EventType = z.infer<typeof EventTypeSchema>;

export const EventMetadataSchema = z
  .object({
    hash: z.string().optional(),
    signature: z.string().optional(),
    riskApprovalId: UUIDSchema.optional(),
    actor: EventActorSchema.optional(),
  })
  .strict()
  .optional();
export type EventMetadata = z.infer<typeof EventMetadataSchema>;

export const BaseEventSchema = z
  .object({
    eventId: UUIDSchema,
    timestamp: TimestampSchema,
    eventType: EventTypeSchema,
    actorId: z.string().min(1),
    aggregateId: UUIDSchema,
    aggregateVersion: z.number().int().positive(),
    metadata: EventMetadataSchema,
  })
  .strict();
export type BaseEvent = z.infer<typeof BaseEventSchema>;

export const OrderPlacedPayloadSchema = z
  .object({
    orderId: UUIDSchema,
    symbol: z.string().min(1),
    side: z.enum(["BUY", "SELL"]),
    quantity: DecimalSchema,
    price: DecimalSchema,
    orderType: z.enum(["MARKET", "LIMIT", "STOP", "STOP_LIMIT"]),
  })
  .strict();
export type OrderPlacedPayload = z.infer<typeof OrderPlacedPayloadSchema>;

export const OrderPlacedSchema = BaseEventSchema.extend({
  eventType: z.literal("OrderPlaced"),
  payload: OrderPlacedPayloadSchema,
});
export type OrderPlaced = z.infer<typeof OrderPlacedSchema>;

export const OrderExecutedPayloadSchema = z
  .object({
    orderId: UUIDSchema,
    executedPrice: DecimalSchema,
    executedQuantity: DecimalSchema,
  })
  .strict();
export type OrderExecutedPayload = z.infer<typeof OrderExecutedPayloadSchema>;

export const OrderExecutedSchema = BaseEventSchema.extend({
  eventType: z.literal("OrderExecuted"),
  payload: OrderExecutedPayloadSchema,
});
export type OrderExecuted = z.infer<typeof OrderExecutedSchema>;

export const OrderCancelledPayloadSchema = z
  .object({
    orderId: UUIDSchema,
    reason: z.string().optional(),
  })
  .strict();
export type OrderCancelledPayload = z.infer<typeof OrderCancelledPayloadSchema>;

export const OrderCancelledSchema = BaseEventSchema.extend({
  eventType: z.literal("OrderCancelled"),
  payload: OrderCancelledPayloadSchema,
});
export type OrderCancelled = z.infer<typeof OrderCancelledSchema>;

export const PositionOpenedPayloadSchema = z
  .object({
    symbol: z.string().min(1),
    direction: z.enum(["LONG", "SHORT"]),
    entryPrice: DecimalSchema,
    size: DecimalSchema,
    stopLoss: DecimalSchema,
    takeProfit: DecimalSchema,
  })
  .strict();
export type PositionOpenedPayload = z.infer<typeof PositionOpenedPayloadSchema>;

export const PositionOpenedSchema = BaseEventSchema.extend({
  eventType: z.literal("PositionOpened"),
  payload: PositionOpenedPayloadSchema,
});
export type PositionOpened = z.infer<typeof PositionOpenedSchema>;

export const PositionModifiedPayloadSchema = z
  .object({
    newSize: DecimalSchema.optional(),
    newStopLoss: DecimalSchema.optional(),
    newTakeProfit: DecimalSchema.optional(),
  })
  .strict()
  .refine(
    (obj) =>
      obj.newSize !== undefined ||
      obj.newStopLoss !== undefined ||
      obj.newTakeProfit !== undefined,
    "At least one modification field must be provided"
  );
export type PositionModifiedPayload = z.infer<typeof PositionModifiedPayloadSchema>;

export const PositionModifiedSchema = BaseEventSchema.extend({
  eventType: z.literal("PositionModified"),
  payload: PositionModifiedPayloadSchema,
});
export type PositionModified = z.infer<typeof PositionModifiedSchema>;

export const PositionAdjustedPayloadSchema = z
  .object({
    adjustmentType: z.enum(["RESIZE", "STOP_LOSS", "TAKE_PROFIT"]),
    oldValue: DecimalSchema.optional(),
    newValue: DecimalSchema,
  })
  .strict();
export type PositionAdjustedPayload = z.infer<typeof PositionAdjustedPayloadSchema>;

export const PositionAdjustedSchema = BaseEventSchema.extend({
  eventType: z.literal("PositionAdjusted"),
  payload: PositionAdjustedPayloadSchema,
});
export type PositionAdjusted = z.infer<typeof PositionAdjustedSchema>;

export const PartialClosePayloadSchema = z
  .object({
    closedSize: DecimalSchema,
    exitPrice: DecimalSchema,
    pnl: DecimalSchema,
  })
  .strict();
export type PartialClosePayload = z.infer<typeof PartialClosePayloadSchema>;

export const PartialCloseSchema = BaseEventSchema.extend({
  eventType: z.literal("PartialClose"),
  payload: PartialClosePayloadSchema,
});
export type PartialClose = z.infer<typeof PartialCloseSchema>;

export const PositionClosedPayloadSchema = z
  .object({
    exitPrice: DecimalSchema,
    closedPnL: DecimalSchema,
    reason: z.enum([
      "TP_HIT",
      "SL_HIT",
      "MANUAL_CLOSE",
      "RISK_OVERRIDE",
      "SESSION_END",
    ]),
  })
  .strict();
export type PositionClosedPayload = z.infer<typeof PositionClosedPayloadSchema>;

export const PositionClosedSchema = BaseEventSchema.extend({
  eventType: z.literal("PositionClosed"),
  payload: PositionClosedPayloadSchema,
});
export type PositionClosed = z.infer<typeof PositionClosedSchema>;

export const TradeSettledPayloadSchema = z
  .object({
    tradeId: UUIDSchema,
    symbol: z.string().min(1),
    grossPnL: DecimalSchema,
    commission: DecimalSchema,
    netPnL: DecimalSchema,
    settledAt: TimestampSchema,
  })
  .strict();
export type TradeSettledPayload = z.infer<typeof TradeSettledPayloadSchema>;

export const TradeSettledSchema = BaseEventSchema.extend({
  eventType: z.literal("TradeSettled"),
  payload: TradeSettledPayloadSchema,
});
export type TradeSettled = z.infer<typeof TradeSettledSchema>;

export const OrderRejectedPayloadSchema = z
  .object({
    reason: z.string().min(1),
    rejectedData: z.record(z.unknown()).optional(),
  })
  .strict();
export type OrderRejectedPayload = z.infer<typeof OrderRejectedPayloadSchema>;

export const OrderRejectedSchema = BaseEventSchema.extend({
  eventType: z.literal("OrderRejected"),
  payload: OrderRejectedPayloadSchema,
});
export type OrderRejected = z.infer<typeof OrderRejectedSchema>;

export const RiskGateTriggeredPayloadSchema = z
  .object({
    gateName: z.enum([
      "DAILY_LOSS_LIMIT",
      "EXPOSURE_LIMIT",
      "DRAWDOWN_LIMIT",
      "RISK_REWARD_MINIMUM",
    ]),
    currentValue: DecimalSchema,
    threshold: DecimalSchema,
    message: z.string().min(1),
  })
  .strict();
export type RiskGateTriggeredPayload = z.infer<
  typeof RiskGateTriggeredPayloadSchema
>;

export const RiskGateTriggeredSchema = BaseEventSchema.extend({
  eventType: z.literal("RiskGateTriggered"),
  payload: RiskGateTriggeredPayloadSchema,
});
export type RiskGateTriggered = z.infer<typeof RiskGateTriggeredSchema>;

export const ExposureViolationPayloadSchema = z
  .object({
    currentExposure: DecimalSchema,
    maxExposure: DecimalSchema,
    attemptedSize: DecimalSchema,
  })
  .strict();
export type ExposureViolationPayload = z.infer<
  typeof ExposureViolationPayloadSchema
>;

export const ExposureViolationSchema = BaseEventSchema.extend({
  eventType: z.literal("ExposureViolation"),
  payload: ExposureViolationPayloadSchema,
});
export type ExposureViolation = z.infer<typeof ExposureViolationSchema>;

export const DDPercentageExceededPayloadSchema = z
  .object({
    currentDD: DecimalSchema,
    maxDD: DecimalSchema,
    sessionStartBalance: DecimalSchema,
    currentBalance: DecimalSchema,
  })
  .strict();
export type DDPercentageExceededPayload = z.infer<
  typeof DDPercentageExceededPayloadSchema
>;

export const DDPercentageExceededSchema = BaseEventSchema.extend({
  eventType: z.literal("DDPercentageExceeded"),
  payload: DDPercentageExceededPayloadSchema,
});
export type DDPercentageExceeded = z.infer<typeof DDPercentageExceededSchema>;

export const LossLimitBreachedPayloadSchema = z
  .object({
    currentSessionLoss: DecimalSchema,
    dailyMaxLoss: DecimalSchema,
  })
  .strict();
export type LossLimitBreachedPayload = z.infer<
  typeof LossLimitBreachedPayloadSchema
>;

export const LossLimitBreachedSchema = BaseEventSchema.extend({
  eventType: z.literal("LossLimitBreached"),
  payload: LossLimitBreachedPayloadSchema,
});
export type LossLimitBreached = z.infer<typeof LossLimitBreachedSchema>;

export const MarketDataSnapshotPayloadSchema = z
  .object({
    symbol: z.string().min(1),
    lastPrice: DecimalSchema,
    bid: DecimalSchema,
    ask: DecimalSchema,
    volume: DecimalSchema,
  })
  .strict();
export type MarketDataSnapshotPayload = z.infer<
  typeof MarketDataSnapshotPayloadSchema
>;

export const MarketDataSnapshotSchema = BaseEventSchema.extend({
  eventType: z.literal("MarketDataSnapshot"),
  payload: MarketDataSnapshotPayloadSchema,
});
export type MarketDataSnapshot = z.infer<typeof MarketDataSnapshotSchema>;

export const VolumeSpikePayloadSchema = z
  .object({
    symbol: z.string().min(1),
    volume: DecimalSchema,
    volumeAverage: DecimalSchema,
    spikeFactor: DecimalSchema,
  })
  .strict();
export type VolumeSpikePayload = z.infer<typeof VolumeSpikePayloadSchema>;

export const VolumeSpikeSchema = BaseEventSchema.extend({
  eventType: z.literal("VolumeSpike"),
  payload: VolumeSpikePayloadSchema,
});
export type VolumeSpike = z.infer<typeof VolumeSpikeSchema>;

export const SpreadWidenPayloadSchema = z
  .object({
    symbol: z.string().min(1),
    spread: DecimalSchema,
    spreadAverage: DecimalSchema,
  })
  .strict();
export type SpreadWidenPayload = z.infer<typeof SpreadWidenPayloadSchema>;

export const SpreadWidenSchema = BaseEventSchema.extend({
  eventType: z.literal("SpreadWiden"),
  payload: SpreadWidenPayloadSchema,
});
export type SpreadWiden = z.infer<typeof SpreadWidenSchema>;

export const SessionStartedPayloadSchema = z
  .object({
    sessionId: UUIDSchema,
    startBalance: DecimalSchema,
  })
  .strict();
export type SessionStartedPayload = z.infer<typeof SessionStartedPayloadSchema>;

export const SessionStartedSchema = BaseEventSchema.extend({
  eventType: z.literal("SessionStarted"),
  payload: SessionStartedPayloadSchema,
});
export type SessionStarted = z.infer<typeof SessionStartedSchema>;

export const SessionEndedPayloadSchema = z
  .object({
    sessionId: UUIDSchema,
    endBalance: DecimalSchema,
    totalPnL: DecimalSchema,
  })
  .strict();
export type SessionEndedPayload = z.infer<typeof SessionEndedPayloadSchema>;

export const SessionEndedSchema = BaseEventSchema.extend({
  eventType: z.literal("SessionEnded"),
  payload: SessionEndedPayloadSchema,
});
export type SessionEnded = z.infer<typeof SessionEndedSchema>;

export const ConfigurationUpdatedPayloadSchema = z
  .object({
    configKey: z.string().min(1),
    oldValue: z.unknown().optional(),
    newValue: z.unknown(),
  })
  .strict();
export type ConfigurationUpdatedPayload = z.infer<
  typeof ConfigurationUpdatedPayloadSchema
>;

export const ConfigurationUpdatedSchema = BaseEventSchema.extend({
  eventType: z.literal("ConfigurationUpdated"),
  payload: ConfigurationUpdatedPayloadSchema,
});
export type ConfigurationUpdated = z.infer<typeof ConfigurationUpdatedSchema>;

export const CanonicalEventSchema = z.union([
  OrderPlacedSchema,
  OrderExecutedSchema,
  OrderCancelledSchema,
  PositionOpenedSchema,
  PositionModifiedSchema,
  PositionAdjustedSchema,
  PartialCloseSchema,
  PositionClosedSchema,
  TradeSettledSchema,
  OrderRejectedSchema,
  RiskGateTriggeredSchema,
  ExposureViolationSchema,
  DDPercentageExceededSchema,
  LossLimitBreachedSchema,
  MarketDataSnapshotSchema,
  VolumeSpikeSchema,
  SpreadWidenSchema,
  SessionStartedSchema,
  SessionEndedSchema,
  ConfigurationUpdatedSchema,
]);
export type CanonicalEvent = z.infer<typeof CanonicalEventSchema>;
