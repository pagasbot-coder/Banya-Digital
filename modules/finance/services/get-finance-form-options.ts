/**
 * Справочники для форм ввода RevenueLine / CostLine (T-011).
 */
import { prisma } from "@/lib/db";

export type FinanceFormOptions = {
  halls: { id: string; name: string }[];
  services: { id: string; name: string; hallId: string | null }[];
  lots: { id: string; label: string; itemId: string }[];
};

const EMPTY: FinanceFormOptions = { halls: [], services: [], lots: [] };

/** Залы, услуги и партии органики для форм финансов. */
export async function getFinanceFormOptions(): Promise<FinanceFormOptions> {
  if (!process.env.DATABASE_URL) return EMPTY;

  try {
    const [halls, services, lots] = await Promise.all([
      prisma.hall.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.service.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, hallId: true },
      }),
      prisma.inventoryLot.findMany({
        where: { quantityLeft: { gt: 0 } },
        include: { item: true },
        orderBy: { receivedAt: "asc" },
      }),
    ]);

    return {
      halls,
      services,
      lots: lots.map((lot) => ({
        id: lot.id,
        itemId: lot.itemId,
        label: `${lot.item.name} · ${lot.lotCode} (ост. ${Number(lot.quantityLeft)} ${lot.item.unit})`,
      })),
    };
  } catch (error) {
    console.error("[finance] form options failed:", error);
    return EMPTY;
  }
}
