"use client";

import { useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ShiftChecklistsSummary } from "@/modules/dashboard/types";
import { toggleChecklistItem } from "@/modules/operations/actions/toggle-checklist-item";
import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";

type ShiftChecklistsInteractiveProps = {
  summary: ShiftChecklistsSummary;
};

/** Чеклисты смены с переключением пунктов (T-013, touch ≥44px). */
export function ShiftChecklistsInteractive({
  summary,
}: ShiftChecklistsInteractiveProps) {
  const [pending, startTransition] = useTransition();
  const { completed, total, groups } = summary;
  const allDone = total > 0 && completed === total;
  const openHallNames = groups
    .filter((g) => g.items.some((i) => !i.completed))
    .map((g) => g.hallName);

  function onToggle(itemId: string) {
    startTransition(async () => {
      await toggleChecklistItem(itemId);
    });
  }

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
            {pending
              ? "Сохранение…"
              : allDone
                ? "Все пункты закрыты"
                : openHallNames.length > 0
                  ? `Открытые: ${openHallNames.join(", ")}`
                  : "Нажмите пункт, чтобы отметить выполнение"}
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
                        <li key={item.id}>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => onToggle(item.id)}
                            className={cn(
                              "flex min-h-11 w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors",
                              "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              item.completed
                                ? "text-foreground"
                                : "text-muted-foreground"
                            )}
                            aria-pressed={item.completed}
                          >
                            <span className="mt-0.5 shrink-0" aria-hidden="true">
                              {item.completed ? (
                                <Check
                                  className="size-5 text-accent"
                                  strokeWidth={2.5}
                                />
                              ) : (
                                <Circle
                                  className="size-5 text-border"
                                  strokeWidth={1.5}
                                />
                              )}
                            </span>
                            <span className="leading-snug">{item.label}</span>
                            <span className="sr-only">
                              {item.completed ? "выполнено, снять" : "отметить выполненным"}
                            </span>
                          </button>
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
