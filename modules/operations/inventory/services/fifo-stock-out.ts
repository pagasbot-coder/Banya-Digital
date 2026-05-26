/**
 * FIFO-списание органики: старейшая партия с остатком > 0 (T-012).
 */
import { StockMovementType } from "@prisma/client";
import { prisma } from "@/lib/db";

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
  if (quantity > left) {
    return {
      ok: false,
      message: `В партии ${lot.lotCode} только ${left} ${lot.item.unit}.`,
    };
  }

  const newLeft = left - quantity;

  await prisma.$transaction([
    prisma.inventoryLot.update({
      where: { id: lot.id },
      data: { quantityLeft: newLeft },
    }),
    prisma.stockMovement.create({
      data: {
        lotId: lot.id,
        type: StockMovementType.OUT,
        quantity,
        reference: reference ?? `UI-OUT-${Date.now()}`,
        notes: "Списание из интерфейса склада",
      },
    }),
  ]);

  return { ok: true, lotCode: lot.lotCode, quantityLeft: newLeft };
}
