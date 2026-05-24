/** Контракт данных dashboard (UI + серверные агрегаты). */

export type KpiTrend = "up" | "down" | "neutral";

export type HallLoadRow = {
  id: string;
  label: string;
  percent: number;
  /** Средняя по всем залам — отдельная строка в UI */
  isTotal?: boolean;
};

export type RevenuePeriodId = "day" | "week" | "month";

export type RevenuePeriodMetric = {
  id: RevenuePeriodId;
  label: string;
  value: string;
  suffix: string;
  delta?: { label: string; trend: KpiTrend };
  hint: string;
};

export type ServiceMarginRow = {
  serviceId: string;
  serviceName: string;
  marginPercent: number;
  revenue: number;
  /** Маржа ниже порога 40% */
  belowThreshold: boolean;
};

export type MarginSummary = {
  overallPercent: number;
  delta?: { label: string; trend: KpiTrend };
  hint: string;
  byService: ServiceMarginRow[];
};

export type InventoryAlertsSummary = {
  count: number;
  criticalCount: number;
  hint: string;
};

/** @deprecated Используйте секции hallLoads / revenuePeriods; оставлено для mock. */
export type DashboardKpiMetric = {
  id: "hall_load" | "daily_revenue" | "margin" | "inventory_alerts";
  label: string;
  value: string;
  suffix?: string;
  delta?: { label: string; trend: KpiTrend };
  hint: string;
};

export type CriticalAlert = {
  id: string;
  severity: "high" | "medium";
  title: string;
  description: string;
  timeLabel: string;
};

export type TodayOperationRow = {
  id: string;
  label: string;
  value: string;
  note?: string;
};

export type DashboardData = {
  hallLoads: HallLoadRow[];
  revenuePeriods: RevenuePeriodMetric[];
  margin: MarginSummary;
  inventoryAlerts: InventoryAlertsSummary;
  alerts: CriticalAlert[];
  operations: TodayOperationRow[];
};

export type DashboardEmptyState = {
  kind: "empty";
  message: string;
};

export type DashboardResult = DashboardData | DashboardEmptyState;

export function isDashboardEmpty(
  result: DashboardResult
): result is DashboardEmptyState {
  return "kind" in result && result.kind === "empty";
}
