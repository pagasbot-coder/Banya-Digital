/** Dashboard module — агрегация KPI из finance + operations. */
export type DashboardKpi = "hall_load" | "margin" | "inventory_alert";

export {
  mockCriticalAlerts,
  mockDashboardKpis,
  mockTodayOperations,
} from "./mock-kpis";
export type {
  CriticalAlert,
  DashboardKpiMetric,
  KpiTrend,
  TodayOperationRow,
} from "./mock-kpis";
