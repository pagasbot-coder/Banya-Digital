import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CriticalAlert } from "@/modules/dashboard/mock-kpis";

type CriticalAlertsSectionProps = {
  alerts: CriticalAlert[];
};

/** Блок критических алертов операционного дня. */
export function CriticalAlertsSection({ alerts }: CriticalAlertsSectionProps) {
  return (
    <section aria-labelledby="critical-alerts-heading">
      <Card className="border-border/80 bg-card/95">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b border-border/60">
          <div>
            <CardTitle
              id="critical-alerts-heading"
              className="font-heading text-lg"
            >
              Критические алерты
            </CardTitle>
            <CardDescription>
              Требуют внимания управляющего смены
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" type="button">
            Все алерты
          </Button>
        </CardHeader>
        <CardContent className="divide-y divide-border/60 p-0">
          <ul>
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        alert.severity === "high" ? "destructive" : "secondary"
                      }
                    >
                      {alert.severity === "high" ? "Высокий" : "Средний"}
                    </Badge>
                    <h3 className="font-medium text-foreground">{alert.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {alert.description}
                  </p>
                </div>
                <time
                  className="shrink-0 text-xs text-muted-foreground sm:text-right"
                  dateTime={alert.timeLabel}
                >
                  {alert.timeLabel}
                </time>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
