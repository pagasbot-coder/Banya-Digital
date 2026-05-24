export type HallEconomicsRow = {
  hallId: string;
  hallName: string;
  revenue: number;
  cogs: number;
  marginPercent: number;
};

export type FinanceResult =
  | {
      kind: "data";
      dateLabel: string;
      rows: HallEconomicsRow[];
      totals: {
        revenue: number;
        cogs: number;
        marginPercent: number;
      };
    }
  | { kind: "empty"; message: string };

export function isFinanceEmpty(
  result: FinanceResult
): result is Extract<FinanceResult, { kind: "empty" }> {
  return result.kind === "empty";
}
