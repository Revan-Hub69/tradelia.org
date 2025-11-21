/**
 * Type definitions for Dashboard modules
 * FASE 2: TypeScript Migration - Gradual
 */

export interface Report {
  id: string;
  ticker: string;
  company: string | null;
  timestamp: string;
  reportUrl: string;
}

export interface DashboardState {
  reports: Report[];
  filteredReports: Report[];
  currentModule: string | null;
}

export type ModuleId =
  | "overview"
  | "reports"
  | "education"
  | "access"
  | "on-demand"
  | "community"
  | "frameworks"
  | "requests-history"
  | "notifications"
  | "settings"
  | "resources";

export interface ModuleLoader {
  (moduleId: ModuleId): Promise<void> | void;
}
