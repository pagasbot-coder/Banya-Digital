import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { InventoryAlertsSummary } from "@/modules/dashboard/types";
import { AlertTriangle } from "lucide-react";

type InventoryAlertsCardProps = {
  summary: InventoryAlertsSummary;
};

/** KPI алертов склада (FIFO, срок годности). */
export function InventoryAlertsCard({ summary }: InventoryAlertsCardProps) {
  return (
    <Card className="border-border/80 bg-card/95 py-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardDescription className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
            Алерты склада
          </CardDescription>
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent"
            aria-hidden
          >
            <AlertTriangle className="size-4" />
          </span>
        </div>
        <CardTitle className="font-heading text-3xl font-semibold tabular-nums">
          {summary.count}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pb-5">
        <Badge
          variant={summary.criticalCount > 0 ? "destructive" : "secondary"}
        >
          {summary.criticalCount > 0
            ? `${summary.criticalCount} критичных`
            : "в норме"}
        </Badge>
        <p className="text-xs text-muted-foreground">{summary.hint}</p>
      </CardContent>
    </Card>
  );
}
