/**
 * Dashboard KPI и операционные агрегаты из PostgreSQL.
 *
 * hall_load: средний % загрузки активных залов за business day.
 *   load_hall = min(100, sum(partySize × minutes брони) / (capacity × 480 мин))
 *   hall_load = average(load_hall) по залам с capacity > 0.
 */
import { prisma } from "@/lib/db";
import type {
  CriticalAlert,
  DashboardKpiMetric,
  DashboardResult,
  KpiTrend,
  TodayOperationRow,
} from "@/modules/dashboard/types";

const SHIFT_MINUTES = 480;
const INVENTORY_EXPIRY_DAYS = 7;

function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

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

function computeTrend(current: number, previous: number): {
  label: string;
  trend: KpiTrend;
} {
  if (previous === 0) {
    return { label: "нет данных за вчера", trend: "neutral" };
  }
  const delta = current - previous;
  const pct = (delta / previous) * 100;
  const sign = delta >= 0 ? "+" : "";
  const trend: KpiTrend =
    Math.abs(pct) < 0.5 ? "neutral" : delta > 0 ? "up" : "down";
  return {
    label: `${sign}${pct.toFixed(0)}% к вчера`,
    trend,
  };
}

function computeMarginTrend(current: number, previous: number): {
  label: string;
  trend: KpiTrend;
} {
  const delta = current - previous;
  const sign = delta >= 0 ? "+" : "−";
  const trend: KpiTrend =
    Math.abs(delta) < 0.3 ? "neutral" : delta > 0 ? "up" : "down";
  return {
    label: `${sign}${Math.abs(delta).toFixed(1).replace(".", ",")} п.п.`,
    trend,
  };
}

async function calcHallLoadPercent(businessDate: Date): Promise<number> {
  const halls = await prisma.hall.findMany({
    where: { isActive: true, capacity: { gt: 0 } },
    include: {
      bookings: {
        where: {
          status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] },
          startsAt: { gte: businessDate, lt: addDays(businessDate, 1) },
        },
      },
    },
  });

  if (halls.length === 0) return 0;

  const loads = halls.map((hall) => {
    const capacity = hall.capacity ?? 1;
    const guestMinutes = hall.bookings.reduce((sum, b) => {
      const start = Math.max(b.startsAt.getTime(), businessDate.getTime());
      const end = Math.min(
        b.endsAt.getTime(),
        addDays(businessDate, 1).getTime()
      );
      const minutes = Math.max(0, (end - start) / 60_000);
      return sum + minutes * b.partySize;
    }, 0);
    const maxMinutes = capacity * SHIFT_MINUTES;
    return Math.min(100, (guestMinutes / maxMinutes) * 100);
  });

  return loads.reduce((a, b) => a + b, 0) / loads.length;
}

