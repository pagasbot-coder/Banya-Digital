"use client";

import { useActionState } from "react";
import { createBooking } from "@/modules/crm/actions/crm-actions";
import {
  initialCrmActionState,
  type CrmActionState,
} from "@/modules/crm/actions/crm-action-state";
import { BOOKING_STATUS_OPTIONS } from "@/modules/crm/constants";
import type { CrmFormOptions } from "@/modules/crm/services/get-crm-form-options";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full min-h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function FormMessage({ state }: { state: CrmActionState }) {
  if (!state.message) return null;
  return (
    <p
      role="status"
      className={cn("text-sm", state.ok ? "text-accent" : "text-destructive")}
    >
      {state.message}
    </p>
  );
}

type BookingFormProps = {
  options: CrmFormOptions;
  defaultBookingDate: string;
  defaultGuestId?: string;
};

/** Форма новой брони на сегодня (или выбранную дату). */
export function BookingForm({
  options,
  defaultBookingDate,
  defaultGuestId,
}: BookingFormProps) {
  const [state, formAction, pending] = useActionState(
    createBooking,
    initialCrmActionState
  );

  if (options.guests.length === 0 || options.halls.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Сначала добавьте гостя и убедитесь, что залы загружены (db:seed).
      </p>
    );
  }

  const defaultProgram = options.spaPrograms[0];

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Гость</span>
        <select
          name="guestId"
          className={fieldClass}
          required
          defaultValue={defaultGuestId ?? ""}
        >
          <option value="">— выберите —</option>
          {options.guests.map((g) => (
            <option key={g.id} value={g.id}>
              {g.fullName}
            </option>
          ))}
        </select>
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
        <span className="font-medium">Spa-программа</span>
        <select name="spaProgramId" className={fieldClass} defaultValue="">
          <option value="">— без программы —</option>
          {options.spaPrograms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.durationMinutes} мин)
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Дата</span>
          <input
            type="date"
            name="bookingDate"
            className={fieldClass}
            defaultValue={defaultBookingDate}
            required
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Начало</span>
          <input
            type="time"
            name="startTime"
            className={fieldClass}
            defaultValue="14:00"
            required
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Длительность, мин</span>
          <input
            type="number"
            name="durationMinutes"
            min={15}
            step={15}
            className={fieldClass}
            defaultValue={defaultProgram?.durationMinutes ?? 120}
            required
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Гостей в брони</span>
          <input
            type="number"
            name="partySize"
            min={1}
            className={fieldClass}
            defaultValue={2}
            required
          />
        </label>
      </div>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Статус</span>
        <select name="status" className={fieldClass} defaultValue="PENDING">
          {BOOKING_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <FormMessage state={state} />
      <Button type="submit" disabled={pending}>
        {pending ? "Сохранение…" : "Создать бронь"}
      </Button>
    </form>
  );
}
