/**
 * Unit economics за сегодня: выручка, COGS и маржа по залам.
 */
import { addDays, BUSINESS_TIMEZONE, startOfDay } from "@/lib/date-utils";
import { marginPercent } from "@/lib/format-money";
import { prisma } from "@/lib/db";
import type { FinanceResult, HallEconomicsRow } from "@/modules/finance/types";

const EMPTY_MESSAGE =
  "База пуста — выполните: npm run db:push && npm run db:seed";

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

    if (rows.length === 0) {
      return {
        kind: "empty",
        message: "Нет финансовых строк за сегодня. Запустите npm run db:seed.",
      };
    }

    const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
    const totalCogs = rows.reduce((s, r) => s + r.cogs, 0);

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
      totals: {
        revenue: totalRevenue,
        cogs: totalCogs,
        marginPercent: marginPercent(totalRevenue, totalCogs),
      },
    };
  } catch (error) {
    console.error("[finance] DB query failed:", error);
    return { kind: "empty", message: EMPTY_MESSAGE };
  }
}
