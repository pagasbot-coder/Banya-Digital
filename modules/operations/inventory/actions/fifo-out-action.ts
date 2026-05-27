"use server";

import { safeRevalidatePaths } from "@/lib/safe-revalidate";
import { fifoStockOut } from "@/modules/operations/inventory/services/fifo-stock-out";

export type FifoActionState = {
  ok: boolean;
  message: string;
};

export const initialFifoActionState: FifoActionState = {
  ok: true,
  message: "",
};

const REVALIDATE_PATHS = [
  "/operations/inventory",
  "/dashboard",
  "/finance",
] as const;

/** Server action: FIFO OUT с экрана склада. */
export async function performFifoOut(
  _prev: FifoActionState,
  formData: FormData
): Promise<FifoActionState> {
  if (!process.env.DATABASE_URL) {
    return {
      ok: false,
      message: "DATABASE_URL не задан — списание недоступно.",
    };
  }

  const itemId = String(formData.get("itemId") ?? "").trim();
  const qtyRaw = String(formData.get("quantity") ?? "").replace(",", ".");
  const quantity = Number(qtyRaw);

  if (!itemId) {
    return { ok: false, message: "Не выбрана позиция." };
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { ok: false, message: "Укажите количество больше нуля." };
  }

  try {
    const result = await fifoStockOut(itemId, quantity);
    if (!result.ok) {
      return { ok: false, message: result.message };
    }

    safeRevalidatePaths([...REVALIDATE_PATHS]);

    return {
      ok: true,
      message: `Списано из партии ${result.lotCode}. Остаток в партии: ${result.quantityLeft.toFixed(1)}`,
    };
  } catch (error) {
    console.error("[inventory] performFifoOut:", error);
    return {
      ok: false,
      message: "Ошибка сервера при списании. Повторите или обратитесь к администратору.",
    };
  }
}
