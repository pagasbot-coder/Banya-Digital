"use server";

import { BookingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { atBusinessTime, startOfDay } from "@/lib/date-utils";
import { prisma } from "@/lib/db";
import { GUEST_SEGMENTS } from "@/modules/crm/constants";
import { findHallBookingConflict } from "@/modules/crm/services/booking-conflict";

export type CrmActionState = {
  ok: boolean;
  message: string;
};

const OK: CrmActionState = { ok: true, message: "" };

function fail(message: string): CrmActionState {
  return { ok: false, message };
}

async function revalidateCrmViews() {
  revalidatePath("/crm");
  revalidatePath("/dashboard");
}

function parseGuestNotes(
  segment: string,
  notes: string
): string | null {
  const trimmedNotes = notes.trim();
  if (segment && GUEST_SEGMENTS.includes(segment as (typeof GUEST_SEGMENTS)[number])) {
    return trimmedNotes || segment;
  }
  return trimmedNotes || null;
}

function parseBookingTimes(
  formData: FormData
): { startsAt: Date; endsAt: Date } | null {
  const dateRaw = String(formData.get("bookingDate") ?? "").slice(0, 10);
  const startRaw = String(formData.get("startTime") ?? "10:00");
  const durationRaw = Number(formData.get("durationMinutes") ?? 120);

  const [y, m, d] = dateRaw.split("-").map(Number);
  const [hh, mm] = startRaw.split(":").map(Number);
  if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) return null;
  if (!Number.isFinite(durationRaw) || durationRaw < 15) return null;

  const base = startOfDay(new Date(Date.UTC(y, m - 1, d)));
  const startsAt = atBusinessTime(base, hh, mm);
  const endsAt = new Date(startsAt.getTime() + durationRaw * 60_000);
  return { startsAt, endsAt };
}

function parseBookingStatus(raw: string): BookingStatus | null {
  if (raw in BookingStatus) return raw as BookingStatus;
  return null;
}

