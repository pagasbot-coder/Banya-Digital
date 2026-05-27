import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatRubles } from "@/lib/format-money";
import type { RetailKpiSummary } from "@/modules/dashboard/types";
import { cn } from "@/lib/utils";

type RetailSummaryCardProps = {
  summary: RetailKpiSummary;
};

/** KPI карточка: розница (бар/магазин) — выручка и маржа за день. */
export function RetailSummaryCard({ summary }: RetailSummaryCardProps) {
  return (
    <Card className="border-border/80 bg-card/95 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>Розница за день</CardDescription>
        <CardTitle className="font-heading text-2xl tabular-nums">
          {formatRubles(summary.revenue)}
        </CardTitle>
        <p
          className={cn(
            "mt-1 text-xs tabular-nums text-muted-foreground",
            summary.revenue > 0 && summary.marginPercent < 40
              ? "text-destructive"
              : null
          )}
        >
          Маржа {summary.marginPercent.toFixed(0)}% · {summary.hint}
        </p>
      </CardHeader>
    </Card>
  );
}

