"use server";

import { prisma } from "@/lib/db";
import { safeRevalidatePaths } from "@/lib/safe-revalidate";

const DEMO_RESOLVER = "demo-user";

export type ResolveKitchenConflictResult = {
  ok: boolean;
  message: string;
};

function fail(message: string): ResolveKitchenConflictResult {
  return { ok: false, message };
}

/** Закрывает конфликт kitchen↔SPA: статус DONE + audit (T-018). */
export async function resolveKitchenConflict(
  slotId: string
): Promise<ResolveKitchenConflictResult> {
  if (!process.env.DATABASE_URL) {
    return fail("DATABASE_URL не задан — сохранение недоступно.");
  }

  if (!slotId.trim()) {
    return fail("Слот не указан.");
  }

  try {
    const slot = await prisma.kitchenSlot.findUnique({
      where: { id: slotId },
    });
    if (!slot) return fail("Слот не найден — обновите страницу.");
    if (slot.syncStatus !== "CONFLICT") {
      return fail("Слот не в статусе конфликта.");
    }
    if (slot.resolvedAt) {
      return fail("Конфликт уже разобран.");
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

    safeRevalidatePaths(["/operations", "/dashboard"]);
    return { ok: true, message: "Конфликт разобран." };
  } catch (error) {
    console.error("[operations] resolveKitchenConflict:", error);
    return fail("Не удалось сохранить разбор. Проверьте подключение к БД.");
  }
}
