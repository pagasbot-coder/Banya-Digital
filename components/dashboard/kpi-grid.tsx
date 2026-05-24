import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardKpiMetric, KpiTrend } from "@/modules/dashboard/mock-kpis";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Percent,
  RussianRuble,
  Users,
} from "lucide-react";

const kpiIcons = {
  hall_load: Users,
  daily_revenue: RussianRuble,
  margin: Percent,
  inventory_alerts: AlertTriangle,
} as const;

function trendBadgeVariant(trend: KpiTrend) {
  if (trend === "up") return "secondary" as const;
  if (trend === "down") return "destructive" as const;
  return "outline" as const;
}

type KpiGridProps = {
  metrics: DashboardKpiMetric[];
};

/** Сетка KPI-карточек для главного dashboard. */
export function KpiGrid({ metrics }: KpiGridProps) {
  return (
    <section aria-labelledby="dashboard-kpis-heading">
      <h2 id="dashboard-kpis-heading" className="sr-only">
        Ключевые показатели
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = kpiIcons[metric.id];

          return (
            <li key={metric.id}>
              <Card className="h-full border-border/80 bg-card/95 py-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">
                      {metric.label}
                    </CardDescription>
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent"
                      aria-hidden
                    >
                      <Icon className="size-4" />
                    </span>
                  </div>
                  <CardTitle className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
                    {metric.value}
                    {metric.suffix ? (
                      <span className="ml-1 text-lg font-medium text-muted-foreground">
                        {metric.suffix}
                      </span>
                    ) : null}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pb-5">
                  {metric.delta ? (
                    <Badge
                      variant={trendBadgeVariant(metric.delta.trend)}
                      className={cn(
                        metric.delta.trend === "up" &&
                          "border-accent/30 bg-accent/10 text-accent-foreground dark:text-accent"
                      )}
                    >
                      {metric.delta.label}
                    </Badge>
                  ) : null}
                  <p className="text-xs text-muted-foreground">{metric.hint}</p>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
