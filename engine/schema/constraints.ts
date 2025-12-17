import { z } from "zod";
import { UUIDSchema, DecimalSchema, TimestampSchema } from "./events";

export const CapitalConstraintSchema = z
  .object({
    constraintType: z.literal("CAPITAL"),
    initialCapital: DecimalSchema,
    currentBalance: DecimalSchema,
    closedPnLSum: DecimalSchema,
    openPnLSum: DecimalSchema,
  })
  .strict()
  .superRefine((data, ctx) => {
    const initial = parseFloat(data.initialCapital);
    const current = parseFloat(data.currentBalance);
    const closedPnL = parseFloat(data.closedPnLSum);
    const openPnL = parseFloat(data.openPnLSum);

    const expectedBalance = initial + closedPnL + openPnL;
    if (Math.abs(current - expectedBalance) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentBalance"],
        message: `Balance mismatch: current=${current}, expected=${expectedBalance} (initial=${initial} + closedPnL=${closedPnL} + openPnL=${openPnL})`,
      });
    }

    if (initial <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["initialCapital"],
        message: "initialCapital must be > 0",
      });
    }
  });
export type CapitalConstraint = z.infer<typeof CapitalConstraintSchema>;

export const MarginConstraintSchema = z
  .object({
    constraintType: z.literal("MARGIN"),
    accountBalance: DecimalSchema,
    requiredMargin: DecimalSchema,
    availableFunds: DecimalSchema,
    leverageRatio: DecimalSchema,
    maxLeverage: DecimalSchema,
  })
  .strict()
  .superRefine((data, ctx) => {
    const balance = parseFloat(data.accountBalance);
    const required = parseFloat(data.requiredMargin);
    const available = parseFloat(data.availableFunds);
    const leverage = parseFloat(data.leverageRatio);
    const maxLeverage = parseFloat(data.maxLeverage);

    const expectedAvailable = balance - required;
    if (Math.abs(available - expectedAvailable) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["availableFunds"],
        message: `availableFunds mismatch: provided=${available}, calculated=${expectedAvailable}`,
      });
    }

    if (available < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["availableFunds"],
        message: "availableFunds must be >= 0 (CRITICAL INVARIANT)",
      });
    }

    if (leverage > maxLeverage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["leverageRatio"],
        message: `Leverage violation: ${leverage} exceeds max ${maxLeverage}`,
      });
    }
  });
export type MarginConstraint = z.infer<typeof MarginConstraintSchema>;

export const ConcurrencyConstraintSchema = z
  .object({
    constraintType: z.literal("CONCURRENCY"),
    positionId: UUIDSchema,
    currentVersion: z.number().int().positive(),
    expectedNextVersion: z.number().int().positive(),
    lastUpdateTime: TimestampSchema,
  })
  .strict()
  .superRefine((data, ctx) => {
    const nextVersion = data.expectedNextVersion;
    const currentVersion = data.currentVersion;

    if (nextVersion !== currentVersion + 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expectedNextVersion"],
        message: `Version gap detected: current=${currentVersion}, next=${nextVersion}. Gap not allowed.`,
      });
    }
  });
export type ConcurrencyConstraint = z.infer<typeof ConcurrencyConstraintSchema>;

export const EventLogImmutabilityConstraintSchema = z
  .object({
    constraintType: z.literal("EVENT_LOG_IMMUTABILITY"),
    eventId: UUIDSchema,
    isAppendOnly: z.boolean(),
    canBeModified: z.literal(false),
    canBeDeleted: z.literal(false),
    previousHash: z.string().regex(/^[a-f0-9]{64}$/).optional(),
    currentHash: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export type EventLogImmutabilityConstraint = z.infer<
  typeof EventLogImmutabilityConstraintSchema
>;

export const CausalOrderingConstraintSchema = z
  .object({
    constraintType: z.literal("CAUSAL_ORDERING"),
    eventAId: UUIDSchema,
    eventBId: UUIDSchema,
    eventATime: TimestampSchema,
    eventBTime: TimestampSchema,
    dependencyType: z.enum(["DIRECT", "INDIRECT"]),
  })
  .strict()
  .superRefine((data, ctx) => {
    const timeA = new Date(data.eventATime).getTime();
    const timeB = new Date(data.eventBTime).getTime();

    if (timeA >= timeB) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["eventBTime"],
        message: `Causal ordering violated: eventA(${data.eventATime}) must be strictly before eventB(${data.eventBTime})`,
      });
    }
  });
export type CausalOrderingConstraint = z.infer<
  typeof CausalOrderingConstraintSchema
>;

export const UniquePayloadConstraintSchema = z
  .object({
    constraintType: z.literal("UNIQUE_PAYLOAD"),
    eventId: UUIDSchema,
    payloadHash: z.string().regex(/^[a-f0-9]{64}$/),
    isDuplicate: z.boolean(),
  })
  .strict();
export type UniquePayloadConstraint = z.infer<
  typeof UniquePayloadConstraintSchema
>;

export const GlobalConstraintSchema = z.union([
  CapitalConstraintSchema,
  MarginConstraintSchema,
  ConcurrencyConstraintSchema,
  EventLogImmutabilityConstraintSchema,
  CausalOrderingConstraintSchema,
  UniquePayloadConstraintSchema,
]);
export type GlobalConstraint = z.infer<typeof GlobalConstraintSchema>;

export const ConstraintViolationSchema = z
  .object({
    violationId: UUIDSchema,
    constraintType: z.string().min(1),
    severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
    message: z.string().min(1),
    affectedEntityId: UUIDSchema.optional(),
    detectedAt: TimestampSchema,
  })
  .strict();
export type ConstraintViolation = z.infer<typeof ConstraintViolationSchema>;

export const AuditProofSchema = z
  .object({
    eventId: UUIDSchema,
    previousStateHash: z.string().regex(/^[a-f0-9]{64}$/),
    newStateHash: z.string().regex(/^[a-f0-9]{64}$/),
    signature: z.string().min(1),
    signatureValid: z.boolean(),
    riskApprovalId: UUIDSchema.optional(),
  })
  .strict();
export type AuditProof = z.infer<typeof AuditProofSchema>;

export const ImmutableAuditTrailSchema = z
  .object({
    trailId: UUIDSchema,
    aggregateId: UUIDSchema,
    events: z.array(
      z.object({
        eventId: UUIDSchema,
        timestamp: TimestampSchema,
        proof: AuditProofSchema,
      })
    ),
    isSealed: z.boolean(),
    sealedAt: TimestampSchema.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const events = data.events;

    if (events.length > 0) {
      for (let i = 1; i < events.length; i++) {
        const prev = new Date(events[i - 1].timestamp).getTime();
        const curr = new Date(events[i].timestamp).getTime();
        if (prev >= curr) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["events", i, "timestamp"],
            message: `Event ordering violated at index ${i}`,
          });
        }
      }
    }
  });
export type ImmutableAuditTrail = z.infer<typeof ImmutableAuditTrailSchema>;
