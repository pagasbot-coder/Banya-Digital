/** Форматирование сумм в рублях для RU UI. */

export function formatRubles(amount: number): string {
  return `${Math.round(amount).toLocaleString("ru-RU")} ₽`;
}

export function marginPercent(revenue: number, cost: number): number {
  if (revenue <= 0) return 0;
  return Math.round(((revenue - cost) / revenue) * 1000) / 10;
}
