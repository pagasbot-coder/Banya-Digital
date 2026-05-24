/** Mock KPI и операционные данные для Storybook/tests (T-003). */

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

export const mockDashboardKpis: import("./types").DashboardKpiMetric[] = [
  {
    id: "hall_load",
    label: "Загрузка залов",
    value: "78",
    suffix: "%",
    delta: { label: "+6% к вчера", trend: "up" },
    hint: "Средняя по 4 залам за смену",
  },
  {
    id: "daily_revenue",
    label: "Выручка за день",
    value: "1,24",
    suffix: "млн ₽",
    delta: { label: "+12% к плану", trend: "up" },
    hint: "Касса + предоплаты программ",
  },
  {
    id: "margin",
    label: "Маржа",
    value: "34",
    suffix: "%",
    delta: { label: "−1,2 п.п.", trend: "down" },
    hint: "Валовая по услугам и бару",
  },
  {
    id: "inventory_alerts",
    label: "Алерты склада",
    value: "3",
    delta: { label: "2 критичных", trend: "neutral" },
    hint: "Пороги FIFO и срок годности",
  },
];

export const mockCriticalAlerts: import("./types").CriticalAlert[] = [
  {
    id: "alert-1",
    severity: "high",
    title: "Простой зала «Парная»",
    description:
      "Конфликт тайминга: пересечение программы 14:00–16:00 с техобслуживанием.",
    timeLabel: "12 мин назад",
  },
  {
    id: "alert-2",
    severity: "high",
    title: "Низкий остаток: пихта премиум",
    description: "Остаток 18 кг при норме 40 кг. Прогноз исчерпания — 2 смены.",
    timeLabel: "45 мин назад",
  },
  {
    id: "alert-3",
    severity: "medium",
    title: "Задержка кухни → SPA",
    description: "Обеденный слот +15 мин для программы «Детокс выходного».",
    timeLabel: "1 ч назад",
  },
];

export const mockTodayOperations: import("./types").TodayOperationRow[] = [
  {
    id: "yield",
    label: "Yield по залам",
    value: "92%",
    note: "Цель 90% — в норме",
  },
  {
    id: "avg-session",
    label: "Средняя длительность сеанса",
    value: "2 ч 40 мин",
    note: "По 28 активным броням",
  },
  {
    id: "kitchen-sync",
    label: "Синхронизация кухня / SPA",
    value: "3 слота",
    note: "2 в пределах SLA, 1 с задержкой",
  },
  {
    id: "checklists",
    label: "Чеклисты смены",
    value: "8 / 10",
    note: "Открытые: зал VIP, склад сеновал",
  },
];
