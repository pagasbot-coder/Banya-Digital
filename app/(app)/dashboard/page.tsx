import { CriticalAlertsSection } from "@/components/dashboard/critical-alerts-section";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { TodayOperationsSection } from "@/components/dashboard/today-operations-section";
import { Button } from "@/components/ui/button";
import {
  mockCriticalAlerts,
  mockDashboardKpis,
  mockTodayOperations,
} from "@/modules/dashboard/mock-kpis";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Операционный зал
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Сводка KPI, алерты и операции смены — данные mock до подключения БД.
          </p>
        </div>
        <Button variant="outline" size="sm" type="button">
          Экспорт отчёта
        </Button>
      </header>

      <KpiGrid metrics={mockDashboardKpis} />

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <CriticalAlertsSection alerts={mockCriticalAlerts} />
        </div>
        <div className="xl:col-span-2">
          <TodayOperationsSection rows={mockTodayOperations} />
        </div>
      </div>
    </div>
  );
}
