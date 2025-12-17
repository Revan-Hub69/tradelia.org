import { z } from "zod";
import { DecimalSchema, UUIDSchema } from "./events";

export const DailyLossLimitGateSchema = z
  .object({
    gateName: z.literal("DAILY_LOSS_LIMIT"),
    dailyMaxLoss: DecimalSchema,
    currentSessionLoss: DecimalSchema,
    threshold: DecimalSchema,
    isOpen: z.boolean(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const maxLoss = parseFloat(data.dailyMaxLoss);
    const currentLoss = parseFloat(data.currentSessionLoss);
    const threshold = parseFloat(data.threshold);

    if (threshold < 0 || threshold > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["threshold"],
        message: "threshold must be between 0 and 1",
      });
    }

    const shouldBeOpen = currentLoss > maxLoss * threshold;
    if (data.isOpen === shouldBeOpen) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isOpen"],
        message: `Gate state inconsistent: currentLoss=${currentLoss}, threshold=${
          maxLoss * threshold
        }, shouldBeOpen=${shouldBeOpen}`,
      });
    }
  });
export type DailyLossLimitGate = z.infer<typeof DailyLossLimitGateSchema>;

export const ExposureLimitGateSchema = z
  .object({
    gateName: z.literal("EXPOSURE_LIMIT"),
    maxExposureUSD: DecimalSchema,
    maxExposurePercent: DecimalSchema,
    currentExposure: DecimalSchema,
    isOpen: z.boolean(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const maxExposure = parseFloat(data.maxExposureUSD);
    const currentExposure = parseFloat(data.currentExposure);

    if (currentExposure > maxExposure && data.isOpen) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isOpen"],
        message: `Gate violation: currentExposure=${currentExposure} exceeds maxExposure=${maxExposure}`,
      });
    }

    if (currentExposure <= maxExposure && !data.isOpen) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isOpen"],
        message: "Gate should be open when exposure within limits",
      });
    }
  });
export type ExposureLimitGate = z.infer<typeof ExposureLimitGateSchema>;

export const DrawdownLimitGateSchema = z
  .object({
    gateName: z.literal("DRAWDOWN_LIMIT"),
    sessionStartBalance: DecimalSchema,
    currentBalance: DecimalSchema,
    maxDDPercent: DecimalSchema,
    currentDDPercent: DecimalSchema,
    isOpen: z.boolean(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const startBalance = parseFloat(data.sessionStartBalance);
    const currBalance = parseFloat(data.currentBalance);
    const maxDD = parseFloat(data.maxDDPercent);
    const currDD = parseFloat(data.currentDDPercent);

    if (startBalance <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sessionStartBalance"],
        message: "sessionStartBalance must be > 0",
      });
    }

    const calculatedDD = ((startBalance - currBalance) / startBalance) * 100;
    if (Math.abs(calculatedDD - currDD) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentDDPercent"],
        message: `currentDDPercent mismatch: calculated=${calculatedDD}, provided=${currDD}`,
      });
    }

    const shouldBeOpen = currDD <= maxDD;
    if (data.isOpen === shouldBeOpen) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isOpen"],
        message: `Gate state inconsistent: currentDD=${currDD}%, maxDD=${maxDD}%`,
      });
    }
  });
export type DrawdownLimitGate = z.infer<typeof DrawdownLimitGateSchema>;

export const RiskRewardMinimumGateSchema = z
  .object({
    gateName: z.literal("RISK_REWARD_MINIMUM"),
    minimumRR: DecimalSchema,
    currentRR: DecimalSchema,
    isOpen: z.boolean(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const minRR = parseFloat(data.minimumRR);
    const currRR = parseFloat(data.currentRR);

    if (minRR <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["minimumRR"],
        message: "minimumRR must be > 0",
      });
    }

    const shouldBeOpen = currRR >= minRR;
    if (data.isOpen === shouldBeOpen) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isOpen"],
        message: `Gate state inconsistent: currentRR=${currRR}, minimumRR=${minRR}`,
      });
    }
  });
export type RiskRewardMinimumGate = z.infer<typeof RiskRewardMinimumGateSchema>;

export const RiskGateSchema = z.union([
  DailyLossLimitGateSchema,
  ExposureLimitGateSchema,
  DrawdownLimitGateSchema,
  RiskRewardMinimumGateSchema,
]);
export type RiskGate = z.infer<typeof RiskGateSchema>;

export const RiskGateEvaluationSchema = z
  .object({
    gateId: UUIDSchema,
    gateName: z.enum([
      "DAILY_LOSS_LIMIT",
      "EXPOSURE_LIMIT",
      "DRAWDOWN_LIMIT",
      "RISK_REWARD_MINIMUM",
    ]),
    isOpen: z.boolean(),
    reason: z.string().optional(),
    evaluatedAt: z.string().datetime({ offset: true }),
  })
  .strict();
export type RiskGateEvaluation = z.infer<typeof RiskGateEvaluationSchema>;

export const RiskPolicySchema = z
  .object({
    policyId: UUIDSchema,
    dailyMaxLoss: DecimalSchema,
    exposureLimitUSD: DecimalSchema,
    exposureLimitPercent: DecimalSchema,
    maxDrawdownPercent: DecimalSchema,
    minRiskRewardRatio: DecimalSchema,
    gates: z.array(RiskGateSchema),
  })
  .strict()
  .superRefine((data, ctx) => {
    const minRR = parseFloat(data.minRiskRewardRatio);
    if (minRR <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["minRiskRewardRatio"],
        message: "minRiskRewardRatio must be > 0",
      });
    }

    const maxDD = parseFloat(data.maxDrawdownPercent);
    if (maxDD <= 0 || maxDD > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxDrawdownPercent"],
        message: "maxDrawdownPercent must be between 0 and 100",
      });
    }

    const exposureLimit = parseFloat(data.exposureLimitUSD);
    if (exposureLimit <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exposureLimitUSD"],
        message: "exposureLimitUSD must be > 0",
      });
    }
  });
export type RiskPolicy = z.infer<typeof RiskPolicySchema>;

export const RiskRewardCalculationSchema = z
  .object({
    entryPrice: DecimalSchema,
    stopLoss: DecimalSchema,
    takeProfit: DecimalSchema,
    direction: z.enum(["LONG", "SHORT"]),
  })
  .strict()
  .superRefine((data, ctx) => {
    const entry = parseFloat(data.entryPrice);
    const sl = parseFloat(data.stopLoss);
    const tp = parseFloat(data.takeProfit);

    if (data.direction === "LONG") {
      if (sl >= entry) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stopLoss"],
          message: "For LONG: stopLoss must be < entryPrice",
        });
      }
      if (tp <= entry) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["takeProfit"],
          message: "For LONG: takeProfit must be > entryPrice",
        });
      }
    } else {
      if (sl <= entry) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stopLoss"],
          message: "For SHORT: stopLoss must be > entryPrice",
        });
      }
      if (tp >= entry) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["takeProfit"],
          message: "For SHORT: takeProfit must be < entryPrice",
        });
      }
    }
  });
export type RiskRewardCalculation = z.infer<typeof RiskRewardCalculationSchema>;
