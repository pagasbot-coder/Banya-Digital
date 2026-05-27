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

type WeekPlanFactSectionProps = {
  summary: WeekPlanFactSummary;
};

/** Блок план/факт на странице финансов. */
export function WeekPlanFactSection({ summary }: WeekPlanFactSectionProps) {
  const percentLabel = `${summary.percentOfPlan.toFixed(1).replace(".", ",")}%`;

  return (
    <section aria-labelledby="week-plan-fact-heading" className="space-y-4">
      <h2
        id="week-plan-fact-heading"
        className="font-heading text-lg font-semibold tracking-tight"
      >
        План / факт недели
      </h2>
      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader className="pb-2">
          <CardDescription>{summary.weekLabel} · МСК</CardDescription>
          <CardTitle className="font-heading text-2xl tabular-nums">
            Неделя: план {formatRubles(summary.planAmount)} / факт{" "}
            {formatRubles(summary.factAmount)} / {percentLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">План</p>
              <p className="font-heading text-xl tabular-nums">
                {formatRubles(summary.planAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Факт</p>
              <p className="font-heading text-xl tabular-nums">
                {formatRubles(summary.factAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Выполнение</p>
              <p className="font-heading text-xl tabular-nums">{percentLabel}</p>
            </div>
          </div>
          <Badge
            variant={summary.meetsPlan ? "secondary" : "outline"}
            className={cn(
              summary.meetsPlan &&
                "border-accent/30 bg-accent/10 text-accent-foreground dark:text-accent"
            )}
          >
            {summary.meetsPlan
              ? "План выполнен или перевыполнен"
              : summary.deltaLabel}
          </Badge>
          <p className="text-xs text-muted-foreground">{summary.periodHint}</p>
        </CardContent>
      </Card>
    </section>
  );
}
