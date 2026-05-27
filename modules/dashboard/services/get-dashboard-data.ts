/**
 * Dashboard KPI и операционные агрегаты из PostgreSQL.
 *
 * hall_load: % по каждому залу + строка «Итого» (среднее).
 * revenue: день / неделя (7 дн.) / месяц (календарный).
 * margin: общая + разбивка по услугам; алерт при марже услуги < 40%.
 */
import { addDays, startOfDay, startOfMonth } from "@/lib/date-utils";
import { prisma } from "@/lib/db";
import { formatHallZoneLabel } from "@/lib/hall-zone";
import { getWeekPlanFact } from "@/modules/finance/services/get-week-plan-fact";
import type {
  CriticalAlert,
  DashboardResult,
  HallLoadRow,
  InventoryAlertsSummary,
  MarginSummary,
  RevenuePeriodMetric,
  ServiceMarginRow,
  ShiftChecklistsSummary,
  TodayOperationRow,
  WamzSummary,
} from "@/modules/dashboard/types";

const SHIFT_MINUTES = 480;
const INVENTORY_EXPIRY_DAYS = 7;
const MARGIN_ALERT_THRESHOLD = 40;
/** Целевая загрузка залов (итого), % — для KPI «Операции сегодня». */
const HALL_LOAD_TARGET_PERCENT = 60;
/** Цель пилота WAMZ: активных зон из 4. */
const WAMZ_PILOT_TARGET = 3;
const WAMZ_WINDOW_DAYS = 7;

