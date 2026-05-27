/**
 * FIFO-списание органики: старейшая партия с остатком > 0 (T-012).
 */
import { Prisma, StockMovementType } from "@prisma/client";
import { prisma } from "@/lib/db";

function roundQty(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export type FifoOutResult =
  | { ok: true; lotCode: string; quantityLeft: number }
  | { ok: false; message: string };

/** Списывает quantity с партии по FIFO для позиции склада. */
export async function fifoStockOut(
  itemId: string,
  quantity: number,
  reference?: string
): Promise<FifoOutResult> {
  if (quantity <= 0) {
    return { ok: false, message: "Количество должно быть больше нуля." };
  }

  const lot = await prisma.inventoryLot.findFirst({
    where: {
      itemId,
      quantityLeft: { gt: 0 },
    },
    orderBy: { receivedAt: "asc" },
    include: { item: true },
  });

  if (!lot) {
    return { ok: false, message: "Нет партий с остатком для списания." };
  }

  const left = Number(lot.quantityLeft);
  const qty = roundQty(quantity);
  if (qty > left) {
    return {
      ok: false,
      message: `В партии ${lot.lotCode} только ${left} ${lot.item.unit}.`,
    };
  }

  const newLeft = roundQty(left - qty);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.inventoryLot.update({
        where: { id: lot.id },
        data: { quantityLeft: new Prisma.Decimal(newLeft) },
      });
      await tx.stockMovement.create({
        data: {
          lotId: lot.id,
          type: StockMovementType.OUT,
          quantity: new Prisma.Decimal(qty),
          reference: reference ?? `UI-OUT-${Date.now()}`,
          notes: "Списание из интерфейса склада",
        },
      });
    });
  } catch (error) {
    console.error("[inventory] fifoStockOut transaction:", error);
    return {
      ok: false,
      message: "Не удалось списать остаток. Проверьте подключение к БД.",
    };
  }

  return { ok: true, lotCode: lot.lotCode, quantityLeft: newLeft };
}
