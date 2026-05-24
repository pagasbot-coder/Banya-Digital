import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TodayOperationRow } from "@/modules/dashboard/types";

type TodayOperationsSectionProps = {
  rows: TodayOperationRow[];
};

/** Сводка операций за день: загрузка залов, тайминги, чеклисты. */
export function TodayOperationsSection({ rows }: TodayOperationsSectionProps) {
  return (
    <section aria-labelledby="today-ops-heading">
      <Card className="border-border/80 bg-card/95">
        <CardHeader>
          <CardTitle
            id="today-ops-heading"
            className="font-heading text-xl font-semibold tracking-tight md:text-2xl"
          >
            Операции сегодня
          </CardTitle>
          <CardDescription>
            Загрузка залов, тайминги и чеклисты — сводка смены
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map((row) => (
              <div
                key={row.id}
                className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3"
              >
                <dt className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {row.label}
                </dt>
                <dd className="mt-1 font-heading text-2xl font-semibold tabular-nums text-foreground">
                  {row.value}
                </dd>
                {row.note ? (
                  <dd className="mt-1 text-xs text-muted-foreground">{row.note}</dd>
                ) : null}
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </section>
  );
}
