import { FinanceExportLink } from "@/components/finance/finance-export-link";
import { RevenueCostForms } from "@/components/finance/revenue-cost-forms";
import { WeekPlanFactSection } from "@/components/finance/week-plan-fact-section";
import { HallEconomicsSection } from "@/components/finance/hall-economics-section";
import { RetailSection } from "@/components/finance/retail-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BUSINESS_TIMEZONE, startOfDay } from "@/lib/date-utils";
import { formatRubles } from "@/lib/format-money";
import { getFinanceData, isFinanceEmpty } from "@/modules/finance";
import { getFinanceFormOptions } from "@/modules/finance/services/get-finance-form-options";
import { normalizeFinanceResult } from "@/modules/finance/services/finance-safe-defaults";
import { getWeekPlanFact } from "@/modules/finance/services/get-week-plan-fact";
import type { FinanceFormOptions } from "@/modules/finance/services/get-finance-form-options";
import type { FinanceResult } from "@/modules/finance/types";
import type { WeekPlanFactSummary } from "@/modules/finance/services/get-week-plan-fact";

export const dynamic = "force-dynamic";

function todayInputValue(): string {
  return startOfDay().toLocaleDateString("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
  });
}

/** Безопасная загрузка данных страницы — ни один reject не роняет RSC. */
async function loadFinancePageData(): Promise<{
  rawData: FinanceResult;
  formOptions: FinanceFormOptions;
  weekPlanFact: WeekPlanFactSummary | null;
}> {
  const [dataResult, formResult, weekResult] = await Promise.allSettled([
    getFinanceData(),
    getFinanceFormOptions(),
    getWeekPlanFact(),
  ]);

  const rawData: FinanceResult =
    dataResult.status === "fulfilled" && dataResult.value
      ? dataResult.value
      : {
          kind: "empty",
          message:
            "Не удалось загрузить финансы. Проверьте DATABASE_URL и npm run db:push.",
        };

  const formOptions =
    formResult.status === "fulfilled" && formResult.value
      ? formResult.value
      : { halls: [], services: [], lots: [] };

  const weekPlanFact =
    weekResult.status === "fulfilled" ? weekResult.value : null;

  if (dataResult.status === "rejected") {
    console.error("[finance] page getFinanceData rejected:", dataResult.reason);
  }
  if (formResult.status === "rejected") {
    console.error("[finance] page form options rejected:", formResult.reason);
  }
  if (weekResult.status === "rejected") {
    console.error("[finance] page week plan/fact rejected:", weekResult.reason);
  }

  return { rawData, formOptions, weekPlanFact };
}

export default async function FinancePage() {
  const { rawData, formOptions, weekPlanFact } = await loadFinancePageData();
  const { finance: data, warning: dataWarning } = normalizeFinanceResult(rawData);
  const defaultBusinessDate = todayInputValue();

  const noCatalog =
    formOptions.halls.length === 0 && isFinanceEmpty(rawData);

  if (noCatalog) {
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
          <p className="text-sm text-muted-foreground">
            {isFinanceEmpty(rawData) ? rawData.message : "Справочники пусты."}
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            npm run db:push && npm run db:seed
          </p>
        </div>
      </div>
    );
  }

  const hasTodayLines =
    data.rows.length > 0 || data.retail.rows.length > 0;
  const marginPct = Number.isFinite(data.overallTotals.marginPercent)
    ? data.overallTotals.marginPercent
    : 0;

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Модуль
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Финансы
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Unit economics за сегодня: выручка, COGS и маржа по залам из PostgreSQL.
          </p>
        </div>
        <FinanceExportLink />
      </header>

      {dataWarning ? (
        <div
          role="status"
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
        >
          {dataWarning} Формы ввода доступны — данные могут обновиться после сохранения.
        </div>
      ) : null}

      {weekPlanFact ? <WeekPlanFactSection summary={weekPlanFact} /> : null}

      {!hasTodayLines ? (
        <div
          role="status"
          className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-3 text-sm text-muted-foreground"
        >
          За сегодня ещё нет строк — добавьте выручку или COGS в форме ниже.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Выручка сегодня</CardDescription>
            <CardTitle className="font-heading text-2xl tabular-nums">
              {formatRubles(data.overallTotals.revenue)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>COGS сегодня</CardDescription>
            <CardTitle className="font-heading text-2xl tabular-nums text-muted-foreground">
              {formatRubles(data.overallTotals.cogs)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Валовая маржа</CardDescription>
            <CardTitle className="font-heading text-2xl tabular-nums">
              {marginPct.toFixed(1).replace(".", ",")}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">{data.dateLabel}</p>
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="finance-entry-heading" className="space-y-4">
        <h2
          id="finance-entry-heading"
          className="font-heading text-lg font-semibold tracking-tight"
        >
          Ввод за день
        </h2>
        <RevenueCostForms
          options={formOptions}
          defaultBusinessDate={defaultBusinessDate}
        />
      </section>

      {hasTodayLines ? (
        <>
          <HallEconomicsSection
            dateLabel={data.dateLabel}
            rows={data.rows}
            totals={data.hallTotals}
          />

          <RetailSection dateLabel={data.dateLabel} retail={data.retail} />
        </>
      ) : null}
    </div>
  );
}
