import type { StrategyType } from "@/lib/strategies/academic-strategies";

/**
 * Types and interfaces for Strategy Builder component
 */

export interface OptimizationResult {
  strategyId: StrategyType;
  parameters: Record<string, number>;
  keyValue?: number; // Optional - used for parameter optimization
  inSampleReturn: number;
  outOfSampleReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  calmarRatio: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  expectancy: number;
  isRobust: boolean;
  robustnessScore: number;
}

export interface WalkForwardWindow {
  inSampleStart: Date;
  inSampleEnd: Date;
  outOfSampleStart: Date;
  outOfSampleEnd: Date;
  bestStrategy: StrategyType;
  bestParameters: Record<string, number>;
  results: OptimizationResult[];
}

export interface SavedConfig {
  id: string;
  name: string;
  config: {
    selectedStrategies?: StrategyType[];
    selectedTimeframe?: string;
    strategyParams?: Record<StrategyType, Record<string, number>>;
    keyValueMin?: number;
    keyValueMax?: number;
    keyValueStep?: number;
    atrPeriodMin?: number;
    atrPeriodMax?: number;
    atrPeriodStep?: number;
    inSampleMonths?: number;
    outOfSampleMonths?: number;
    startDate?: string;
    endDate?: string;
    minRobustnessScore?: number;
    minProfitFactor?: number;
    minWinRate?: number;
    maxDrawdownThreshold?: number;
  };
  timestamp: Date;
}

export interface BestParameterStats {
  keyValue: number;
  strategyId?: StrategyType;
  windowsUsed: number;
  avgReturn: number;
  avgSharpe: number;
  avgCalmar: number;
  avgWinRate: number;
  avgProfitFactor: number;
  avgRobustness: number;
  avgMaxDD: number;
}
