"use server";

import { revalidatePath } from "next/cache";
import { fifoStockOut } from "@/modules/operations/inventory/services/fifo-stock-out";

export type FifoActionState = {
  ok: boolean;
  message: string;
};

export const initialFifoActionState: FifoActionState = {
  ok: true,
  message: "",
};

/** Server action: FIFO OUT с экрана склада. */
export async function performFifoOut(
  _prev: FifoActionState,
  formData: FormData
): Promise<FifoActionState> {
  const itemId = String(formData.get("itemId") ?? "").trim();
  const qtyRaw = String(formData.get("quantity") ?? "").replace(",", ".");
  const quantity = Number(qtyRaw);

  if (!itemId) {
    return { ok: false, message: "Не выбрана позиция." };
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { ok: false, message: "Укажите количество больше нуля." };
  }

  const result = await fifoStockOut(itemId, quantity);
  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidatePath("/operations/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/finance");

  return {
    ok: true,
    message: `Списано из партии ${result.lotCode}. Остаток в партии: ${result.quantityLeft.toFixed(1)}`,
  };
}