async function sumRevenue(businessDate: Date): Promise<number> {
  const result = await prisma.revenueLine.aggregate({
    where: { businessDate },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

async function sumCosts(businessDate: Date): Promise<number> {
  const result = await prisma.costLine.aggregate({
    where: { businessDate },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

function marginPercent(revenue: number, cost: number): number {
  if (revenue <= 0) return 0;
  return ((revenue - cost) / revenue) * 100;
}

async function countInventoryAlerts(): Promise<number> {
  const lots = await prisma.inventoryLot.findMany({
    include: { item: true },
  });
  const expiryThreshold = addDays(startOfDay(), INVENTORY_EXPIRY_DAYS);

  return lots.filter((lot) => {
    const reorder = lot.item.reorderLevel
      ? Number(lot.item.reorderLevel)
      : null;
    const qty = Number(lot.quantityLeft);
    const belowReorder = reorder !== null && qty < reorder;
    const expiringSoon =
      lot.expiresAt !== null && lot.expiresAt <= expiryThreshold;
    return belowReorder || expiringSoon;
  }).length;
}

async function buildCriticalAlerts(today: Date): Promise<CriticalAlert[]> {
  const alerts: CriticalAlert[] = [];

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

  return alerts.slice(0, 10);
}

async function buildTodayOperations(today: Date): Promise<TodayOperationRow[]> {
  const hallLoad = await calcHallLoadPercent(today);

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
  const delayed = kitchenSlots.filter((s) => s.syncStatus === "CONFLICT").length;
  const onTime = kitchenSlots.length - delayed;

  const checklistItems = await prisma.checklistItem.findMany({
    where: {
      checklist: { shiftDate: today },
    },
  });
  const completed = checklistItems.filter((i) => i.completedAt).length;
  const total = checklistItems.length;

  const openHalls = await prisma.shiftChecklist.findMany({
    where: {
      shiftDate: today,
      items: { some: { completedAt: null } },
    },
    include: { hall: true },
  });
  const openLabels = openHalls
    .map((c) => c.hall?.name ?? c.title ?? "смена")
    .slice(0, 2)
    .join(", ");

  return [
    {
      id: "yield",
      label: "Yield по залам",
      value: `${Math.round(hallLoad)}%`,
      note: hallLoad >= 90 ? "Цель 90% — в норме" : "Ниже целевого yield 90%",
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
    {
      id: "checklists",
      label: "Чеклисты смены",
      value: `${completed} / ${total}`,
      note:
        openLabels.length > 0
          ? `Открытые: ${openLabels}`
          : "Все пункты закрыты",
    },
  ];
}

async function buildKpiMetrics(
  today: Date,
  yesterday: Date
): Promise<DashboardKpiMetric[]> {
  const [hallLoadToday, hallLoadYesterday] = await Promise.all([
    calcHallLoadPercent(today),
    calcHallLoadPercent(yesterday),
  ]);

  const [revToday, revYesterday, costToday, costYesterday, invAlerts] =
    await Promise.all([
      sumRevenue(today),
      sumRevenue(yesterday),
      sumCosts(today),
      sumCosts(yesterday),
      countInventoryAlerts(),
    ]);

  const marginToday = marginPercent(revToday, costToday);
  const marginYesterday = marginPercent(revYesterday, costYesterday);

  const hallTrend = computeTrend(hallLoadToday, hallLoadYesterday);
  const revFormatted = formatRevenue(revToday);
  const revTrend = computeTrend(revToday, revYesterday);
  const marginTrend = computeMarginTrend(marginToday, marginYesterday);

  const lots = await prisma.inventoryLot.findMany({ include: { item: true } });
  const criticalInv = lots.filter((lot) => {
    const reorder = lot.item.reorderLevel
      ? Number(lot.item.reorderLevel)
      : null;
    return reorder !== null && Number(lot.quantityLeft) < reorder * 0.5;
  }).length;

  return [
    {
      id: "hall_load",
      label: "Загрузка залов",
      value: Math.round(hallLoadToday).toString(),
      suffix: "%",
      delta: hallTrend,
      hint: "Средняя по 4 залам за смену",
    },
    {
      id: "daily_revenue",
      label: "Выручка за день",
      value: revFormatted.value,
      suffix: revFormatted.suffix,
      delta: revTrend,
      hint: "Касса + предоплаты программ",
    },
    {
      id: "margin",
      label: "Маржа",
      value: marginToday.toFixed(0),
      suffix: "%",
      delta: marginTrend,
      hint: "Валовая по услугам и бару",
    },
    {
      id: "inventory_alerts",
      label: "Алерты склада",
      value: invAlerts.toString(),
      delta: {
        label: criticalInv > 0 ? `${criticalInv} критичных` : "в норме",
        trend: criticalInv > 0 ? "neutral" : "up",
      },
      hint: "Пороги FIFO и срок годности",
    },
  ];
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
    const yesterday = addDays(today, -1);

    const [metrics, alerts, operations] = await Promise.all([
      buildKpiMetrics(today, yesterday),
      buildCriticalAlerts(today),
      buildTodayOperations(today),
    ]);

    return { metrics, alerts, operations };
  } catch (error) {
    console.error("[dashboard] DB query failed:", error);
    return {
      kind: "empty",
      message: EMPTY_DB_MESSAGE,
    };
  }
}
