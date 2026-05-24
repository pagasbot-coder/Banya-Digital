import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProgramTimingRow } from "@/modules/operations/types";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

type ProgramTimingsSectionProps = {
  rows: ProgramTimingRow[];
};

/** Тайминги spa и слоты кухни на сегодня. */
export function ProgramTimingsSection({ rows }: ProgramTimingsSectionProps) {
  return (
    <section aria-labelledby="ops-timings-heading">
      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle
            id="ops-timings-heading"
            className="font-heading text-xl font-semibold tracking-tight md:text-2xl"
          >
            Программы и кухня
          </CardTitle>
          <CardDescription>
            Тайминги spa и слоты синхронизации — статус SLA / конфликт
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Нет таймингов на сегодня
            </p>
          ) : (
            rows.map((row) => (
              <article
                key={row.id}
                className="rounded-lg border border-border/60 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">
                      {row.programName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {row.hallName} · {row.timeLabel}
                      {row.staffLabel ? ` · ${row.staffLabel}` : ""}
                    </p>
                  </div>
                </div>
                {row.kitchenSlots.length > 0 ? (
                  <ul className="mt-3 space-y-2 border-t border-border/40 pt-3">
                    {row.kitchenSlots.map((slot) => (
                      <li
                        key={slot.id}
                        className={cn(
                          "flex flex-wrap items-center justify-between gap-2 text-sm",
                          slot.isConflict && "rounded-md bg-destructive/5 px-2 py-1"
                        )}
                      >
                        <span className="text-muted-foreground">
                          Кухня {slot.station ? `· ${slot.station}` : ""}{" "}
                          {slot.timeLabel}
                        </span>
                        <div className="flex items-center gap-2">
                          {slot.isConflict ? (
                            <AlertTriangle
                              className="size-4 text-destructive"
                              aria-hidden
                            />
                          ) : null}
                          <Badge
                            variant={
                              slot.isConflict ? "destructive" : "outline"
                            }
                          >
                            {slot.syncStatus}
                          </Badge>
                        </div>
                        {slot.notes ? (
                          <p className="w-full text-xs text-muted-foreground">
                            {slot.notes}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Слоты кухни не назначены
                  </p>
                )}
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
