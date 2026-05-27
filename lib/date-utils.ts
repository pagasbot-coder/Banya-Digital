/**
 * Календарные границы ERP: бизнес-день = Europe/Moscow.
 * Vercel и Neon работают в UTC; без явной TZ «сегодня» на проде расходится с seed.
 */
export const BUSINESS_TIMEZONE = "Europe/Moscow";

/** Москва UTC+3 (DST отменён с 2014). */
const MOSCOW_OFFSET_MS = 3 * 60 * 60 * 1000;

function businessYmd(date: Date): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = Number(parts.find((p) => p.type === "year")!.value);
  const m = Number(parts.find((p) => p.type === "month")!.value);
  const d = Number(parts.find((p) => p.type === "day")!.value);
  return { y, m, d };
}

/** Полночь начала бизнес-дня (instant для Prisma timestamptz). */
export function startOfDay(date = new Date()): Date {
  const { y, m, d } = businessYmd(date);
  return new Date(Date.UTC(y, m - 1, d) - MOSCOW_OFFSET_MS);
}

/**
 * Значение для Prisma @db.Date (RevenueLine.businessDate и т.п.).
 * Тот же якорь, что startOfDay — совпадает с seed и фильтрами gte/lt.
 */
export function businessDateForDb(date = new Date()): Date {
  return startOfDay(date);
}

/** Парсит YYYY-MM-DD из формы в businessDateForDb. */
export function parseBusinessDateInput(
  raw: FormDataEntryValue | null | undefined
): Date {
  if (raw && String(raw).length >= 10) {
    const [y, m, d] = String(raw).slice(0, 10).split("-").map(Number);
    if (y && m && d) {
      return businessDateForDb(new Date(Date.UTC(y, m - 1, d)));
    }
  }
  return businessDateForDb();
}

export function addDays(date: Date, days: number): Date {
  return startOfDay(new Date(date.getTime() + days * 86_400_000));
}

export function startOfMonth(date: Date): Date {
  const { y, m } = businessYmd(date);
  return new Date(Date.UTC(y, m - 1, 1) - MOSCOW_OFFSET_MS);
}

/** Понедельник календарной недели (ISO, Europe/Moscow). */
export function startOfWeek(date = new Date()): Date {
  let cursor = startOfDay(date);
  for (let i = 0; i < 7; i++) {
    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: BUSINESS_TIMEZONE,
      weekday: "short",
    }).format(cursor);
    if (weekday === "Mon") return cursor;
    cursor = addDays(cursor, -1);
  }
  return startOfDay(date);
}

/** Локальное время внутри бизнес-дня (часы/минуты по Москве). */
export function atBusinessTime(base: Date, hours: number, minutes = 0): Date {
  return new Date(base.getTime() + (hours * 60 + minutes) * 60_000);
}

export function formatTimeRange(startsAt: Date, endsAt: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleTimeString("ru-RU", {
      timeZone: BUSINESS_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  return `${fmt(startsAt)}–${fmt(endsAt)}`;
}
