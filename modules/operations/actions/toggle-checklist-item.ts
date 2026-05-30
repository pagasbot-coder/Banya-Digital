"use server";

import { prisma } from "@/lib/db";
import { safeRevalidatePaths } from "@/lib/safe-revalidate";

export type ToggleChecklistResult = {
  ok: boolean;
  message: string;
};

function fail(message: string): ToggleChecklistResult {
  return { ok: false, message };
}

/** Переключает выполнение пункта чеклиста смены (T-013). */
export async function toggleChecklistItem(
  itemId: string
): Promise<ToggleChecklistResult> {
  if (!process.env.DATABASE_URL) {
    return fail("DATABASE_URL не задан — сохранение недоступно.");
  }

  if (!itemId.trim()) {
    return fail("Пункт чеклиста не указан.");
  }

  try {
    const item = await prisma.checklistItem.findUnique({
      where: { id: itemId },
    });
    if (!item) return fail("Пункт не найден — обновите страницу.");

    const completed = item.completedAt !== null;
    await prisma.checklistItem.update({
      where: { id: itemId },
      data: completed
        ? { completedAt: null, completedBy: null }
        : { completedAt: new Date(), completedBy: "demo-user" },
    });

    safeRevalidatePaths(["/dashboard", "/operations"]);
    return {
      ok: true,
      message: completed ? "Отметка снята." : "Пункт выполнен.",
    };
  } catch (error) {
    console.error("[operations] toggleChecklistItem:", error);
    return fail("Не удалось сохранить пункт. Проверьте подключение к БД.");
  }
}
