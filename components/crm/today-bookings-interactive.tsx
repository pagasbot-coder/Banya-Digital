"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  initialCrmActionState,
  updateBooking,
  updateBookingStatus,
} from "@/modules/crm/actions/crm-actions";
import { BOOKING_STATUS_OPTIONS } from "@/modules/crm/constants";
import type { CrmFormOptions } from "@/modules/crm/services/get-crm-form-options";
import type { TodayBookingRow } from "@/modules/crm/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const fieldClass =
  "min-h-9 rounded-md border border-input bg-background px-2 py-1 text-sm";

function statusVariant(code: string) {
  if (code === "CONFIRMED" || code === "CHECKED_IN") return "secondary" as const;
  if (code === "COMPLETED") return "outline" as const;
  if (code === "CANCELLED" || code === "NO_SHOW") return "destructive" as const;
  return "outline" as const;
}

function toDateInput(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
  }).format(new Date(iso));
}

function toTimeInput(iso: string): string {
  const d = new Date(iso);
  const fmt = d.toLocaleTimeString("ru-RU", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return fmt;
}

type TodayBookingsInteractiveProps = {
  bookings: TodayBookingRow[];
  options: CrmFormOptions;
  defaultBookingDate: string;
};

/** Брони на сегодня с быстрым статусом и редактированием. */
export function TodayBookingsInteractive({
  bookings,
  options,
  defaultBookingDate,
}: TodayBookingsInteractiveProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleStatusChange(bookingId: string, status: string) {
    setStatusError(null);
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, status);
      if (!result.ok) setStatusError(result.message);
    });
  }

  return (
    <section aria-labelledby="crm-bookings-heading">
      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle
            id="crm-bookings-heading"
            className="font-heading text-xl font-semibold tracking-tight md:text-2xl"
          >
            Брони на сегодня
          </CardTitle>
          <CardDescription>
            {bookings.length === 0
              ? "Нет броней на текущую дату"
              : `${bookings.length} записей — статус и слот редактируются`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {statusError ? (
            <p className="text-sm text-destructive" role="alert">
              {statusError}
            </p>
          ) : null}
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Брони не найдены</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Время</TableHead>
                  <TableHead>Гость</TableHead>
                  <TableHead>Зал</TableHead>
                  <TableHead>Программа</TableHead>
                  <TableHead>Гостей</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-[7rem]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="tabular-nums">{b.timeLabel}</TableCell>
                    <TableCell>
                      <Link
                        href={`/crm/guests/${b.guestId}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {b.guestName}
                      </Link>
                    </TableCell>
                    <TableCell>{b.hallName ?? "—"}</TableCell>
                    <TableCell className="max-w-[10rem] truncate">
                      {b.spaProgramName ?? b.serviceName ?? "—"}
                    </TableCell>
                    <TableCell className="text-center">{b.partySize}</TableCell>
                    <TableCell>
                      <select
                        className={cn(fieldClass, "max-w-[9rem]")}
                        value={b.statusCode}
                        disabled={pending}
                        onChange={(e) =>
                          handleStatusChange(b.id, e.target.value)
                        }
                        aria-label={`Статус брони ${b.guestName}`}
                      >
                        {BOOKING_STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditingId(editingId === b.id ? null : b.id)
                        }
                      >
                        {editingId === b.id ? "Скрыть" : "Изменить"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {bookings
            .filter((b) => editingId === b.id)
            .map((b) => (
              <BookingEditPanel
                key={`edit-${b.id}`}
                booking={b}
                options={options}
                defaultBookingDate={defaultBookingDate}
                onClose={() => setEditingId(null)}
              />
            ))}
        </CardContent>
      </Card>
    </section>
  );
}

function BookingEditPanel({
  booking,
  options,
  defaultBookingDate,
  onClose,
}: {
  booking: TodayBookingRow;
  options: CrmFormOptions;
  defaultBookingDate: string;
  onClose: () => void;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Card className="border-accent/30 bg-muted/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Редактирование: {booking.guestName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            startTransition(async () => {
              const result = await updateBooking(initialCrmActionState, formData);
              setMessage(result.message);
              if (result.ok) onClose();
            });
          }}
        >
          <input type="hidden" name="bookingId" value={booking.id} />
          <label className="block space-y-1 text-sm sm:col-span-2">
            <span className="font-medium">Зал</span>
            <select
              name="hallId"
              className={fieldClass + " w-full"}
              defaultValue={booking.hallId ?? ""}
              required
            >
              {options.halls.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm sm:col-span-2">
            <span className="font-medium">Программа</span>
            <select
              name="spaProgramId"
              className={fieldClass + " w-full"}
              defaultValue={booking.spaProgramId ?? ""}
            >
              <option value="">— без программы —</option>
              {options.spaPrograms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Дата</span>
            <input
              type="date"
              name="bookingDate"
              className={fieldClass + " w-full"}
              defaultValue={toDateInput(booking.startsAt) || defaultBookingDate}
              required
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Начало</span>
            <input
              type="time"
              name="startTime"
              className={fieldClass + " w-full"}
              defaultValue={toTimeInput(booking.startsAt)}
              required
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Длительность, мин</span>
            <input
              type="number"
              name="durationMinutes"
              className={fieldClass + " w-full"}
              defaultValue={booking.durationMinutes}
              min={15}
              required
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Гостей</span>
            <input
              type="number"
              name="partySize"
              className={fieldClass + " w-full"}
              defaultValue={booking.partySize}
              min={1}
              required
            />
          </label>
          <label className="block space-y-1 text-sm sm:col-span-2">
            <span className="font-medium">Статус</span>
            <select
              name="status"
              className={fieldClass + " w-full"}
              defaultValue={booking.statusCode}
            >
              {BOOKING_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          {message ? (
            <p
              className={cn(
                "text-sm sm:col-span-2",
                message.includes("Конфликт") || message.includes("Не удалось")
                  ? "text-destructive"
                  : "text-accent"
              )}
            >
              {message}
            </p>
          ) : null}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Сохранение…" : "Сохранить бронь"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
