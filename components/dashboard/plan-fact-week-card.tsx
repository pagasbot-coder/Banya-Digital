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

/** KPI план/факт выручки за календарную неделю (с сезонной поправкой T-022). */
export function PlanFactWeekCard({ summary }: PlanFactWeekCardProps) {
  const percentLabel = `${summary.percentOfPlan.toFixed(1).replace(".", ",")}%`;
  const season = summary.seasonality;
  const planDisplay =
    season && season.chips.length > 0
      ? season.adjustedPlanToDate
      : summary.planAmount;

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
            из {formatRubles(planDisplay)}
            {season && season.chips.length > 0 ? " (сезон)" : ""} · {percentLabel}
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
          База {formatRubles(summary.planAmount)}
          {season && season.chips.length > 0
            ? ` · сезон ${formatRubles(season.adjustedPlanToDate)} (${season.toDateDeltaPercent >= 0 ? "+" : ""}${season.toDateDeltaPercent}%)`
            : ""}{" "}
          / факт {formatRubles(summary.factAmount)}
        </p>
        {season?.todayLabel ? (
          <Badge variant="outline" className="text-xs">
            Сегодня: {season.todayLabel}
            {season.todayMultiplier !== null
              ? ` (${season.todayMultiplier >= 1 ? "+" : ""}${Math.round((season.todayMultiplier - 1) * 100)}%)`
              : ""}
          </Badge>
        ) : null}
        {season && season.chips.length > 0 ? (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {season.hint}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">{summary.periodHint}</p>
      </CardContent>
    </Card>
  );
}
