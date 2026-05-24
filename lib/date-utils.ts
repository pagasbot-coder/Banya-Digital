/** Утилиты календарных границ для серверных модулей (смена = локальный день). */

export function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatTimeRange(startsAt: Date, endsAt: Date): string {
  const fmt = (d: Date) =>
    `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  return `${fmt(startsAt)}–${fmt(endsAt)}`;
}
