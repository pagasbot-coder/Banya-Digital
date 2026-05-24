import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { KpiTrend, MarginSummary } from "@/modules/dashboard/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Percent } from "lucide-react";

function trendBadgeVariant(trend: KpiTrend) {
  if (trend === "up") return "secondary" as const;
  if (trend === "down") return "destructive" as const;
  return "outline" as const;
}

type MarginSectionProps = {
  margin: MarginSummary;
};

/** Общая маржа и разбивка по услугам с подсветкой &lt; 40%. */
export function MarginSection({ margin }: MarginSectionProps) {
  const lowMarginCount = margin.byService.filter((s) => s.belowThreshold).length;

  return (
    <section aria-labelledby="margin-heading" className="grid gap-4 lg:grid-cols-3">
      <Card className="border-border/80 bg-card/95 shadow-sm lg:col-span-1">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardDescription className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
              Маржа (общая)
            </CardDescription>
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent"
              aria-hidden
            >
              <Percent className="size-4" />
            </span>
          </div>
          <CardTitle className="font-heading text-3xl font-semibold tabular-nums">
            {margin.overallPercent.toFixed(1).replace(".", ",")}
            <span className="ml-1 text-lg font-medium text-muted-foreground">
              %
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pb-5">
          {margin.delta ? (
            <Badge variant={trendBadgeVariant(margin.delta.trend)}>
              {margin.delta.label}
            </Badge>
          ) : null}
          <p className="text-xs text-muted-foreground">{margin.hint}</p>
          {lowMarginCount > 0 ? (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
              {lowMarginCount} услуг(и) ниже 40%
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/95 shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-heading text-xl font-semibold tracking-tight md:text-2xl">
            Маржа по услугам
          </CardTitle>
          <CardDescription>За текущий день, порог алерта — 40%</CardDescription>
        </CardHeader>
        <CardContent>
          {margin.byService.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Нет выручки по услугам за сегодня
            </p>
          ) : (
            <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
              {margin.byService.map((row) => (
                <li
                  key={row.serviceId}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-2 px-4 py-3",
                    row.belowThreshold && "bg-destructive/5"
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    {row.belowThreshold ? (
                      <AlertTriangle
                        className="size-4 shrink-0 text-destructive"
                        aria-label="Низкая маржа"
                      />
                    ) : null}
                    <span className="text-sm text-foreground">
                      {row.serviceName}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "font-heading text-lg tabular-nums",
                      row.belowThreshold
                        ? "text-destructive"
                        : "text-foreground"
                    )}
                  >
                    {row.marginPercent.toFixed(1).replace(".", ",")}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
