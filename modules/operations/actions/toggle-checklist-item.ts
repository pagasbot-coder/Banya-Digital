"use server";

import { prisma } from "@/lib/db";
import { safeRevalidatePaths } from "@/lib/safe-revalidate";

export type ToggleChecklistResult = {
  ok: boolean;
  message?: string;
};

/** Переключает выполнение пункта чеклиста смены (T-013). */
export async function toggleChecklistItem(
  itemId: string
): Promise<ToggleChecklistResult> {
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "База недоступна" };
  }

  try {
    const item = await prisma.checklistItem.findUnique({
      where: { id: itemId },
    });
    if (!item) return { ok: false, message: "Пункт не найден" };

    const completed = item.completedAt !== null;
    await prisma.checklistItem.update({
      where: { id: itemId },
      data: completed
        ? { completedAt: null, completedBy: null }
        : { completedAt: new Date(), completedBy: "demo-user" },
    });

    safeRevalidatePaths(["/dashboard", "/operations"]);
    return { ok: true };
  } catch (error) {
    console.error("[operations] toggleChecklistItem:", error);
    return { ok: false, message: "Ошибка сохранения" };
  }
}
