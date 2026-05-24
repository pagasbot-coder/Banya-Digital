/**
 * CRM: гости и бронирования на сегодня из PostgreSQL.
 */
import { addDays, formatTimeRange, startOfDay } from "@/lib/date-utils";
import { prisma } from "@/lib/db";
import type { CrmResult, GuestRow, TodayBookingRow } from "@/modules/crm/types";

const EMPTY_MESSAGE =
  "База пуста — выполните: npm run db:push && npm run db:seed";

const BOOKING_STATUS_RU: Record<string, string> = {
  PENDING: "Ожидает",
  CONFIRMED: "Подтверждена",
  CHECKED_IN: "На объекте",
  COMPLETED: "Завершена",
  CANCELLED: "Отменена",
  NO_SHOW: "Не пришёл",
};

export async function getCrmData(): Promise<CrmResult> {
  if (!process.env.DATABASE_URL) {
    return {
      kind: "empty",
      message:
        "DATABASE_URL не задан. Скопируйте .env.example → .env и запустите Docker PostgreSQL.",
    };
  }

  try {
    const guestCount = await prisma.guest.count();
    if (guestCount === 0) {
      return { kind: "empty", message: EMPTY_MESSAGE };
    }

    const today = startOfDay();
    const tomorrow = addDays(today, 1);

    const guests = await prisma.guest.findMany({
      orderBy: { fullName: "asc" },
      include: {
        bookings: {
          where: {
            startsAt: { gte: today, lt: tomorrow },
            status: { notIn: ["CANCELLED"] },
          },
        },
      },
    });

    const guestRows: GuestRow[] = guests.map((g) => ({
      id: g.id,
      fullName: g.fullName,
      phone: g.phone,
      email: g.email,
      bookingsToday: g.bookings.length,
    }));

    const bookings = await prisma.booking.findMany({
      where: {
        startsAt: { gte: today, lt: tomorrow },
      },
      include: {
        guest: true,
        hall: true,
        service: true,
      },
      orderBy: { startsAt: "asc" },
    });

    const todayBookings: TodayBookingRow[] = bookings.map((b) => ({
      id: b.id,
      guestName: b.guest.fullName,
      hallName: b.hall?.name ?? null,
      serviceName: b.service?.name ?? null,
      timeLabel: formatTimeRange(b.startsAt, b.endsAt),
      status: BOOKING_STATUS_RU[b.status] ?? b.status,
      statusCode: b.status,
      partySize: b.partySize,
    }));

    return {
      kind: "data",
      guests: guestRows,
      todayBookings,
    };
  } catch (error) {
    console.error("[crm] DB query failed:", error);
    return { kind: "empty", message: EMPTY_MESSAGE };
  }
}