function formatRelativeTime(from: Date): string {
  const diffMs = Date.now() - from.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} д назад`;
}

function formatRevenue(amount: number): { value: string; suffix: string } {
  if (amount >= 1_000_000) {
    return {
      value: (amount / 1_000_000).toFixed(2).replace(".", ","),
      suffix: "млн ₽",
    };
  }
  if (amount >= 1000) {
    return {
      value: Math.round(amount / 1000).toLocaleString("ru-RU"),
      suffix: "тыс ₽",
    };
  }
  return { value: Math.round(amount).toLocaleString("ru-RU"), suffix: "₽" };
}

type TrendResult = {
  label: string;
  trend: import("@/modules/dashboard/types").KpiTrend;
};

function computeTrend(current: number, previous: number): TrendResult {
  if (previous === 0) {
    return { label: "нет данных за прошлый период", trend: "neutral" };
  }
  const delta = current - previous;
  const pct = (delta / previous) * 100;
  const sign = delta >= 0 ? "+" : "";
  const trend: TrendResult["trend"] =
    Math.abs(pct) < 0.5 ? "neutral" : delta > 0 ? "up" : "down";
  return {
    label: `${sign}${pct.toFixed(0)}% к прошлому`,
    trend,
  };
}

function computeMarginTrend(current: number, previous: number): TrendResult {
  const delta = current - previous;
  const sign = delta >= 0 ? "+" : "−";
  const trend: TrendResult["trend"] =
    Math.abs(delta) < 0.3 ? "neutral" : delta > 0 ? "up" : "down";
  return {
    label: `${sign}${Math.abs(delta).toFixed(1).replace(".", ",")} п.п.`,
    trend,
  };
}

function marginPercent(revenue: number, cost: number): number {
  if (revenue <= 0) return 0;
  return ((revenue - cost) / revenue) * 100;
}

function hallLoadForBookings(
  hall: {
    capacity: number | null;
    bookings: { startsAt: Date; endsAt: Date; partySize: number }[];
  },
  businessDate: Date
): number {
  const capacity = hall.capacity ?? 1;
  const guestMinutes = hall.bookings.reduce((sum, b) => {
    const start = Math.max(b.startsAt.getTime(), businessDate.getTime());
    const end = Math.min(b.endsAt.getTime(), addDays(businessDate, 1).getTime());
    const minutes = Math.max(0, (end - start) / 60_000);
    return sum + minutes * b.partySize;
  }, 0);
  const maxMinutes = capacity * SHIFT_MINUTES;
  return Math.min(100, (guestMinutes / maxMinutes) * 100);
}

/** Загрузка по каждому активному залу + строка «Итого». */
async function buildHallLoads(businessDate: Date): Promise<HallLoadRow[]> {
  const halls = await prisma.hall.findMany({
    where: { isActive: true, capacity: { gt: 0 } },
    orderBy: { name: "asc" },
    include: {
      bookings: {
        where: {
          status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] },
          startsAt: { gte: businessDate, lt: addDays(businessDate, 1) },
        },
      },
    },
  });

  if (halls.length === 0) return [];

  const rows: HallLoadRow[] = halls.map((hall) => ({
    id: hall.id,
    label: hall.name,
    zoneLabel: formatHallZoneLabel(hall.zoneType),
    percent: Math.round(hallLoadForBookings(hall, businessDate)),
  }));

  const avg =
    rows.reduce((sum, r) => sum + r.percent, 0) / Math.max(rows.length, 1);

  rows.push({
    id: "total",
    label: "Итого (средняя)",
    percent: Math.round(avg),
    isTotal: true,
  });

  return rows;
}

async function sumRevenueBetween(
  startInclusive: Date,
  endExclusive: Date
): Promise<number> {
  const result = await prisma.revenueLine.aggregate({
    where: {
      businessDate: { gte: startInclusive, lt: endExclusive },
    },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

async function sumCostsBetween(
  startInclusive: Date,
  endExclusive: Date
): Promise<number> {
  const result = await prisma.costLine.aggregate({
    where: {
      businessDate: { gte: startInclusive, lt: endExclusive },
    },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

async function buildRevenuePeriods(today: Date): Promise<RevenuePeriodMetric[]> {
  const tomorrow = addDays(today, 1);
  const weekStart = addDays(today, -6);
  const prevWeekStart = addDays(today, -13);
  const monthStart = startOfMonth(today);
  const prevMonthStart = startOfMonth(addDays(monthStart, -1));
  const prevMonthEnd = monthStart;

  const [
    dayAmount,
    dayPrev,
    weekAmount,
    weekPrev,
    monthAmount,
    monthPrev,
  ] = await Promise.all([
    sumRevenueBetween(today, tomorrow),
    sumRevenueBetween(addDays(today, -1), today),
    sumRevenueBetween(weekStart, tomorrow),
    sumRevenueBetween(prevWeekStart, weekStart),
    sumRevenueBetween(monthStart, tomorrow),
    sumRevenueBetween(prevMonthStart, prevMonthEnd),
  ]);

  const dayFmt = formatRevenue(dayAmount);
  const weekFmt = formatRevenue(weekAmount);
  const monthFmt = formatRevenue(monthAmount);

  return [
    {
      id: "day",
      label: "Выручка за день",
      value: dayFmt.value,
      suffix: dayFmt.suffix,
      delta: computeTrend(dayAmount, dayPrev),
      hint: "Касса и предоплаты за сегодня",
    },
    {
      id: "week",
      label: "Выручка за неделю",
      value: weekFmt.value,
      suffix: weekFmt.suffix,
      delta: computeTrend(weekAmount, weekPrev),
      hint: "Сумма за последние 7 календарных дней",
    },
    {
      id: "month",
      label: "Выручка за месяц",
      value: monthFmt.value,
      suffix: monthFmt.suffix,
      delta: computeTrend(monthAmount, monthPrev),
      hint: "С начала текущего месяца",
    },
  ];
}

async function buildMarginSummary(today: Date): Promise<MarginSummary> {
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);

  const [revToday, revYesterday, costToday, costYesterday, services] =
    await Promise.all([
      sumRevenueBetween(today, tomorrow),
      sumRevenueBetween(yesterday, today),
      sumCostsBetween(today, tomorrow),
      sumCostsBetween(yesterday, today),
      prisma.service.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
    ]);

  const overallToday = marginPercent(revToday, costToday);
  const overallYesterday = marginPercent(revYesterday, costYesterday);

  const byService: ServiceMarginRow[] = [];

  for (const service of services) {
    const [revAgg, costAgg] = await Promise.all([
      prisma.revenueLine.aggregate({
        where: {
          serviceId: service.id,
          businessDate: { gte: today, lt: tomorrow },
        },
        _sum: { amount: true },
      }),
      prisma.costLine.aggregate({
        where: {
          serviceId: service.id,
          businessDate: { gte: today, lt: tomorrow },
        },
        _sum: { amount: true },
      }),
    ]);

    const revenue = Number(revAgg._sum.amount ?? 0);
    const cost = Number(costAgg._sum.amount ?? 0);
    if (revenue <= 0 && cost <= 0) continue;

    const pct = marginPercent(revenue, cost);
    byService.push({
      serviceId: service.id,
      serviceName: service.name,
      marginPercent: Math.round(pct * 10) / 10,
      revenue,
      belowThreshold: revenue > 0 && pct < MARGIN_ALERT_THRESHOLD,
    });
  }

  byService.sort((a, b) => a.marginPercent - b.marginPercent);

  return {
    overallPercent: Math.round(overallToday * 10) / 10,
    delta: computeMarginTrend(overallToday, overallYesterday),
    hint: "Валовая маржа по выручке и COGS за день",
    byService,
  };
}

async function countInventoryAlerts(): Promise<InventoryAlertsSummary> {
  const lots = await prisma.inventoryLot.findMany({
    include: { item: true },
  });
  const expiryThreshold = addDays(startOfDay(), INVENTORY_EXPIRY_DAYS);

  let count = 0;
  let criticalCount = 0;

  for (const lot of lots) {
    const reorder = lot.item.reorderLevel
      ? Number(lot.item.reorderLevel)
      : null;
    const qty = Number(lot.quantityLeft);
    const belowReorder = reorder !== null && qty < reorder;
    const expiringSoon =
      lot.expiresAt !== null && lot.expiresAt <= expiryThreshold;
    if (belowReorder || expiringSoon) count++;
    if (reorder !== null && qty < reorder * 0.5) criticalCount++;
  }

  return {
    count,
    criticalCount,
    hint: "Пороги FIFO и срок годности",
  };
}

async function buildCriticalAlerts(
  today: Date,
  marginByService: ServiceMarginRow[]
): Promise<CriticalAlert[]> {
  const alerts: CriticalAlert[] = [];

  for (const row of marginByService.filter((s) => s.belowThreshold)) {
    alerts.push({
      id: `margin-${row.serviceId}`,
      severity: "high",
      title: `Низкая маржа: ${row.serviceName}`,
      description: `Маржа ${row.marginPercent.toFixed(1).replace(".", ",")}% — ниже порога ${MARGIN_ALERT_THRESHOLD}%. Выручка за день ${formatRevenue(row.revenue).value} ${formatRevenue(row.revenue).suffix}.`,
      timeLabel: "сегодня",
    });
  }

  const timings = await prisma.programTiming.findMany({
    where: {
      startsAt: { gte: today, lt: addDays(today, 1) },
    },
    include: { hall: true, spaProgram: true },
    orderBy: { startsAt: "asc" },
  });

  const byHall = new Map<string, typeof timings>();
  for (const t of timings) {
    const list = byHall.get(t.hallId) ?? [];
    list.push(t);
    byHall.set(t.hallId, list);
  }

  for (const [, hallTimings] of byHall) {
    for (let i = 0; i < hallTimings.length; i++) {
      for (let j = i + 1; j < hallTimings.length; j++) {
        const a = hallTimings[i];
        const b = hallTimings[j];
        if (a.startsAt < b.endsAt && b.startsAt < a.endsAt) {
          const hallName = a.hall.name;
          const startH = a.startsAt.getHours().toString().padStart(2, "0");
          const startM = a.startsAt.getMinutes().toString().padStart(2, "0");
          const endH = a.endsAt.getHours().toString().padStart(2, "0");
          const endM = a.endsAt.getMinutes().toString().padStart(2, "0");
          alerts.push({
            id: `timing-${a.id}-${b.id}`,
            severity: "high",
            title: `Простой зала «${hallName}»`,
            description: `Конфликт тайминга: пересечение «${a.spaProgram.name}» ${startH}:${startM}–${endH}:${endM} с «${b.spaProgram.name}».`,
            timeLabel: formatRelativeTime(
              a.updatedAt > b.updatedAt ? a.updatedAt : b.updatedAt
            ),
          });
        }
      }
    }
  }

  const lowLots = await prisma.inventoryLot.findMany({
    include: { item: true },
    where: { item: { isActive: true } },
  });

  for (const lot of lowLots) {
    const reorder = lot.item.reorderLevel
      ? Number(lot.item.reorderLevel)
      : null;
    const qty = Number(lot.quantityLeft);
    if (reorder !== null && qty < reorder) {
      alerts.push({
        id: `inv-${lot.id}`,
        severity: "high",
        title: `Низкий остаток: ${lot.item.name.toLowerCase()}`,
        description: `Остаток ${qty} ${lot.item.unit} при норме ${reorder} ${lot.item.unit}. Партия ${lot.lotCode}.`,
        timeLabel: formatRelativeTime(lot.updatedAt),
      });
    }
  }

  const conflictSlots = await prisma.kitchenSlot.findMany({
    where: {
      syncStatus: "CONFLICT",
      resolvedAt: null,
      startsAt: { gte: today, lt: addDays(today, 1) },
    },
    include: {
      programTiming: { include: { spaProgram: true } },
    },
  });

  for (const slot of conflictSlots) {
    alerts.push({
      id: `kitchen-${slot.id}`,
      severity: "medium",
      title: "Задержка кухни → SPA",
      description:
        slot.notes ??
        `Слот кухни для «${slot.programTiming.spaProgram.name}» вне SLA.`,
      timeLabel: formatRelativeTime(slot.updatedAt),
    });
  }

  alerts.sort((a, b) => {
    if (a.severity === b.severity) return 0;
    return a.severity === "high" ? -1 : 1;
  });

  return alerts.slice(0, 12);
}

async function buildTodayOperations(today: Date): Promise<TodayOperationRow[]> {
  const hallLoads = await buildHallLoads(today);
  const totalRow = hallLoads.find((r) => r.isTotal);
  const hallLoad = totalRow?.percent ?? 0;

  const activeBookings = await prisma.booking.count({
    where: {
      status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] },
      startsAt: { gte: today, lt: addDays(today, 1) },
    },
  });

  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] },
      startsAt: { gte: today, lt: addDays(today, 1) },
    },
  });

  let totalMinutes = 0;
  for (const b of bookings) {
    totalMinutes += (b.endsAt.getTime() - b.startsAt.getTime()) / 60_000;
  }
  const avgMinutes = bookings.length ? totalMinutes / bookings.length : 0;
  const avgHours = Math.floor(avgMinutes / 60);
  const avgMins = Math.round(avgMinutes % 60);

  const kitchenSlots = await prisma.kitchenSlot.findMany({
    where: {
      startsAt: { gte: today, lt: addDays(today, 1) },
    },
  });
  const delayed = kitchenSlots.filter(
    (s) => s.syncStatus === "CONFLICT" && s.resolvedAt == null
  ).length;
  const onTime = kitchenSlots.length - delayed;

  return [
    {
      id: "yield",
      label: "Загрузка залов (итого)",
      value: `${hallLoad}%`,
      note:
        hallLoad >= HALL_LOAD_TARGET_PERCENT
          ? `Цель ${HALL_LOAD_TARGET_PERCENT}% — в норме`
          : `Ниже целевой загрузки ${HALL_LOAD_TARGET_PERCENT}%`,
    },
    {
      id: "avg-session",
      label: "Средняя длительность сеанса",
      value: `${avgHours} ч ${avgMins} мин`,
      note: `По ${activeBookings} активным броням`,
    },
    {
      id: "kitchen-sync",
      label: "Синхронизация кухня / SPA",
      value: `${kitchenSlots.length} слота`,
      note:
        delayed > 0
          ? `${onTime} в пределах SLA, ${delayed} с задержкой`
          : `${onTime} в пределах SLA`,
    },
  ];
}

/**
 * WAMZ — зоны с операционной активностью за скользящие 7 дней (Москва).
 * Активность: revenue/cost, чеклист с отметкой, обновление брони.
 */
async function buildWamzSummary(today: Date): Promise<WamzSummary> {
  const windowStart = addDays(today, -(WAMZ_WINDOW_DAYS - 1));
  const windowEnd = addDays(today, 1);

  const halls = await prisma.hall.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const activeHallIds = new Set<string>();

  const [revenueHalls, costHalls, checklistHalls, bookingHalls] =
    await Promise.all([
      prisma.revenueLine.findMany({
        where: {
          hallId: { not: null },
          businessDate: { gte: windowStart, lt: windowEnd },
        },
        select: { hallId: true },
        distinct: ["hallId"],
      }),
      prisma.costLine.findMany({
        where: {
          hallId: { not: null },
          businessDate: { gte: windowStart, lt: windowEnd },
        },
        select: { hallId: true },
        distinct: ["hallId"],
      }),
      prisma.shiftChecklist.findMany({
        where: {
          hallId: { not: null },
          shiftDate: { gte: windowStart, lt: windowEnd },
          items: { some: { completedAt: { not: null } } },
        },
        select: { hallId: true },
      }),
      prisma.booking.findMany({
        where: {
          hallId: { not: null },
          updatedAt: { gte: windowStart, lt: windowEnd },
        },
        select: { hallId: true },
        distinct: ["hallId"],
      }),
    ]);

  for (const row of revenueHalls) {
    if (row.hallId) activeHallIds.add(row.hallId);
  }
  for (const row of costHalls) {
    if (row.hallId) activeHallIds.add(row.hallId);
  }
  for (const row of checklistHalls) {
    if (row.hallId) activeHallIds.add(row.hallId);
  }
  for (const row of bookingHalls) {
    if (row.hallId) activeHallIds.add(row.hallId);
  }

  const inactiveHalls = halls
    .filter((h) => !activeHallIds.has(h.id))
    .map((h) => h.name);

  const activeCount = activeHallIds.size;
  const totalCount = halls.length;

  return {
    activeCount,
    totalCount,
    pilotTarget: WAMZ_PILOT_TARGET,
    meetsPilotTarget: activeCount >= WAMZ_PILOT_TARGET,
    hint: "Скользящие 7 дней (МСК): выручка/COGS, чеклист или бронь",
    inactiveHalls,
  };
}

/** Чеклисты смены: группы по залам с пунктами и статусом выполнения. */
async function buildShiftChecklists(today: Date): Promise<ShiftChecklistsSummary> {
  const checklists = await prisma.shiftChecklist.findMany({
    where: { shiftDate: today },
    include: {
      hall: true,
      items: { orderBy: { sortOrder: "asc" } },
    },
  });

  checklists.sort((a, b) => {
    const nameA = a.hall?.name ?? a.title ?? "";
    const nameB = b.hall?.name ?? b.title ?? "";
    return nameA.localeCompare(nameB, "ru");
  });

  const groups = checklists.map((checklist) => ({
    id: checklist.id,
    hallName: checklist.hall?.name ?? checklist.title ?? "Смена",
    title: checklist.title ?? undefined,
    items: checklist.items.map((item) => ({
      id: item.id,
      label: item.label,
      completed: item.completedAt !== null,
    })),
  }));

  const allItems = groups.flatMap((g) => g.items);

  return {
    completed: allItems.filter((i) => i.completed).length,
    total: allItems.length,
    groups,
  };
}

const EMPTY_DB_MESSAGE =
  "База пуста — выполните: npm run db:push && npm run db:seed";

/** Загружает dashboard-данные из PostgreSQL или возвращает empty state. */
export async function getDashboardData(): Promise<DashboardResult> {
  if (!process.env.DATABASE_URL) {
    return {
      kind: "empty",
      message:
        "DATABASE_URL не задан. Скопируйте .env.example → .env и запустите Docker PostgreSQL.",
    };
  }

  try {
    const hallCount = await prisma.hall.count();
    if (hallCount === 0) {
      return { kind: "empty", message: EMPTY_DB_MESSAGE };
    }

    const today = startOfDay();

    const margin = await buildMarginSummary(today);

    const [
      hallLoads,
      revenuePeriods,
      weekPlanFact,
      inventoryAlerts,
      alerts,
      operations,
      shiftChecklists,
      wamz,
    ] = await Promise.all([
      buildHallLoads(today),
      buildRevenuePeriods(today),
      getWeekPlanFact(today),
      countInventoryAlerts(),
      buildCriticalAlerts(today, margin.byService),
      buildTodayOperations(today),
      buildShiftChecklists(today),
      buildWamzSummary(today),
    ]);

    return {
      hallLoads,
      revenuePeriods,
      weekPlanFact,
      margin,
      inventoryAlerts,
      alerts,
      operations,
      shiftChecklists,
      wamz,
    };
  } catch (error) {
    console.error("[dashboard] DB query failed:", error);
    return {
      kind: "empty",
      message: EMPTY_DB_MESSAGE,
    };
  }
}
