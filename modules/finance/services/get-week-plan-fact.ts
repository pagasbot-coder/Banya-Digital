/**
 * План/факт выручки за календарную неделю (пн–вс, Europe/Moscow).
 * План — из RevenueWeekPlan; без строки в БД — 92% от факта (демо-fallback).
 */
import {
  addDays,
  BUSINESS_TIMEZONE,
  startOfDay,
  startOfWeek,
} from "@/lib/date-utils";
import { prisma } from "@/lib/db";
import type { KpiTrend } from "@/modules/dashboard/types";

/** Доля факта от плана, % (1 знак). */
const PLAN_FALLBACK_RATIO = 0.92;

export type WeekPlanFactSummary = {
  weekLabel: string;
  periodHint: string;
  planAmount: number;
  factAmount: number;
  /** fact / plan × 100 */
  percentOfPlan: number;
  meetsPlan: boolean;
  deltaLabel: string;
  trend: KpiTrend;
  planFromDb: boolean;
};

function formatWeekdayShort(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    timeZone: BUSINESS_TIMEZONE,
    day: "numeric",
    month: "short",
  });
}

/** Подпись диапазона недели: «13–27 мая» (до сегодня внутри текущей недели). */
function formatWeekRange(weekStart: Date, throughDay: Date): string {
  const startLabel = formatWeekdayShort(weekStart);
  const endLabel = formatWeekdayShort(throughDay);
  if (startLabel === endLabel) return startLabel;
  const startMonth = weekStart.toLocaleDateString("ru-RU", {
    timeZone: BUSINESS_TIMEZONE,
    month: "short",
  });
  const endMonth = throughDay.toLocaleDateString("ru-RU", {
    timeZone: BUSINESS_TIMEZONE,
    month: "short",
  });
  if (startMonth === endMonth) {
    const startDay = weekStart.toLocaleDateString("ru-RU", {
      timeZone: BUSINESS_TIMEZONE,
      day: "numeric",
    });
    return `${startDay}–${endLabel}`;
  }
  return `${startLabel} – ${endLabel}`;
}

function buildDeltaLabel(
  factAmount: number,
  planAmount: number
): { deltaLabel: string; trend: KpiTrend } {
  const delta = factAmount - planAmount;
  if (planAmount <= 0) {
    return { deltaLabel: "план не задан", trend: "neutral" };
  }
  const pct = (delta / planAmount) * 100;
  const sign = delta >= 0 ? "+" : "−";
  const trend: KpiTrend =
    Math.abs(pct) < 0.5 ? "neutral" : delta > 0 ? "up" : "down";
  return {
    deltaLabel: `${sign}${Math.abs(pct).toFixed(0)}% к плану`,
    trend,
  };
}

/** План/факт выручки: календарная неделя с пн по сегодня (МСК). */
export async function getWeekPlanFact(
  referenceDate = startOfDay()
): Promise<WeekPlanFactSummary | null> {
  if (!process.env.DATABASE_URL) return null;

  try {
    const hallCount = await prisma.hall.count();
    if (hallCount === 0) return null;

    const weekStart = startOfWeek(referenceDate);
    const tomorrow = addDays(referenceDate, 1);

    const [factAgg, planRow] = await Promise.all([
      prisma.revenueLine.aggregate({
        where: {
          businessDate: { gte: weekStart, lt: tomorrow },
        },
        _sum: { amount: true },
      }),
      prisma.revenueWeekPlan.findUnique({
        where: { weekStart },
      }),
    ]);

    const factAmount = Number(factAgg._sum.amount ?? 0);
    const planFromDb = planRow !== null;
    const planAmount = planFromDb
      ? Number(planRow.amount)
      : Math.max(1, Math.round(factAmount * PLAN_FALLBACK_RATIO));

    const percentOfPlan =
      planAmount > 0
        ? Math.round((factAmount / planAmount) * 1000) / 10
        : 0;

    const { deltaLabel, trend } = buildDeltaLabel(factAmount, planAmount);

    return {
      weekLabel: formatWeekRange(weekStart, referenceDate),
      periodHint: planFromDb
        ? "Календарная неделя (пн–вс, МСК), план из БД"
        : "Календарная неделя (пн–вс, МСК), план ≈92% факта (демо)",
      planAmount,
      factAmount,
      percentOfPlan,
      meetsPlan: percentOfPlan >= 100,
      deltaLabel,
      trend,
      planFromDb,
    };
  } catch (error) {
    console.error("[finance] week plan/fact failed:", error);
    return null;
  }
}
