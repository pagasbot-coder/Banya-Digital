import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WamzSummary } from "@/modules/dashboard/types";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

type WamzCardProps = {
  summary: WamzSummary;
};

/** KPI North Star: Weekly Active Managed Zones. */
export function WamzCard({ summary }: WamzCardProps) {
  const value = `${summary.activeCount}/${summary.totalCount}`;
  const targetLabel = `цель пилота ≥${summary.pilotTarget}/${summary.totalCount}`;

  return (
    <Card className="h-full border-border/80 bg-card/95 py-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardDescription className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
            WAMZ
          </CardDescription>
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent"
            aria-hidden
          >
            <Layers className="size-4" />
          </span>
        </div>
        <CardTitle className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
          {value}
          <span className="ml-1 text-lg font-medium text-muted-foreground">
            зон
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pb-5">
        <Badge
          variant={summary.meetsPilotTarget ? "secondary" : "destructive"}
          className={cn(
            summary.meetsPilotTarget &&
              "border-accent/30 bg-accent/10 text-accent-foreground dark:text-accent"
          )}
        >
          {summary.meetsPilotTarget ? "В цели пилота" : "Ниже цели пилота"}
        </Badge>
        <p className="text-xs text-muted-foreground">{summary.hint}</p>
        <p className="text-xs text-muted-foreground">{targetLabel}</p>
        {summary.inactiveHalls.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Без активности: {summary.inactiveHalls.join(", ")}
          </p>
        ) : (
          <p className="text-xs text-accent">Все зоны активны за неделю</p>
        )}
      </CardContent>
    </Card>
  );
}
