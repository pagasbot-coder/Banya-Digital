/**
 * Склад органики: позиции, партии, движения (T-012).
 */
import { prisma } from "@/lib/db";

export type InventoryLotRow = {
  id: string;
  lotCode: string;
  quantityLeft: number;
  unit: string;
  reorderLevel: number | null;
  belowThreshold: boolean;
  expiresAt: string | null;
  movements: {
    id: string;
    type: string;
    quantity: number;
    occurredAt: string;
    notes: string | null;
  }[];
};

export type InventoryItemRow = {
  id: string;
  name: string;
  sku: string;
  unit: string;
  totalLeft: number;
  reorderLevel: number | null;
  lots: InventoryLotRow[];
};

export type InventoryResult =
  | { kind: "empty"; message: string }
  | { kind: "data"; items: InventoryItemRow[] };

const EMPTY_MESSAGE =
  "База пуста — выполните: npm run db:push && npm run db:seed";

/** Загружает склад с партиями и последними движениями. */
export async function getInventoryData(): Promise<InventoryResult> {
  if (!process.env.DATABASE_URL) {
    return {
      kind: "empty",
      message:
        "DATABASE_URL не задан. Скопируйте .env.example → .env и запустите Docker PostgreSQL.",
    };
  }

  try {
    const items = await prisma.inventoryItem.findMany({
      where: { isActive: true },
      include: {
        lots: {
          orderBy: { receivedAt: "asc" },
          include: {
            movements: {
              orderBy: { occurredAt: "desc" },
              take: 5,
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    if (items.length === 0) {
      return { kind: "empty", message: EMPTY_MESSAGE };
    }

    const rows: InventoryItemRow[] = items.map((item) => {
      const reorder = item.reorderLevel ? Number(item.reorderLevel) : null;

      const lots: InventoryLotRow[] = item.lots.map((lot) => {
        const qty = Number(lot.quantityLeft);
        const below =
          reorder !== null && qty < reorder;

        return {
          id: lot.id,
          lotCode: lot.lotCode,
          quantityLeft: qty,
          unit: item.unit,
          reorderLevel: reorder,
          belowThreshold: below,
          expiresAt: lot.expiresAt
            ? lot.expiresAt.toLocaleDateString("ru-RU")
            : null,
          movements: lot.movements.map((m) => ({
            id: m.id,
            type: m.type,
            quantity: Number(m.quantity),
            occurredAt: m.occurredAt.toLocaleString("ru-RU", {
              timeZone: "Europe/Moscow",
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
            notes: m.notes,
          })),
        };
      });

      const totalLeft = lots.reduce((s, l) => s + l.quantityLeft, 0);

      return {
        id: item.id,
        name: item.name,
        sku: item.sku,
        unit: item.unit,
        totalLeft,
        reorderLevel: reorder,
        lots,
      };
    });

    return { kind: "data", items: rows };
  } catch (error) {
    console.error("[inventory] DB query failed:", error);
    return { kind: "empty", message: EMPTY_MESSAGE };
  }
}
