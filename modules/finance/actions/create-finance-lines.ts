"use server";

import { revalidatePath } from "next/cache";
import { CostType } from "@prisma/client";
import { startOfDay } from "@/lib/date-utils";
import { prisma } from "@/lib/db";

export type FinanceActionState = {
  ok: boolean;
  message: string;
};

const OK: FinanceActionState = { ok: true, message: "" };

function fail(message: string): FinanceActionState {
  return { ok: false, message };
}

function parseAmount(raw: FormDataEntryValue | null): number | null {
  if (raw === null || raw === "") return null;
  const normalized = String(raw).replace(",", ".").trim();
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}

function parseBusinessDate(raw: FormDataEntryValue | null): Date {
  if (raw && String(raw).length >= 10) {
    const [y, m, d] = String(raw).slice(0, 10).split("-").map(Number);
    if (y && m && d) {
      return startOfDay(new Date(Date.UTC(y, m - 1, d)));
    }
  }
  return startOfDay();
}

async function revalidateFinanceViews() {
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}

/** Добавляет строку выручки за бизнес-день. */
export async function createRevenueLine(
  _prev: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  if (!process.env.DATABASE_URL) {
    return fail("DATABASE_URL не задан — ввод недоступен.");
  }

  const hallId = String(formData.get("hallId") ?? "").trim();
  const serviceId = String(formData.get("serviceId") ?? "").trim() || null;
  const amount = parseAmount(formData.get("amount"));
  const description = String(formData.get("description") ?? "").trim() || null;
  const businessDate = parseBusinessDate(formData.get("businessDate"));

  if (!hallId) return fail("Выберите зал.");
  if (amount === null) return fail("Укажите сумму больше нуля.");

  try {
    const hall = await prisma.hall.findUnique({ where: { id: hallId } });
    if (!hall) return fail("Зал не найден.");

    await prisma.revenueLine.create({
      data: {
        hallId,
        serviceId,
        amount,
        currency: "RUB",
        businessDate,
        description,
      },
    });

    await revalidateFinanceViews();
    return { ok: true, message: "Выручка сохранена." };
  } catch (error) {
    console.error("[finance] createRevenueLine:", error);
    return fail("Не удалось сохранить выручку. Проверьте подключение к БД.");
  }
}

/** Добавляет строку COGS (опционально с привязкой к партии FIFO). */
export async function createCostLine(
  _prev: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  if (!process.env.DATABASE_URL) {
    return fail("DATABASE_URL не задан — ввод недоступен.");
  }

  const hallId = String(formData.get("hallId") ?? "").trim() || null;
  const serviceId = String(formData.get("serviceId") ?? "").trim() || null;
  const lotId = String(formData.get("lotId") ?? "").trim() || null;
  const amount = parseAmount(formData.get("amount"));
  const description = String(formData.get("description") ?? "").trim() || null;
  const businessDate = parseBusinessDate(formData.get("businessDate"));
  const costTypeRaw = String(formData.get("costType") ?? "COGS");
  const costType =
    costTypeRaw in CostType ? (costTypeRaw as CostType) : CostType.COGS;

  if (amount === null) return fail("Укажите сумму больше нуля.");

  try {
    if (lotId) {
      const lot = await prisma.inventoryLot.findUnique({ where: { id: lotId } });
      if (!lot) return fail("Партия склада не найдена.");
    }

    await prisma.costLine.create({
      data: {
        hallId,
        serviceId,
        lotId,
        amount,
        costType,
        currency: "RUB",
        businessDate,
        description,
      },
    });

    await revalidateFinanceViews();
    return { ok: true, message: "COGS сохранён." };
  } catch (error) {
    console.error("[finance] createCostLine:", error);
    return fail("Не удалось сохранить COGS. Проверьте подключение к БД.");
  }
}

/** Пустое начальное состояние для useActionState. */
export const initialFinanceActionState: FinanceActionState = OK;
