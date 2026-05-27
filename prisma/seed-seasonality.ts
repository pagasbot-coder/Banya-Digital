import { PrismaClient, SeasonKind } from "@prisma/client";
import { addDays, startOfDay } from "../lib/date-utils";

type SeasonSeedRow = {
  calendarDate: Date;
  kind: SeasonKind;
  planMultiplier: number;
  label: string;
  notes?: string;
};

/** Проверка выходного (сб/вс) по Europe/Moscow. */
function isWeekendMsk(date: Date): boolean {
  const weekday = date.toLocaleDateString("en-US", {
    timeZone: "Europe/Moscow",
    weekday: "short",
  });
  return weekday === "Sat" || weekday === "Sun";
}

/** Субботы и воскресенья в диапазоне [from, to) — типичный +10%/+12% для премиум-бани. */
function weekendRows(from: Date, to: Date): SeasonSeedRow[] {
  const rows: SeasonSeedRow[] = [];
  for (let d = from; d < to; d = addDays(d, 1)) {
    if (!isWeekendMsk(d)) continue;
    const isSun = d.toLocaleDateString("en-US", {
      timeZone: "Europe/Moscow",
      weekday: "short",
    }) === "Sun";
    rows.push({
      calendarDate: d,
      kind: SeasonKind.WEEKEND,
      planMultiplier: isSun ? 1.12 : 1.1,
      label: isSun ? "Воскресенье" : "Суббота",
      notes: "Выходной: выше спрос на парные и семейные слоты",
    });
  }
  return rows;
}

/** Летний спад будней (июль–август): −12% к базовому дневному плану. */
function summerDipWeekdays(year: number): SeasonSeedRow[] {
  const from = startOfDay(new Date(`${year}-07-10`));
  const to = startOfDay(new Date(`${year}-08-20`));
  const rows: SeasonSeedRow[] = [];
  for (let d = from; d < to; d = addDays(d, 1)) {
    if (isWeekendMsk(d)) continue;
    rows.push({
      calendarDate: d,
      kind: SeasonKind.SUMMER_DIP,
      planMultiplier: 0.88,
      label: "Летний спад",
      notes: "Июль–август: меньше корпоративов, ниже будничный трафик",
    });
  }
  return rows;
}

/**
 * Сезонный календарь для демо (T-022): праздники РФ, НГ-пик, выходные, летний спад.
 * Окно ±6 мес от referenceDate, чтобы пилот видел актуальную неделю.
 */
export async function seedSeasonality(
  prisma: PrismaClient,
  referenceDate = startOfDay()
): Promise<number> {
  const year = Number(
    referenceDate.toLocaleDateString("en-CA", {
      timeZone: "Europe/Moscow",
      year: "numeric",
    })
  );

  const windowStart = addDays(referenceDate, -180);
  const windowEnd = addDays(referenceDate, 180);

  const fixedHolidays: SeasonSeedRow[] = [
  // НГ-пик (премиум-баня: корпоративы + семейные брони)
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((day) => ({
      calendarDate: startOfDay(new Date(`${year}-01-${String(day).padStart(2, "0")}`)),
      kind: SeasonKind.NY_PEAK,
      planMultiplier: day <= 3 ? 1.35 : 1.22,
      label: day <= 3 ? "Новогодние каникулы" : "НГ-хвост",
      notes: "Пик спроса: абонементы, подарочные сертификаты",
    })),
    {
      calendarDate: startOfDay(new Date(`${year}-02-14`)),
      kind: SeasonKind.EVENT,
      planMultiplier: 1.14,
      label: "14 февраля",
      notes: "Парные программы, подарочные пакеты",
    },
    {
      calendarDate: startOfDay(new Date(`${year}-02-23`)),
      kind: SeasonKind.HOLIDAY,
      planMultiplier: 1.12,
      label: "23 февраля",
    },
    {
      calendarDate: startOfDay(new Date(`${year}-03-08`)),
      kind: SeasonKind.HOLIDAY,
      planMultiplier: 1.15,
      label: "8 марта",
    },
    {
      calendarDate: startOfDay(new Date(`${year}-05-01`)),
      kind: SeasonKind.HOLIDAY,
      planMultiplier: 1.18,
      label: "1 мая",
    },
    {
      calendarDate: startOfDay(new Date(`${year}-05-02`)),
      kind: SeasonKind.HOLIDAY,
      planMultiplier: 1.14,
      label: "2 мая",
    },
    {
      calendarDate: startOfDay(new Date(`${year}-05-03`)),
      kind: SeasonKind.HOLIDAY,
      planMultiplier: 1.12,
      label: "3 мая",
    },
    {
      calendarDate: startOfDay(new Date(`${year}-05-09`)),
      kind: SeasonKind.HOLIDAY,
      planMultiplier: 1.16,
      label: "9 мая",
    },
    {
      calendarDate: startOfDay(new Date(`${year}-06-12`)),
      kind: SeasonKind.HOLIDAY,
      planMultiplier: 1.1,
      label: "12 июня",
    },
    {
      calendarDate: startOfDay(new Date(`${year}-11-04`)),
      kind: SeasonKind.HOLIDAY,
      planMultiplier: 1.11,
      label: "4 ноября",
    },
    {
      calendarDate: startOfDay(new Date(`${year}-12-31`)),
      kind: SeasonKind.NY_PEAK,
      planMultiplier: 1.28,
      label: "31 декабря",
      notes: "Предновогодний вечер",
    },
  ];

  const rows: SeasonSeedRow[] = [
    ...fixedHolidays,
    ...weekendRows(windowStart, windowEnd),
    ...summerDipWeekdays(year),
    ...summerDipWeekdays(year - 1),
    ...summerDipWeekdays(year + 1),
  ];

  const inWindow = rows.filter(
    (r) => r.calendarDate >= windowStart && r.calendarDate < windowEnd
  );

  // Последняя запись на дату побеждает (праздник важнее выходного)
  const byDate = new Map<number, SeasonSeedRow>();
  const priority: Record<SeasonKind, number> = {
    [SeasonKind.SUMMER_DIP]: 1,
    [SeasonKind.WEEKEND]: 2,
    [SeasonKind.EVENT]: 3,
    [SeasonKind.HOLIDAY]: 4,
    [SeasonKind.NY_PEAK]: 5,
  };
  for (const row of inWindow) {
    const key = row.calendarDate.getTime();
    const prev = byDate.get(key);
    if (!prev || priority[row.kind] >= priority[prev.kind]) {
      byDate.set(key, row);
    }
  }

  const unique = [...byDate.values()];
  await prisma.seasonCalendarEntry.createMany({
    data: unique.map((r) => ({
      calendarDate: r.calendarDate,
      kind: r.kind,
      planMultiplier: r.planMultiplier,
      label: r.label,
      notes: r.notes,
    })),
    skipDuplicates: true,
  });

  return unique.length;
}
