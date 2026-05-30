"use client";

import { useActionState } from "react";
import { createGuest, updateGuest } from "@/modules/crm/actions/crm-actions";
import {
  initialCrmActionState,
  type CrmActionState,
} from "@/modules/crm/actions/crm-action-state";
import { GUEST_SEGMENTS } from "@/modules/crm/constants";
import type { GuestDetail } from "@/modules/crm/services/get-guest-detail";
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

type GuestFormProps = {
  guest?: GuestDetail;
};

/** Форма создания / редактирования гостя. */
export function GuestForm({ guest }: GuestFormProps) {
  const action = guest ? updateGuest : createGuest;
  const [state, formAction, pending] = useActionState(
    action,
    initialCrmActionState
  );

  return (
    <form action={formAction} className="space-y-4">
      {guest ? <input type="hidden" name="guestId" value={guest.id} /> : null}
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Имя</span>
        <input
          name="fullName"
          className={fieldClass}
          defaultValue={guest?.fullName ?? ""}
          required
          minLength={2}
        />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Телефон</span>
        <input
          name="phone"
          type="tel"
          className={fieldClass}
          defaultValue={guest?.phone ?? ""}
          placeholder="+7 916 000-00-00"
        />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Email (опционально)</span>
        <input
          name="email"
          type="email"
          className={fieldClass}
          defaultValue={guest?.email ?? ""}
        />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Сегмент</span>
        <select name="segment" className={fieldClass} defaultValue={guest?.segment ?? ""}>
          <option value="">— не указан —</option>
          {GUEST_SEGMENTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Заметки</span>
        <textarea
          name="notes"
          rows={3}
          className={fieldClass}
          defaultValue={guest?.notes ?? ""}
          placeholder="Предпочтения, аллергии…"
        />
      </label>
      <FormMessage state={state} />
      <Button type="submit" disabled={pending}>
        {pending ? "Сохранение…" : guest ? "Сохранить" : "Добавить гостя"}
      </Button>
    </form>
  );
}
