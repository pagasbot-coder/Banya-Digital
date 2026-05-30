/**
 * Сезонные поправки к недельному плану (T-022): записи календаря × доля дня в плане.
 */
import { SeasonKind } from "@prisma/client";
import { addDays, startOfDay } from "@/lib/date-utils";
import { prisma } from "@/lib/db";

export type SeasonalityDayChip = {
  dateLabel: string;
  label: string;
  kind: SeasonKind;
  planMultiplier: number;
  deltaPercent: number;
};

export type WeekSeasonalitySummary = {
  /** План недели с учётом множителей по дням (пн–вс). */
  adjustedPlanAmount: number;
  /** План на прошедшие дни недели (пн..reference). */
  adjustedPlanToDate: number;
  /** Средневзвешенная поправка к базовому плану, % */
  weekDeltaPercent: number;
  /** Поправка только на прошедшие дни недели, % */
  toDateDeltaPercent: number;
  hint: string;
  chips: SeasonalityDayChip[];
  todayMultiplier: number | null;
  todayLabel: string | null;
};

const KIND_LABEL: Record<SeasonKind, string> = {
  WEEKEND: "Выходной",
  HOLIDAY: "Праздник",
  NY_PEAK: "НГ-пик",
  SUMMER_DIP: "Летний спад",
  EVENT: "Событие",
};

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "numeric",
    month: "short",
  });
}

function deltaPercent(multiplier: number): number {
  return Math.round((multiplier - 1) * 1000) / 10;
}

/**
 * Распределяет недельный план по 7 дням с сезонными множителями.
 * Возвращает null, если БД недоступна.
 */
export async function getSeasonalityForWeek(
  weekStart: Date,
  referenceDate: Date,
  basePlanAmount: number
): Promise<WeekSeasonalitySummary | null> {
  if (!process.env.DATABASE_URL || basePlanAmount <= 0) return null;

  const weekEnd = addDays(weekStart, 7);
  const through = addDays(referenceDate, 1);

  try {
    if (typeof prisma.seasonCalendarEntry?.findMany !== "function") {
      return null;
    }

    const entries = await prisma.seasonCalendarEntry.findMany({
      where: {
        calendarDate: { gte: weekStart, lt: weekEnd },
      },
      orderBy: { calendarDate: "asc" },
    });

    /** Prisma @db.Date приходит как UTC-полночь — нормализуем к бизнес-дню МСК. */
    const dayKey = (d: Date) => startOfDay(d).getTime();
    const multiplierByDay = new Map<number, (typeof entries)[0]>();
    for (const e of entries) {
      multiplierByDay.set(dayKey(e.calendarDate), e);
    }

    const dailyBase = basePlanAmount / 7;
    let rawWeek = 0;
    let adjustedWeek = 0;
    let rawToDate = 0;
    let adjustedToDate = 0;

    const chips: SeasonalityDayChip[] = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const entry = multiplierByDay.get(dayKey(day));
      const mult = entry ? Number(entry.planMultiplier) : 1;
      rawWeek += dailyBase;
      adjustedWeek += dailyBase * mult;

      const inToDate = day < through;
      if (inToDate) {
        rawToDate += dailyBase;
        adjustedToDate += dailyBase * mult;
      }

      if (entry) {
        chips.push({
          dateLabel: formatShortDate(day),
          label: entry.label,
          kind: entry.kind,
          planMultiplier: mult,
          deltaPercent: deltaPercent(mult),
        });
      }
    }

    const weekDeltaPercent =
      rawWeek > 0
        ? Math.round(((adjustedWeek - rawWeek) / rawWeek) * 1000) / 10
        : 0;
    const toDateDeltaPercent =
      rawToDate > 0
        ? Math.round(((adjustedToDate - rawToDate) / rawToDate) * 1000) / 10
        : 0;

    const todayEntry = multiplierByDay.get(dayKey(referenceDate));
    const sign =
      weekDeltaPercent >= 0 ? `+${weekDeltaPercent}` : `${weekDeltaPercent}`;
    const chipKinds = [...new Set(chips.map((c) => KIND_LABEL[c.kind]))];
    const hint =
      chips.length === 0
        ? "Базовый план недели без сезонных поправок"
        : `Сезонный план: ${sign}% к базе (${chips.length} дн.: ${chipKinds.join(", ")})`;

    return {
      adjustedPlanAmount: Math.round(adjustedWeek),
      adjustedPlanToDate: Math.round(adjustedToDate),
      weekDeltaPercent,
      toDateDeltaPercent,
      hint,
      chips,
      todayMultiplier: todayEntry ? Number(todayEntry.planMultiplier) : null,
      todayLabel: todayEntry?.label ?? null,
    };
  } catch (error) {
    console.error("[finance] seasonality week failed:", error);
    return null;
  }
}
