/** Dashboard module — агрегация KPI из finance + operations. */
export type DashboardKpi = "hall_load" | "margin" | "inventory_alert";

export {
  mockCriticalAlerts,
  mockDashboardData,
  mockHallLoads,
  mockInventoryAlerts,
  mockMargin,
  mockRevenuePeriods,
  mockTodayOperations,
} from "./mock-kpis";
export type {
  CriticalAlert,
  DashboardData,
  DashboardEmptyState,
  DashboardKpiMetric,
  DashboardResult,
  HallLoadRow,
  InventoryAlertsSummary,
  MarginSummary,
  RevenuePeriodMetric,
  KpiTrend,
  TodayOperationRow,
} from "./types";
export { isDashboardEmpty } from "./types";
export { getDashboardData } from "./services/get-dashboard-data";
