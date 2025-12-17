import { z } from "zod";
import { UUIDSchema, DecimalSchema, TimestampSchema } from "./events";

export const PositionDirectionSchema = z.enum(["LONG", "SHORT"]);
export type PositionDirection = z.infer<typeof PositionDirectionSchema>;

export const PositionStateEnum = z.enum([
  "PENDING",
  "OPEN",
  "CLOSING",
  "CLOSED",
]);
export type PositionState = z.infer<typeof PositionStateEnum>;

export const CloseReasonSchema = z.enum([
  "TP_HIT",
  "SL_HIT",
  "MANUAL_CLOSE",
  "RISK_OVERRIDE",
  "SESSION_END",
]);
export type CloseReason = z.infer<typeof CloseReasonSchema>;

export const RiskMetricsSchema = z
  .object({
    exposure: DecimalSchema,
    exposurePercent: DecimalSchema,
    drawdownPercent: DecimalSchema,
    requiredMargin: DecimalSchema,
  })
  .strict();
export type RiskMetrics = z.infer<typeof RiskMetricsSchema>;

export const PositionSnapshotSchema = z
  .object({
    positionId: UUIDSchema,
    symbol: z.string().min(1),
    direction: PositionDirectionSchema,
    entryPrice: DecimalSchema,
    entryTime: TimestampSchema,
    currentSize: DecimalSchema.refine((val) => {
      const num = parseFloat(val);
      return num >= 0;
    }, "currentSize must be >= 0"),
    initialSize: DecimalSchema,
    stopLoss: DecimalSchema,
    takeProfit: DecimalSchema,
    openPnL: DecimalSchema.optional(),
    closedPnL: DecimalSchema.optional(),
    closeTime: TimestampSchema.optional(),
    closePrice: DecimalSchema.optional(),
    closeReason: CloseReasonSchema.optional(),
    state: PositionStateEnum,
    riskMetrics: RiskMetricsSchema,
    aggregateVersion: z.number().int().positive(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.state === "CLOSED" && !data.closedPnL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["closedPnL"],
        message: "closedPnL is required when state is CLOSED",
      });
    }

    if (data.state === "CLOSED" && !data.closeTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["closeTime"],
        message: "closeTime is required when state is CLOSED",
      });
    }

    if (
      data.direction === "LONG" &&
      parseFloat(data.stopLoss) <= parseFloat(data.entryPrice)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stopLoss"],
        message: "For LONG positions, stopLoss must be > entryPrice",
      });
    }

    if (
      data.direction === "SHORT" &&
      parseFloat(data.stopLoss) >= parseFloat(data.entryPrice)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stopLoss"],
        message: "For SHORT positions, stopLoss must be < entryPrice",
      });
    }

    if (
      data.direction === "LONG" &&
      parseFloat(data.takeProfit) <= parseFloat(data.entryPrice)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["takeProfit"],
        message: "For LONG positions, takeProfit must be > entryPrice",
      });
    }

    if (
      data.direction === "SHORT" &&
      parseFloat(data.takeProfit) >= parseFloat(data.entryPrice)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["takeProfit"],
        message: "For SHORT positions, takeProfit must be < entryPrice",
      });
    }

    if (data.state !== "CLOSED" && parseFloat(data.currentSize) === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentSize"],
        message:
          "currentSize cannot be 0 unless position is in CLOSED state",
      });
    }
  });
export type PositionSnapshot = z.infer<typeof PositionSnapshotSchema>;

export const PositionTransitionSchema = z
  .object({
    fromState: PositionStateEnum,
    toState: PositionStateEnum,
    eventType: z.string().min(1),
    requiredConditions: z.array(z.string()).optional(),
  })
  .strict();
export type PositionTransition = z.infer<typeof PositionTransitionSchema>;

export const ValidPositionTransitionsSchema = z.record(
  z.array(
    z.object({
      to: PositionStateEnum,
      event: z.string(),
    })
  )
);
export type ValidPositionTransitions = z.infer<
  typeof ValidPositionTransitionsSchema
>;

export const PositionTransitionRulesSchema = z
  .object({
    PENDING: z.array(
      z.object({
        to: z.literal("OPEN"),
        event: z.literal("order_executed"),
        condition: z.literal("price <= bid/ask AND risk_check_passes"),
      })
    ),
    OPEN: z.array(
      z.union([
        z.object({
          to: z.literal("OPEN"),
          event: z.literal("modify_sl"),
          condition: z.literal("new_SL_tighter_than_old"),
        }),
        z.object({
          to: z.literal("OPEN"),
          event: z.literal("modify_tp"),
          condition: z.literal("TP_valid_direction"),
        }),
        z.object({
          to: z.literal("OPEN"),
          event: z.literal("modify_size"),
          condition: z.literal("new_size >= 0"),
        }),
        z.object({
          to: z.literal("CLOSING"),
          event: z.literal("close_order_submitted"),
          condition: z.literal("always"),
        }),
      ])
    ),
    CLOSING: z.array(
      z.object({
        to: z.literal("CLOSED"),
        event: z.literal("close_executed"),
        condition: z.literal("price_cleared"),
      })
    ),
    CLOSED: z.array(z.never()),
  })
  .strict();
export type PositionTransitionRules = z.infer<
  typeof PositionTransitionRulesSchema
>;

export const ImmutabilityConstraintSchema = z.object({
  positionId: z.object({
    mutable: z.literal(false),
    description: z.literal("Immutable, univoco"),
  }),
  symbol: z.object({
    mutable: z.literal(false),
    description: z.literal("Immutable, defined at creation"),
  }),
  direction: z.object({
    mutable: z.literal(false),
    description: z.literal(
      "Immutable, does not change after OPEN state"
    ),
  }),
  entryPrice: z.object({
    mutable: z.literal(false),
    description: z.literal("Immutable, not recalibrated"),
  }),
  entryTime: z.object({
    mutable: z.literal(false),
    description: z.literal("Immutable, exact timestamp"),
  }),
  initialSize: z.object({
    mutable: z.literal(false),
    description: z.literal("Immutable, captured at entry"),
  }),
  closedPnL: z.object({
    mutable: z.literal(false),
    description: z.literal("Immutable after CLOSED state"),
  }),
  currentSize: z.object({
    mutable: z.literal(true),
    description: z.literal("Mutable via PartialClose event"),
  }),
  stopLoss: z.object({
    mutable: z.literal(true),
    constraint: z.literal("always_tighter"),
    description: z.literal(
      "Can only move toward profit (never loose)"
    ),
  }),
  takeProfit: z.object({
    mutable: z.literal(true),
    constraint: z.literal("valid_direction"),
    description: z.literal("Must remain valid for direction"),
  }),
  state: z.object({
    mutable: z.literal(true),
    constraint: z.literal("FSM_only"),
    description: z.literal("Only through valid state transitions"),
  }),
});
export type ImmutabilityConstraint = z.infer<
  typeof ImmutabilityConstraintSchema
>;
