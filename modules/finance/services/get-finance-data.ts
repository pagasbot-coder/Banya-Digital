/**
 * Unit economics за сегодня: выручка, COGS и маржа по залам.
 * Не бросает исключений — при сбое возвращает kind:"data" с нулями или kind:"empty".
 */
import { addDays, businessDateForDb, startOfDay } from "@/lib/date-utils";
import { withDbTimeout } from "@/lib/db-timeout";
import { marginPercent } from "@/lib/format-money";
import { prisma } from "@/lib/db";
import {
  EMPTY_RETAIL,
  emptyFinanceData,
  financeDateLabel,
} from "@/modules/finance/services/finance-safe-defaults";
import type {
  FinanceResult,
  HallEconomicsRow,
  RetailProductRow,
  RetailSummary,
} from "@/modules/finance/types";

const EMPTY_MESSAGE =
  "База пуста — выполните: npm run db:push && npm run db:seed";

/** Розница — отдельный try/catch: отсутствие T-021 таблиц не должно ронять /finance. */
async function loadRetailSummary(
  today: Date,
  tomorrow: Date,
  weekStart: Date
): Promise<RetailSummary> {
  try {
    const [retailProducts, retailDayAgg, retailWeekAgg] = await Promise.all([
      withDbTimeout(prisma.retailProduct.findMany({
        where: { isActive: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }), []),
      withDbTimeout(
        prisma.retailSale.groupBy({
          by: ["productId"],
          where: { soldAt: { gte: today, lt: tomorrow } },
          _sum: { quantity: true },
        }),
        []
      ),
      withDbTimeout(
        prisma.retailSale.groupBy({
          by: ["productId"],
          where: { soldAt: { gte: weekStart, lt: tomorrow } },
          _sum: { quantity: true },
        }),
        []
      ),
    ]);

    const productsById = new Map(
      retailProducts.map((p) => [
        p.id,
        {
          name: p.name,
          category: p.category,
          unit: p.unit,
          price: Number(p.price),
          cogsPerUnit: Number(p.cogsPerUnit),
        },
      ])
    );

    const dayQty = new Map<string, number>();
    for (const row of retailDayAgg) {
      dayQty.set(row.productId, Number(row._sum.quantity ?? 0));
    }

    const weekQty = new Map<string, number>();
    for (const row of retailWeekAgg) {
      weekQty.set(row.productId, Number(row._sum.quantity ?? 0));
    }

    return buildRetailSummary(productsById, dayQty, weekQty);
  } catch (error) {
    console.error("[finance] retail aggregates failed:", error);
    return EMPTY_RETAIL;
  }
}

function buildRetailSummary(
  products: Map<
    string,
    {
      name: string;
      category: string;
      unit: string;
      price: number;
      cogsPerUnit: number;
    }
  >,
  dayQty: Map<string, number>,
  weekQty: Map<string, number>
): RetailSummary {
  const rows: RetailProductRow[] = [];

  for (const [productId, product] of products) {
    const qtyDay = dayQty.get(productId) ?? 0;
    const qtyWeek = weekQty.get(productId) ?? 0;
    if (qtyDay <= 0 && qtyWeek <= 0) continue;

    const dayRevenue = qtyDay * product.price;
    const dayCogs = qtyDay * product.cogsPerUnit;
    const weekRevenue = qtyWeek * product.price;
    const weekCogs = qtyWeek * product.cogsPerUnit;

    rows.push({
      productId,
      name: product.name,
      category: product.category,
      unit: product.unit,
      dayRevenue,
      dayCogs,
      dayMarginRub: dayRevenue - dayCogs,
      dayMarginPercent: marginPercent(dayRevenue, dayCogs),
      weekRevenue,
      weekCogs,
      weekMarginRub: weekRevenue - weekCogs,
      weekMarginPercent: marginPercent(weekRevenue, weekCogs),
    });
  }

  rows.sort((a, b) => {
    if (a.weekRevenue === b.weekRevenue) return a.name.localeCompare(b.name, "ru");
    return b.weekRevenue - a.weekRevenue;
  });

  const dayRevenue = rows.reduce((s, r) => s + r.dayRevenue, 0);
  const dayCogs = rows.reduce((s, r) => s + r.dayCogs, 0);
  const weekRevenue = rows.reduce((s, r) => s + r.weekRevenue, 0);
  const weekCogs = rows.reduce((s, r) => s + r.weekCogs, 0);

  return {
    dayRevenue,
    dayCogs,
    dayMarginRub: dayRevenue - dayCogs,
    dayMarginPercent: marginPercent(dayRevenue, dayCogs),
    weekRevenue,
    weekCogs,
    weekMarginRub: weekRevenue - weekCogs,
    weekMarginPercent: marginPercent(weekRevenue, weekCogs),
    rows,
  };
}

async function loadHallRowsForToday(businessDay: Date): Promise<HallEconomicsRow[]> {
  const halls = await withDbTimeout(
    prisma.hall.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    []
  );

  const settled = await Promise.allSettled(
    halls.map(async (hall) => {
      const [revAgg, cogsAgg] = await Promise.all([
        withDbTimeout(
          prisma.revenueLine.aggregate({
            where: { hallId: hall.id, businessDate: businessDay },
            _sum: { amount: true },
          }),
          { _sum: { amount: null } }
        ),
        withDbTimeout(
          prisma.costLine.aggregate({
            where: {
              hallId: hall.id,
              costType: "COGS",
              businessDate: businessDay,
            },
            _sum: { amount: true },
          }),
          { _sum: { amount: null } }
        ),
      ]);

      const revenue = Number(revAgg._sum.amount ?? 0);
      const cogs = Number(cogsAgg._sum.amount ?? 0);
      if (revenue <= 0 && cogs <= 0) return null;

      return {
        hallId: hall.id,
        hallName: hall.name,
        revenue,
        cogs,
        marginPercent: marginPercent(revenue, cogs),
      } satisfies HallEconomicsRow;
    })
  );

  const rows: HallEconomicsRow[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled" && result.value) {
      rows.push(result.value);
    } else if (result.status === "rejected") {
      console.error("[finance] hall aggregate rejected:", result.reason);
    }
  }
  return rows;
}

