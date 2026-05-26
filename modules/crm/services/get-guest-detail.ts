import { prisma } from "@/lib/db";
import { GUEST_SEGMENTS, type GuestSegment } from "@/modules/crm/constants";

export type GuestDetail = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  segment: GuestSegment | "";
  createdAt: Date;
  bookingsCount: number;
};

/** Карточка гостя для просмотра и редактирования. */
export async function getGuestDetail(
  id: string
): Promise<GuestDetail | null> {
  if (!process.env.DATABASE_URL) return null;

  const guest = await prisma.guest.findUnique({
    where: { id },
    include: { _count: { select: { bookings: true } } },
  });

  if (!guest) return null;

  const segment = GUEST_SEGMENTS.includes(guest.notes as GuestSegment)
    ? (guest.notes as GuestSegment)
    : "";

  return {
    id: guest.id,
    fullName: guest.fullName,
    phone: guest.phone,
    email: guest.email,
    notes: segment ? null : guest.notes,
    segment,
    createdAt: guest.createdAt,
    bookingsCount: guest._count.bookings,
  };
}
