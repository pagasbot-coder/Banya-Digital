"use client";

import { useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { KitchenConflictRow } from "@/modules/operations/types";
import { resolveKitchenConflict } from "@/modules/operations/actions/resolve-kitchen-conflict";
import { AlertTriangle } from "lucide-react";

type KitchenConflictsSectionProps = {
  conflicts: KitchenConflictRow[];
};

/** Открытые конфликты kitchen↔SPA с действием «Разобрано» (T-018). */
export function KitchenConflictsSection({
  conflicts,
}: KitchenConflictsSectionProps) {
  const [pending, startTransition] = useTransition();

  function onResolve(slotId: string) {
    startTransition(async () => {
      await resolveKitchenConflict(slotId);
    });
  }

  return (
    <section aria-labelledby="kitchen-conflicts-heading">
      <Card className="border-destructive/30 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle
            id="kitchen-conflicts-heading"
            className="flex items-center gap-2 font-heading text-xl font-semibold tracking-tight md:text-2xl"
          >
            <AlertTriangle className="size-5 text-destructive" aria-hidden />
            Конфликты кухня ↔ SPA
          </CardTitle>
          <CardDescription>
            {conflicts.length === 0
              ? "Нет открытых конфликтов на сегодня"
              : `${conflicts.length} требуют разбора до закрытия смены`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {conflicts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Все конфликты разобраны или слотов с SLA нет.
            </p>
          ) : (
            conflicts.map((row) => (
              <article
                key={row.slotId}
                className="flex flex-col gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{row.programName}</p>
                  <p className="text-sm text-muted-foreground">
                    {row.hallName} · {row.timeLabel}
                    {row.station ? ` · ${row.station}` : ""}
                  </p>
                  {row.notes ? (
                    <p className="mt-1 text-xs text-muted-foreground">{row.notes}</p>
                  ) : null}
                  <Badge variant="destructive" className="mt-2">
                    Конфликт / SLA
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11 shrink-0"
                  disabled={pending}
                  onClick={() => onResolve(row.slotId)}
                >
                  Разобрано
                </Button>
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
