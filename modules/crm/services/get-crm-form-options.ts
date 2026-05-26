/**
 * Справочники для CRM-форм (залы, программы, гости).
 */
import { prisma } from "@/lib/db";

export type CrmFormOptions = {
  halls: { id: string; name: string }[];
  spaPrograms: { id: string; name: string; durationMinutes: number }[];
  guests: { id: string; fullName: string }[];
};

const EMPTY: CrmFormOptions = { halls: [], spaPrograms: [], guests: [] };

/** Залы, spa-программы и гости для форм бронирования. */
export async function getCrmFormOptions(): Promise<CrmFormOptions> {
  if (!process.env.DATABASE_URL) return EMPTY;

  try {
    const [halls, spaPrograms, guests] = await Promise.all([
      prisma.hall.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.spaProgram.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, durationMinutes: true },
      }),
      prisma.guest.findMany({
        orderBy: { fullName: "asc" },
        select: { id: true, fullName: true },
      }),
    ]);

    return { halls, spaPrograms, guests };
  } catch (error) {
    console.error("[crm] form options failed:", error);
    return EMPTY;
  }
}
