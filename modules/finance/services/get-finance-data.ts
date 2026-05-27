/**
 * Unit economics за сегодня: выручка, COGS и маржа по залам.
 */
import { addDays, BUSINESS_TIMEZONE, startOfDay } from "@/lib/date-utils";
import { marginPercent } from "@/lib/format-money";
import { prisma } from "@/lib/db";
import type {
  FinanceResult,
  HallEconomicsRow,
  RetailProductRow,
  RetailSummary,
} from "@/modules/finance/types";

const EMPTY_MESSAGE =
  "База пуста — выполните: npm run db:push && npm run db:seed";

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

export async function getFinanceData(): Promise<FinanceResult> {
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
      return { kind: "empty", message: EMPTY_MESSAGE };
    }

    const today = startOfDay();
    const tomorrow = addDays(today, 1);
    const weekStart = addDays(today, -6);

    const halls = await prisma.hall.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    const rows: HallEconomicsRow[] = [];

    for (const hall of halls) {
      const [revAgg, cogsAgg] = await Promise.all([
        prisma.revenueLine.aggregate({
          where: {
            hallId: hall.id,
            businessDate: { gte: today, lt: tomorrow },
          },
          _sum: { amount: true },
        }),
        prisma.costLine.aggregate({
          where: {
            hallId: hall.id,
            costType: "COGS",
            businessDate: { gte: today, lt: tomorrow },
          },
          _sum: { amount: true },
        }),
      ]);

      const revenue = Number(revAgg._sum.amount ?? 0);
      const cogs = Number(cogsAgg._sum.amount ?? 0);
      if (revenue <= 0 && cogs <= 0) continue;

      rows.push({
        hallId: hall.id,
        hallName: hall.name,
        revenue,
        cogs,
        marginPercent: marginPercent(revenue, cogs),
      });
    }

    // Retail day/week → PRODUCT line
    const [retailProducts, retailDayAgg, retailWeekAgg] = await Promise.all([
      prisma.retailProduct.findMany({
        where: { isActive: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      prisma.retailSale.groupBy({
        by: ["productId"],
        where: { soldAt: { gte: today, lt: tomorrow } },
        _sum: { quantity: true },
      }),
      prisma.retailSale.groupBy({
        by: ["productId"],
        where: { soldAt: { gte: weekStart, lt: tomorrow } },
        _sum: { quantity: true },
      }),
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

    const retail = buildRetailSummary(productsById, dayQty, weekQty);

    if (rows.length === 0 && retail.rows.length === 0) {
      return {
        kind: "empty",
        message: "Нет финансовых строк за сегодня. Запустите npm run db:seed.",
      };
    }

    const hallRevenue = rows.reduce((s, r) => s + r.revenue, 0);
    const hallCogs = rows.reduce((s, r) => s + r.cogs, 0);
    const overallRevenue = hallRevenue + retail.dayRevenue;
    const overallCogs = hallCogs + retail.dayCogs;

    const dateLabel = today.toLocaleDateString("ru-RU", {
      timeZone: BUSINESS_TIMEZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    return {
      kind: "data",
      dateLabel,
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
    console.error("[finance] DB query failed:", error);
    return { kind: "empty", message: EMPTY_MESSAGE };
  }
}
