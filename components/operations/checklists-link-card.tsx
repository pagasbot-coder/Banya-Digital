import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { ChecklistLinkSummary } from "@/modules/operations/types";
import { cn } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

type ChecklistsLinkCardProps = {
  summary: ChecklistLinkSummary;
};

/** Ссылка на чеклисты смены (полный UI на сводке). */
export function ChecklistsLinkCard({ summary }: ChecklistsLinkCardProps) {
  const pct =
    summary.total > 0
      ? Math.round((summary.completed / summary.total) * 100)
      : 0;

  return (
    <Card className="border-border/80 bg-card/95 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardDescription className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
            Чеклисты смены
          </CardDescription>
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent"
            aria-hidden
          >
            <ClipboardList className="size-4" />
          </span>
        </div>
        <CardTitle className="font-heading text-3xl font-semibold tabular-nums">
          {summary.completed}
          <span className="text-lg font-medium text-muted-foreground">
            {" "}
            / {summary.total}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-5">
        <p className="text-sm text-muted-foreground">
          {summary.groupsCount} групп(ы) чеклистов на сегодня · {pct}%
          выполнено
        </p>
        <p className="text-xs text-muted-foreground">
          Детальные пункты с галочками — на странице{" "}
          <span className="text-foreground">Сводка</span>
        </p>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Открыть чеклисты на сводке
        </Link>
      </CardContent>
    </Card>
  );
}