/** Создаёт гостя (имя, телефон, email, сегмент в notes). */
export async function createGuest(
  _prev: CrmActionState,
  formData: FormData
): Promise<CrmActionState> {
  if (!process.env.DATABASE_URL) {
    return fail("DATABASE_URL не задан — ввод недоступен.");
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const segment = String(formData.get("segment") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (fullName.length < 2) return fail("Укажите имя гостя (минимум 2 символа).");

  try {
    const guest = await prisma.guest.create({
      data: {
        fullName,
        phone,
        email,
        notes: parseGuestNotes(segment, notes),
      },
    });

    await revalidateCrmViews();
    return { ok: true, message: `Гость «${guest.fullName}» сохранён.` };
  } catch (error) {
    console.error("[crm] createGuest:", error);
    return fail("Не удалось сохранить гостя.");
  }
}

/** Обновляет контакты гостя. */
export async function updateGuest(
  _prev: CrmActionState,
  formData: FormData
): Promise<CrmActionState> {
  if (!process.env.DATABASE_URL) {
    return fail("DATABASE_URL не задан — ввод недоступен.");
  }

  const id = String(formData.get("guestId") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const segment = String(formData.get("segment") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id) return fail("Гость не найден.");
  if (fullName.length < 2) return fail("Укажите имя гостя (минимум 2 символа).");

  try {
    await prisma.guest.update({
      where: { id },
      data: {
        fullName,
        phone,
        email,
        notes: parseGuestNotes(segment, notes),
      },
    });

    await revalidateCrmViews();
    revalidatePath(`/crm/guests/${id}`);
    return { ok: true, message: "Контакты обновлены." };
  } catch (error) {
    console.error("[crm] updateGuest:", error);
    return fail("Не удалось обновить гостя.");
  }
}

/** Создаёт бронь на зал с проверкой пересечения слота. */
export async function createBooking(
  _prev: CrmActionState,
  formData: FormData
): Promise<CrmActionState> {
  if (!process.env.DATABASE_URL) {
    return fail("DATABASE_URL не задан — ввод недоступен.");
  }

  const guestId = String(formData.get("guestId") ?? "").trim();
  const hallId = String(formData.get("hallId") ?? "").trim();
  const spaProgramId = String(formData.get("spaProgramId") ?? "").trim() || null;
  const partySize = Number(formData.get("partySize") ?? 1);
  const status = parseBookingStatus(String(formData.get("status") ?? "PENDING"));
  const times = parseBookingTimes(formData);

  if (!guestId) return fail("Выберите гостя.");
  if (!hallId) return fail("Выберите зал.");
  if (!status) return fail("Некорректный статус брони.");
  if (!times) return fail("Укажите дату, время начала и длительность.");
  if (!Number.isFinite(partySize) || partySize < 1) {
    return fail("Количество гостей — не меньше 1.");
  }

  const { startsAt, endsAt } = times;
  const conflict = await findHallBookingConflict(hallId, startsAt, endsAt);
  if (conflict.conflict) {
    return fail(
      `Конфликт слота в зале «${conflict.hallName ?? "зал"}»: пересечение с другой бронью. Выберите другое время.`
    );
  }

  try {
    const hall = await prisma.hall.findUnique({ where: { id: hallId } });
    if (!hall) return fail("Зал не найден.");

    const service = await prisma.service.findFirst({
      where: { hallId, isActive: true },
      orderBy: { name: "asc" },
    });

    await prisma.booking.create({
      data: {
        guestId,
        hallId,
        serviceId: service?.id ?? null,
        spaProgramId,
        status,
        startsAt,
        endsAt,
        partySize,
      },
    });

    await revalidateCrmViews();
    return { ok: true, message: "Бронь создана." };
  } catch (error) {
    console.error("[crm] createBooking:", error);
    return fail("Не удалось сохранить бронь.");
  }
}

/** Обновляет бронь (статус, зал, время, программа). */
export async function updateBooking(
  _prev: CrmActionState,
  formData: FormData
): Promise<CrmActionState> {
  if (!process.env.DATABASE_URL) {
    return fail("DATABASE_URL не задан — ввод недоступен.");
  }

  const bookingId = String(formData.get("bookingId") ?? "").trim();
  const hallId = String(formData.get("hallId") ?? "").trim();
  const spaProgramId = String(formData.get("spaProgramId") ?? "").trim() || null;
  const partySize = Number(formData.get("partySize") ?? 1);
  const status = parseBookingStatus(String(formData.get("status") ?? ""));
  const times = parseBookingTimes(formData);

  if (!bookingId) return fail("Бронь не найдена.");
  if (!hallId) return fail("Выберите зал.");
  if (!status) return fail("Некорректный статус брони.");
  if (!times) return fail("Укажите дату, время и длительность.");
  if (!Number.isFinite(partySize) || partySize < 1) {
    return fail("Количество гостей — не меньше 1.");
  }

  const { startsAt, endsAt } = times;
  const conflict = await findHallBookingConflict(
    hallId,
    startsAt,
    endsAt,
    bookingId
  );
  if (conflict.conflict) {
    return fail(
      `Конфликт слота в зале «${conflict.hallName ?? "зал"}»: пересечение с другой бронью.`
    );
  }

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        hallId,
        spaProgramId,
        status,
        startsAt,
        endsAt,
        partySize,
      },
    });

    await revalidateCrmViews();
    return { ok: true, message: "Бронь обновлена." };
  } catch (error) {
    console.error("[crm] updateBooking:", error);
    return fail("Не удалось обновить бронь.");
  }
}

/** Быстрое изменение статуса брони из таблицы. */
export async function updateBookingStatus(
  bookingId: string,
  statusRaw: string
): Promise<CrmActionState> {
  if (!process.env.DATABASE_URL) {
    return fail("DATABASE_URL не задан.");
  }

  const status = parseBookingStatus(statusRaw);
  if (!status) return fail("Некорректный статус.");

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
    await revalidateCrmViews();
    return OK;
  } catch (error) {
    console.error("[crm] updateBookingStatus:", error);
    return fail("Не удалось обновить статус.");
  }
}

export const initialCrmActionState: CrmActionState = OK;
