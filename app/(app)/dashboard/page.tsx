import { CriticalAlertsSection } from "@/components/dashboard/critical-alerts-section";
import { HallLoadSection } from "@/components/dashboard/hall-load-section";
import { InventoryAlertsCard } from "@/components/dashboard/inventory-alerts-card";
import { MarginSection } from "@/components/dashboard/margin-section";
import { RevenuePeriodsSection } from "@/components/dashboard/revenue-periods-section";
import { ShiftChecklistsInteractive } from "@/components/dashboard/shift-checklists-interactive";
import { TodayOperationsSection } from "@/components/dashboard/today-operations-section";
import { Button } from "@/components/ui/button";
import { getDashboardData } from "@/modules/dashboard/services/get-dashboard-data";
import { isDashboardEmpty } from "@/modules/dashboard/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (isDashboardEmpty(data)) {
    return (
      <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
        <header>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Операционный зал
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Сводка
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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Операционный зал
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Сводка
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Показатели, алерты и операции смены — данные из PostgreSQL в реальном
            времени.
          </p>
        </div>
        <Button variant="outline" size="sm" type="button">
          Экспорт отчёта
        </Button>
      </header>

      <div className="grid gap-6 xl:grid-cols-4">
        <div className="xl:col-span-3">
          <HallLoadSection rows={data.hallLoads} />
        </div>
        <div className="xl:col-span-1">
          <InventoryAlertsCard summary={data.inventoryAlerts} />
        </div>
      </div>

      <RevenuePeriodsSection periods={data.revenuePeriods} />

      <MarginSection margin={data.margin} />

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <CriticalAlertsSection alerts={data.alerts} />
        </div>
        <div className="flex flex-col gap-6 xl:col-span-2">
          <TodayOperationsSection rows={data.operations} />
          <ShiftChecklistsInteractive summary={data.shiftChecklists} />
        </div>
      </div>
    </div>
  );
}
