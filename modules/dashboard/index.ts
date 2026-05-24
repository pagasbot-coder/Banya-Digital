/** Dashboard module — агрегация KPI из finance + operations. */
export type DashboardKpi = "hall_load" | "margin" | "inventory_alert";

export {
  mockCriticalAlerts,
  mockDashboardKpis,
  mockTodayOperations,
} from "./mock-kpis";
export type {
  CriticalAlert,
  DashboardData,
  DashboardEmptyState,
  DashboardKpiMetric,
  DashboardResult,
  KpiTrend,
  TodayOperationRow,
} from "./types";
export { isDashboardEmpty } from "./types";
export { getDashboardData } from "./services/get-dashboard-data";
