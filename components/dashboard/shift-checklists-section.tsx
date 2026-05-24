import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ShiftChecklistsSummary } from "@/modules/dashboard/types";
import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";

type ShiftChecklistsSectionProps = {
  summary: ShiftChecklistsSummary;
};

/** Чеклисты смены: прогресс N/M и пункты с галочками по залам. */
export function ShiftChecklistsSection({ summary }: ShiftChecklistsSectionProps) {
  const { completed, total, groups } = summary;
  const allDone = total > 0 && completed === total;
  const openHallNames = groups
    .filter((g) => g.items.some((i) => !i.completed))
    .map((g) => g.hallName);

  return (
    <section aria-labelledby="shift-checklists-heading">
      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <CardTitle
              id="shift-checklists-heading"
              className="font-heading text-xl font-semibold tracking-tight md:text-2xl"
            >
              Чеклисты смены
            </CardTitle>
            <span
              className={cn(
                "font-heading text-2xl font-semibold tabular-nums",
                allDone ? "text-accent" : "text-foreground"
              )}
              aria-label={`Выполнено ${completed} из ${total} пунктов`}
            >
              {completed}
              <span className="mx-1 text-muted-foreground">/</span>
              {total}
            </span>
          </div>
          <CardDescription>
            {allDone
              ? "Все пункты закрыты"
              : openHallNames.length > 0
                ? `Открытые: ${openHallNames.join(", ")}`
                : "Прогресс открытия смены по залам"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              На сегодня чеклисты не созданы.
            </p>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => {
                const groupCompleted = group.items.filter((i) => i.completed).length;
                const groupTotal = group.items.length;

                return (
                  <div
                    key={group.id}
                    className="rounded-lg border border-border/60 bg-muted/20"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                        {group.hallName}
                      </h3>
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">
                        {groupCompleted} / {groupTotal}
                      </span>
                    </div>
                    <ul className="divide-y divide-border/40" role="list">
                      {group.items.map((item) => (
                        <li
                          key={item.id}
                          className={cn(
                            "flex items-start gap-3 px-4 py-2.5 text-sm",
                            item.completed
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          <span className="mt-0.5 shrink-0" aria-hidden="true">
                            {item.completed ? (
                              <Check
                                className="size-4 text-accent"
                                strokeWidth={2.5}
                              />
                            ) : (
                              <Circle
                                className="size-4 text-border"
                                strokeWidth={1.5}
                              />
                            )}
                          </span>
                          <span className="leading-snug">{item.label}</span>
                          <span className="sr-only">
                            {item.completed ? "выполнено" : "ожидает"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