/** Агрегаты финансов за бизнес-день; reject/throw наружу не пробрасывает. */
export async function getFinanceData(): Promise<FinanceResult> {
  if (!process.env.DATABASE_URL) {
    return {
      kind: "empty",
      message:
        "DATABASE_URL не задан. Скопируйте .env.example → .env и запустите Docker PostgreSQL.",
    };
  }

  const today = startOfDay();
  const businessDay = businessDateForDb();
  const tomorrow = addDays(today, 1);
  const weekStart = addDays(today, -6);

  try {
    const hallCount = await withDbTimeout(prisma.hall.count(), -1);
    if (hallCount <= 0) {
      return { kind: "empty", message: EMPTY_MESSAGE };
    }

    const rows = await loadHallRowsForToday(businessDay);
    const retail = await loadRetailSummary(today, tomorrow, weekStart);

    const hallRevenue = rows.reduce((s, r) => s + r.revenue, 0);
    const hallCogs = rows.reduce((s, r) => s + r.cogs, 0);
    const overallRevenue = hallRevenue + retail.dayRevenue;
    const overallCogs = hallCogs + retail.dayCogs;

    return {
      kind: "data",
      dateLabel: financeDateLabel(today),
      rows,
      hallTotals: {
        revenue: hallRevenue,
        cogs: hallCogs,
        marginPercent: marginPercent(hallRevenue, hallCogs),
      },
      overallTotals: {
        revenue: overallRevenue,
        cogs: overallCogs,
        marginPercent: marginPercent(overallRevenue, overallCogs),
      },
      retail,
    };
  } catch (error) {
    console.error("[finance] getFinanceData failed:", error);
    try {
      const hallCount = await withDbTimeout(prisma.hall.count(), 0);
      if (hallCount > 0) {
        return emptyFinanceData(today);
      }
    } catch {
      /* ignore */
    }
    return {
      kind: "empty",
      message:
        "Не удалось загрузить финансы. Проверьте DATABASE_URL и выполните npm run db:push && npm run db:seed.",
    };
  }
}
