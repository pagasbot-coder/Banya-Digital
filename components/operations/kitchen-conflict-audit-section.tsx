import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { KitchenConflictAuditRow } from "@/modules/operations/types";

type KitchenConflictAuditSectionProps = {
  rows: KitchenConflictAuditRow[];
};

/** Журнал разобранных конфликтов kitchen↔SPA (T-018 audit). */
export function KitchenConflictAuditSection({
  rows,
}: KitchenConflictAuditSectionProps) {
  return (
    <section aria-labelledby="kitchen-audit-heading">
      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle
            id="kitchen-audit-heading"
            className="font-heading text-xl font-semibold tracking-tight md:text-2xl"
          >
            Журнал разборов
          </CardTitle>
          <CardDescription>
            Кто и когда закрыл конфликт (демо: системный пользователь)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Записей пока нет — отметьте «Разобрано» у открытого конфликта.
            </p>
          ) : (
            <ul className="space-y-3">
              {rows.map((row) => (
                <li
                  key={`${row.slotId}-${row.resolvedAt.getTime()}`}
                  className="rounded-lg border border-border/60 px-4 py-3 text-sm"
                >
                  <p className="font-medium text-foreground">
                    {row.programName} · {row.hallName}
                  </p>
                  <p className="text-muted-foreground">
                    {row.timeLabel}
                    {row.station ? ` · ${row.station}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Разобрано:{" "}
                    {row.resolvedAt.toLocaleString("ru-RU", {
                      timeZone: "Europe/Moscow",
                      dateStyle: "short",
                      timeStyle: "short",
                    })}{" "}
                    · {row.resolvedBy}
                  </p>
                  {row.notes ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.notes}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
