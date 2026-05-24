/** Mock KPI и операционные данные для Storybook/tests (T-007). */

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

export const mockHallLoads: import("./types").HallLoadRow[] = [
  { id: "1", label: "Парная", percent: 82 },
  { id: "2", label: "VIP", percent: 71 },
  { id: "3", label: "Сеновал", percent: 88 },
  { id: "4", label: "Хамам", percent: 65 },
  { id: "total", label: "Итого (средняя)", percent: 77, isTotal: true },
];

export const mockRevenuePeriods: import("./types").RevenuePeriodMetric[] = [
  {
    id: "day",
    label: "Выручка за день",
    value: "196",
    suffix: "тыс ₽",
    delta: { label: "+12% к прошлому", trend: "up" },
    hint: "Касса и предоплаты за сегодня",
  },
  {
    id: "week",
    label: "Выручка за неделю",
    value: "1,12",
    suffix: "млн ₽",
    delta: { label: "+8% к прошлому", trend: "up" },
    hint: "Сумма за последние 7 календарных дней",
  },
  {
    id: "month",
    label: "Выручка за месяц",
    value: "2,4",
    suffix: "млн ₽",
    delta: { label: "+5% к прошлому", trend: "up" },
    hint: "С начала текущего месяца",
  },
];

export const mockMargin: import("./types").MarginSummary = {
  overallPercent: 34.2,
  delta: { label: "−1,2 п.п.", trend: "down" },
  hint: "Валовая маржа по выручке и COGS за день",
  byService: [
    {
      serviceId: "bar",
      serviceName: "Травяной чай премиум",
      marginPercent: 19.2,
      revenue: 5200,
      belowThreshold: true,
    },
    {
      serviceId: "ham",
      serviceName: "Хамам + пилинг",
      marginPercent: 35.8,
      revenue: 19000,
      belowThreshold: true,
    },
    {
      serviceId: "par",
      serviceName: "Классический пар",
      marginPercent: 58.2,
      revenue: 85000,
      belowThreshold: false,
    },
  ],
};

export const mockInventoryAlerts: import("./types").InventoryAlertsSummary = {
  count: 3,
  criticalCount: 2,
  hint: "Пороги FIFO и срок годности",
};

export const mockCriticalAlerts: import("./types").CriticalAlert[] = [
  {
    id: "alert-1",
    severity: "high",
    title: "Низкая маржа: Травяной чай премиум",
    description: "Маржа 19,2% — ниже порога 40%.",
    timeLabel: "сегодня",
  },
  {
    id: "alert-2",
    severity: "high",
    title: "Низкий остаток: пихта премиум",
    description: "Остаток 18 кг при норме 40 кг.",
    timeLabel: "45 мин назад",
  },
];

export const mockShiftChecklists: import("./types").ShiftChecklistsSummary = {
  completed: 5,
  total: 9,
  groups: [
    {
      id: "par",
      hallName: "Парная",
      title: "Открытие смены — Парная",
      items: [
        { id: "p1", label: "Проверка температуры печи", completed: true },
        { id: "p2", label: "Запас пихты в зале", completed: true },
        { id: "p3", label: "Вентиляция и гидромет", completed: true },
      ],
    },
    {
      id: "vip",
      hallName: "VIP",
      title: "Открытие смены — VIP",
      items: [
        { id: "v1", label: "Подготовка VIP-ложа", completed: true },
        { id: "v2", label: "Проверка массажного кабинета", completed: false },
        { id: "v3", label: "Мини-бар и расходники", completed: false },
      ],
    },
    {
      id: "sen",
      hallName: "Сеновал",
      title: "Склад и сеновал",
      items: [
        { id: "s1", label: "Остаток сена на полу", completed: true },
        { id: "s2", label: "Влажность сеновала", completed: false },
        { id: "s3", label: "Инвентаризация веток", completed: false },
      ],
    },
  ],
};

export const mockTodayOperations: import("./types").TodayOperationRow[] = [
  {
    id: "yield",
    label: "Загрузка залов (итого)",
    value: "77%",
    note: "Цель 60% — в норме",
  },
  {
    id: "avg-session",
    label: "Средняя длительность сеанса",
    value: "2 ч 15 мин",
    note: "По 12 активным броням",
  },
  {
    id: "kitchen-sync",
    label: "Синхронизация кухня / SPA",
    value: "8 слотов",
    note: "7 в пределах SLA",
  },
];

export const mockDashboardData: import("./types").DashboardData = {
  hallLoads: mockHallLoads,
  revenuePeriods: mockRevenuePeriods,
  margin: mockMargin,
  inventoryAlerts: mockInventoryAlerts,
  alerts: mockCriticalAlerts,
  operations: mockTodayOperations,
  shiftChecklists: mockShiftChecklists,
};
