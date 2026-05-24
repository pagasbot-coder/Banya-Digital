import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { KpiTrend, RevenuePeriodMetric } from "@/modules/dashboard/types";
import { cn } from "@/lib/utils";
import { RussianRuble } from "lucide-react";

function trendBadgeVariant(trend: KpiTrend) {
  if (trend === "up") return "secondary" as const;
  if (trend === "down") return "destructive" as const;
  return "outline" as const;
}

type RevenuePeriodsSectionProps = {
  periods: RevenuePeriodMetric[];
};

/** Выручка: день, неделя, месяц. */
export function RevenuePeriodsSection({ periods }: RevenuePeriodsSectionProps) {
  return (
    <section aria-labelledby="revenue-periods-heading">
      <h2 id="revenue-periods-heading" className="sr-only">
        Выручка по периодам
      </h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        {periods.map((period) => (
          <li key={period.id}>
            <Card className="h-full border-border/80 bg-card/95 py-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardDescription className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
                    {period.label}
                  </CardDescription>
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent"
                    aria-hidden
                  >
                    <RussianRuble className="size-4" />
                  </span>
                </div>
                <CardTitle className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
                  {period.value}
                  <span className="ml-1 text-lg font-medium text-muted-foreground">
                    {period.suffix}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-5">
                {period.delta ? (
                  <Badge
                    variant={trendBadgeVariant(period.delta.trend)}
                    className={cn(
                      period.delta.trend === "up" &&
                        "border-accent/30 bg-accent/10 text-accent-foreground dark:text-accent"
                    )}
                  >
                    {period.delta.label}
                  </Badge>
                ) : null}
                <p className="text-xs text-muted-foreground">{period.hint}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
