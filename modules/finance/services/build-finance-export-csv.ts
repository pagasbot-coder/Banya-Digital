/**
 * CSV-выгрузка /finance: залы (день), план/факт недели, розница день/неделя (T-023 MVP).
 */
import { BUSINESS_TIMEZONE, startOfDay } from "@/lib/date-utils";
import { csvRow, CSV_UTF8_BOM } from "@/lib/csv";
import { getBrandConfig } from "@/lib/brand";
import { getFinanceData } from "@/modules/finance/services/get-finance-data";
import { isFinanceEmpty } from "@/modules/finance/types";
import { getWeekPlanFact } from "@/modules/finance/services/get-week-plan-fact";

function todayIso(): string {
  return startOfDay().toLocaleDateString("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
  });
}

export type FinanceExportResult =
  | { ok: true; filename: string; body: string }
  | { ok: false; status: number; message: string };

/** Собирает CSV-текст для скачивания с /api/finance/export. */
export async function buildFinanceExportCsv(): Promise<FinanceExportResult> {
  const [data, week] = await Promise.all([
    getFinanceData(),
    getWeekPlanFact(),
  ]);

  if (isFinanceEmpty(data)) {
    return {
      ok: false,
      status: 404,
      message: data.message,
    };
  }

  const brand = getBrandConfig();
  const iso = todayIso();
  const lines: string[] = [];

  lines.push(csvRow(["Banya-Digital ERP — финансовая выгрузка"]));
  lines.push(csvRow(["Объект", brand.name]));
  lines.push(csvRow(["Дата (МСК)", iso]));
  lines.push(csvRow(["Период UI", data.dateLabel]));
  lines.push("");

  lines.push(csvRow(["Сводка за день"]));
  lines.push(
    csvRow([
      "Выручка (₽)",
      "COGS (₽)",
      "Валовая маржа (%)",
    ])
  );
  lines.push(
    csvRow([
      data.overallTotals.revenue,
      data.overallTotals.cogs,
      data.overallTotals.marginPercent.toFixed(1),
    ])
  );
  lines.push("");

  if (week) {
    lines.push(csvRow(["План/факт недели (выручка)"]));
    lines.push(
      csvRow(["Период", "План (₽)", "Факт (₽)", "% плана", "План из БД"])
    );
    lines.push(
      csvRow([
        week.weekLabel,
        week.planAmount,
        week.factAmount,
        week.percentOfPlan,
        week.planFromDb ? "да" : "нет",
      ])
    );
    if (week.seasonality && week.seasonality.chips.length > 0) {
      lines.push(
        csvRow([
          "Сезонный план (пн–сегодня, ₽)",
          week.seasonality.adjustedPlanToDate,
          "Поправка %",
          week.seasonality.toDateDeltaPercent,
        ])
      );
      lines.push(csvRow(["Дата", "Событие", "Множитель", "Δ %"]));
      for (const chip of week.seasonality.chips) {
        lines.push(
          csvRow([
            chip.dateLabel,
            chip.label,
            chip.planMultiplier,
            chip.deltaPercent,
          ])
        );
      }
    }
    lines.push("");
  }

  lines.push(csvRow(["Unit economics по залам (день)"]));
  lines.push(csvRow(["Зал", "Выручка (₽)", "COGS (₽)", "Маржа (%)"]));
  for (const row of data.rows) {
    lines.push(
      csvRow([row.hallName, row.revenue, row.cogs, row.marginPercent.toFixed(1)])
    );
  }
  lines.push(
    csvRow([
      "Итого залы",
      data.hallTotals.revenue,
      data.hallTotals.cogs,
      data.hallTotals.marginPercent.toFixed(1),
    ])
  );
  lines.push("");

  if (data.retail.rows.length > 0) {
    lines.push(csvRow(["Розница — день"]));
    lines.push(
      csvRow([
        "Продукт",
        "Категория",
        "Выручка (₽)",
        "COGS (₽)",
        "Маржа (₽)",
        "Маржа (%)",
      ])
    );
    for (const r of data.retail.rows) {
      lines.push(
        csvRow([
          r.name,
          r.category,
          r.dayRevenue,
          r.dayCogs,
          r.dayMarginRub,
          r.dayMarginPercent.toFixed(1),
        ])
      );
    }
    lines.push(
      csvRow([
        "Итого розница день",
        "",
        data.retail.dayRevenue,
        data.retail.dayCogs,
        data.retail.dayMarginRub,
        data.retail.dayMarginPercent.toFixed(1),
      ])
    );
    lines.push("");

    lines.push(csvRow(["Розница — неделя (7 дней)"]));
    lines.push(
      csvRow([
        "Продукт",
        "Категория",
        "Выручка (₽)",
        "COGS (₽)",
        "Маржа (₽)",
        "Маржа (%)",
      ])
    );
    for (const r of data.retail.rows) {
      lines.push(
        csvRow([
          r.name,
          r.category,
          r.weekRevenue,
          r.weekCogs,
          r.weekMarginRub,
          r.weekMarginPercent.toFixed(1),
        ])
      );
    }
    lines.push(
      csvRow([
        "Итого розница неделя",
        "",
        data.retail.weekRevenue,
        data.retail.weekCogs,
        data.retail.weekMarginRub,
        data.retail.weekMarginPercent.toFixed(1),
      ])
    );
  }

  return {
    ok: true,
    filename: `finance-export-${iso}.csv`,
    body: CSV_UTF8_BOM + lines.join("\r\n") + "\r\n",
  };
}
