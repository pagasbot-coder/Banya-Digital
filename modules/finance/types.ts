export type HallEconomicsRow = {
  hallId: string;
  hallName: string;
  revenue: number;
  cogs: number;
  marginPercent: number;
};

export type RetailProductRow = {
  productId: string;
  name: string;
  category: string;
  unit: string;
  dayRevenue: number;
  dayCogs: number;
  dayMarginRub: number;
  dayMarginPercent: number;
  weekRevenue: number;
  weekCogs: number;
  weekMarginRub: number;
  weekMarginPercent: number;
};

export type RetailSummary = {
  dayRevenue: number;
  dayCogs: number;
  dayMarginRub: number;
  dayMarginPercent: number;
  weekRevenue: number;
  weekCogs: number;
  weekMarginRub: number;
  weekMarginPercent: number;
  rows: RetailProductRow[];
};

export type FinanceResult =
  | {
      kind: "data";
      dateLabel: string;
      rows: HallEconomicsRow[];
      hallTotals: { revenue: number; cogs: number; marginPercent: number };
      overallTotals: { revenue: number; cogs: number; marginPercent: number };
      retail: RetailSummary;
    }
  | { kind: "empty"; message: string };

export function isFinanceEmpty(
  result: FinanceResult
): result is Extract<FinanceResult, { kind: "empty" }> {
  return result.kind === "empty";
}
