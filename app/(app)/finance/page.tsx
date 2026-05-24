import { HallEconomicsSection } from "@/components/finance/hall-economics-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRubles } from "@/lib/format-money";
import { getFinanceData, isFinanceEmpty } from "@/modules/finance";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const data = await getFinanceData();

  if (isFinanceEmpty(data)) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <header>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Модуль
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Финансы
          </h1>
        </header>
        <div
          role="status"
          className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-6 py-10 text-center"
        >
          <p className="text-sm text-muted-foreground">{data.message}</p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            npm run db:push && npm run db:seed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-accent">
          Модуль
        </p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Финансы
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Unit economics за сегодня: выручка, COGS и маржа по залам из PostgreSQL.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Выручка сегодня</CardDescription>
            <CardTitle className="font-heading text-2xl tabular-nums">
              {formatRubles(data.totals.revenue)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>COGS сегодня</CardDescription>
            <CardTitle className="font-heading text-2xl tabular-nums text-muted-foreground">
              {formatRubles(data.totals.cogs)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Валовая маржа</CardDescription>
            <CardTitle className="font-heading text-2xl tabular-nums">
              {data.totals.marginPercent.toFixed(1).replace(".", ",")}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">{data.dateLabel}</p>
          </CardContent>
        </Card>
      </div>

      <HallEconomicsSection
        dateLabel={data.dateLabel}
        rows={data.rows}
        totals={data.totals}
      />
    </div>
  );
}
