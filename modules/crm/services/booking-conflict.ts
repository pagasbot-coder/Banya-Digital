import { prisma } from "@/lib/db";

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "CHECKED_IN"] as const;

/**
 * Проверяет пересечение брони по залу (базовая валидация слота).
 */
export async function findHallBookingConflict(
  hallId: string,
  startsAt: Date,
  endsAt: Date,
  excludeBookingId?: string
): Promise<{ conflict: boolean; hallName?: string }> {
  const overlapping = await prisma.booking.findFirst({
    where: {
      hallId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { in: [...ACTIVE_STATUSES] },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
    include: { hall: true },
  });

  if (!overlapping) return { conflict: false };
  return { conflict: true, hallName: overlapping.hall?.name ?? undefined };
}
