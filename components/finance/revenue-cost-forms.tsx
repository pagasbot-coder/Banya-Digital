"use client";

import { useActionState } from "react";
import {
  createCostLine,
  createRevenueLine,
  initialFinanceActionState,
  type FinanceActionState,
} from "@/modules/finance/actions/create-finance-lines";
import type { FinanceFormOptions } from "@/modules/finance/services/get-finance-form-options";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RevenueCostFormsProps = {
  options: FinanceFormOptions;
  defaultBusinessDate: string;
};

const fieldClass =
  "w-full min-h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function FormMessage({ state }: { state: FinanceActionState }) {
  if (!state.message) return null;
  return (
    <p
      role="status"
      className={cn(
        "text-sm",
        state.ok ? "text-accent" : "text-destructive"
      )}
    >
      {state.message}
    </p>
  );
}

/** Формы ввода выручки и COGS за бизнес-день (пилот T-011). */
export function RevenueCostForms({
  options,
  defaultBusinessDate,
}: RevenueCostFormsProps) {
  const [revenueState, revenueAction, revenuePending] = useActionState(
    createRevenueLine,
    initialFinanceActionState
  );
  const [costState, costAction, costPending] = useActionState(
    createCostLine,
    initialFinanceActionState
  );

  if (options.halls.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Справочники пусты — выполните npm run db:seed.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Выручка</CardTitle>
          <CardDescription>
            RevenueLine — привязка к залу и услуге за выбранный день
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={revenueAction} className="space-y-4">
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Бизнес-день</span>
              <input
                type="date"
                name="businessDate"
                defaultValue={defaultBusinessDate}
                className={fieldClass}
                required
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Зал</span>
              <select name="hallId" className={fieldClass} required>
                <option value="">— выберите —</option>
                {options.halls.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Услуга (опционально)</span>
              <select name="serviceId" className={fieldClass} defaultValue="">
                <option value="">— без услуги —</option>
                {options.services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Сумма, ₽</span>
              <input
                type="number"
                name="amount"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                className={fieldClass}
                placeholder="15000"
                required
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Комментарий</span>
              <input
                type="text"
                name="description"
                className={fieldClass}
                placeholder="Доп. сеанс, бар…"
              />
            </label>
            <FormMessage state={revenueState} />
            <Button type="submit" disabled={revenuePending} className="min-h-11 w-full sm:w-auto">
              {revenuePending ? "Сохранение…" : "Добавить выручку"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg">COGS</CardTitle>
          <CardDescription>
            CostLine — себестоимость; партия органики по FIFO (опционально)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={costAction} className="space-y-4">
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Бизнес-день</span>
              <input
                type="date"
                name="businessDate"
                defaultValue={defaultBusinessDate}
                className={fieldClass}
                required
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Зал (опционально)</span>
              <select name="hallId" className={fieldClass} defaultValue="">
                <option value="">— общий —</option>
                {options.halls.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Партия склада (опционально)</span>
              <select name="lotId" className={fieldClass} defaultValue="">
                <option value="">— без партии —</option>
                {options.lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Сумма, ₽</span>
              <input
                type="number"
                name="amount"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                className={fieldClass}
                placeholder="3200"
                required
              />
            </label>
            <input type="hidden" name="costType" value="COGS" />
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Комментарий</span>
              <input
                type="text"
                name="description"
                className={fieldClass}
                placeholder="Списание сена…"
              />
            </label>
            <FormMessage state={costState} />
            <Button type="submit" disabled={costPending} className="min-h-11 w-full sm:w-auto">
              {costPending ? "Сохранение…" : "Добавить COGS"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
