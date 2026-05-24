/** Контракт данных dashboard (UI + серверные агрегаты). */

export type KpiTrend = "up" | "down" | "neutral";

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
  metrics: DashboardKpiMetric[];
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
