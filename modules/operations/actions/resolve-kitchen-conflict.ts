"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

const DEMO_RESOLVER = "demo-user";

export type ResolveKitchenConflictResult = {
  ok: boolean;
  message?: string;
};

/** Закрывает конфликт kitchen↔SPA: статус DONE + audit (T-018). */
export async function resolveKitchenConflict(
  slotId: string
): Promise<ResolveKitchenConflictResult> {
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "База недоступна" };
  }

  try {
    const slot = await prisma.kitchenSlot.findUnique({
      where: { id: slotId },
    });
    if (!slot) return { ok: false, message: "Слот не найден" };
    if (slot.syncStatus !== "CONFLICT") {
      return { ok: false, message: "Слот не в статусе конфликта" };
    }
    if (slot.resolvedAt) {
      return { ok: false, message: "Конфликт уже разобран" };
    }

    const now = new Date();
    await prisma.kitchenSlot.update({
      where: { id: slotId },
      data: {
        syncStatus: "DONE",
        resolvedAt: now,
        resolvedBy: DEMO_RESOLVER,
        updatedAt: now,
      },
    });

    revalidatePath("/operations");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    console.error("[operations] resolveKitchenConflict:", error);
    return { ok: false, message: "Ошибка сохранения" };
  }
}
