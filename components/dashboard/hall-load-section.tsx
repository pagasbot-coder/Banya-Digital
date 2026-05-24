import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HallLoadRow } from "@/modules/dashboard/types";
import { cn } from "@/lib/utils";

type HallLoadSectionProps = {
  rows: HallLoadRow[];
};

/** Загрузка залов: отдельная строка на зал + итоговая средняя. */
export function HallLoadSection({ rows }: HallLoadSectionProps) {
  return (
    <section aria-labelledby="hall-load-heading">
      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle
            id="hall-load-heading"
            className="font-heading text-xl font-semibold tracking-tight md:text-2xl"
          >
            Загрузка залов
          </CardTitle>
          <CardDescription>
            Процент загрузки за текущую смену по каждому залу
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
            {rows.map((row) => (
              <li
                key={row.id}
                className={cn(
                  "flex items-center justify-between gap-4 px-4 py-3",
                  row.isTotal && "bg-muted/40 font-medium"
                )}
              >
                <span
                  className={cn(
                    "text-sm",
                    row.isTotal
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {row.label}
                </span>
                <span className="font-heading text-xl tabular-nums text-foreground">
                  {row.percent}
                  <span className="ml-0.5 text-sm font-medium text-muted-foreground">
                    %
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
