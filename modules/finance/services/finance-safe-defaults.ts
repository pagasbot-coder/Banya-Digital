import { BUSINESS_TIMEZONE, startOfDay } from "@/lib/date-utils";
import type { FinanceResult, RetailSummary } from "@/modules/finance/types";

export const EMPTY_RETAIL: RetailSummary = {
  dayRevenue: 0,
  dayCogs: 0,
  dayMarginRub: 0,
  dayMarginPercent: 0,
  weekRevenue: 0,
  weekCogs: 0,
  weekMarginRub: 0,
  weekMarginPercent: 0,
  rows: [],
};

/** Подпись бизнес-дня для UI при частичном сбое загрузки. */
export function financeDateLabel(date = startOfDay()): string {
  return date.toLocaleDateString("ru-RU", {
    timeZone: BUSINESS_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Нулевые агрегаты — страница рендерится, формы остаются доступны. */
export function emptyFinanceData(date = startOfDay()): Extract<FinanceResult, { kind: "data" }> {
  return {
    kind: "data",
    dateLabel: financeDateLabel(date),
    rows: [],
    hallTotals: { revenue: 0, cogs: 0, marginPercent: 0 },
    overallTotals: { revenue: 0, cogs: 0, marginPercent: 0 },
    retail: EMPTY_RETAIL,
  };
}

/** Смягчает kind:empty → data+warning для RSC (никогда не бросать на .rows). */
export function normalizeFinanceResult(result: FinanceResult): {
  finance: Extract<FinanceResult, { kind: "data" }>;
  warning: string | null;
} {
  if (result.kind === "data") {
    return { finance: result, warning: null };
  }
  return {
    finance: emptyFinanceData(),
    warning: result.message,
  };
}
