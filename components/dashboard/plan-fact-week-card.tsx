import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRubles } from "@/lib/format-money";
import type { WeekPlanFactSummary } from "@/modules/dashboard/types";
import { cn } from "@/lib/utils";
import { Target } from "lucide-react";

type PlanFactWeekCardProps = {
  summary: WeekPlanFactSummary;
};

/** KPI план/факт выручки за календарную неделю. */
export function PlanFactWeekCard({ summary }: PlanFactWeekCardProps) {
  const percentLabel = `${summary.percentOfPlan.toFixed(1).replace(".", ",")}%`;

  return (
    <Card className="h-full border-border/80 bg-card/95 py-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardDescription className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
            Неделя: план / факт
          </CardDescription>
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent"
            aria-hidden
          >
            <Target className="size-4" />
          </span>
        </div>
        <CardTitle className="font-heading text-2xl font-semibold tracking-tight tabular-nums leading-snug">
          {formatRubles(summary.factAmount)}
          <span className="block text-base font-medium text-muted-foreground">
            из {formatRubles(summary.planAmount)} · {percentLabel}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pb-5">
        <p className="text-xs text-muted-foreground">{summary.weekLabel}</p>
        <Badge
          variant={summary.meetsPlan ? "secondary" : "destructive"}
          className={cn(
            summary.meetsPlan &&
              "border-accent/30 bg-accent/10 text-accent-foreground dark:text-accent",
            summary.trend === "up" &&
              !summary.meetsPlan &&
              "border-amber-500/40 bg-amber-500/10"
          )}
        >
          {summary.meetsPlan ? "План выполнен" : summary.deltaLabel}
        </Badge>
        <p className="text-xs text-muted-foreground">
          План {formatRubles(summary.planAmount)} / факт{" "}
          {formatRubles(summary.factAmount)} / {percentLabel}
        </p>
        <p className="text-xs text-muted-foreground">{summary.periodHint}</p>
      </CardContent>
    </Card>
  );
}
