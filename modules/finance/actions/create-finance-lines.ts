"use server";

import { CostType, Prisma } from "@prisma/client";
import { parseBusinessDateInput } from "@/lib/date-utils";
import { prisma } from "@/lib/db";
import { safeRevalidatePaths } from "@/lib/safe-revalidate";
import type { FinanceActionState } from "@/modules/finance/actions/finance-action-state";

/** Только dashboard — /finance обновляется через router.refresh() после submit (T-033). */
const REVALIDATE_PATHS = ["/dashboard"] as const;

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

/** Добавляет строку выручки за бизнес-день. */
export async function createRevenueLine(
  _prev: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  try {
    if (!process.env.DATABASE_URL) {
      return fail("DATABASE_URL не задан — ввод недоступен.");
    }

    const hallId = String(formData.get("hallId") ?? "").trim();
    const serviceId = String(formData.get("serviceId") ?? "").trim() || null;
    const amount = parseAmount(formData.get("amount"));
    const description = String(formData.get("description") ?? "").trim() || null;
    const businessDate = parseBusinessDateInput(formData.get("businessDate"));

    if (!hallId) return fail("Выберите зал.");
    if (amount === null) return fail("Укажите сумму больше нуля.");

    const hall = await prisma.hall.findUnique({ where: { id: hallId } });
    if (!hall) return fail("Зал не найден.");

    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { id: true, isActive: true },
      });
      if (!service) return fail("Услуга не найдена в справочнике.");
      if (!service.isActive) return fail("Услуга неактивна — выберите другую.");
    }

    await prisma.revenueLine.create({
      data: {
        hallId,
        serviceId,
        amount: new Prisma.Decimal(amount),
        currency: "RUB",
        businessDate,
        description,
      },
    });

    safeRevalidatePaths([...REVALIDATE_PATHS]);
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
  try {
    if (!process.env.DATABASE_URL) {
      return fail("DATABASE_URL не задан — ввод недоступен.");
    }

    const hallId = String(formData.get("hallId") ?? "").trim() || null;
    const serviceId = String(formData.get("serviceId") ?? "").trim() || null;
    const lotId = String(formData.get("lotId") ?? "").trim() || null;
    const amount = parseAmount(formData.get("amount"));
    const description = String(formData.get("description") ?? "").trim() || null;
    const businessDate = parseBusinessDateInput(formData.get("businessDate"));
    const costTypeRaw = String(formData.get("costType") ?? "COGS");
    const costType =
      costTypeRaw in CostType ? (costTypeRaw as CostType) : CostType.COGS;

    if (amount === null) return fail("Укажите сумму больше нуля.");

    if (hallId) {
      const hall = await prisma.hall.findUnique({ where: { id: hallId } });
      if (!hall) return fail("Зал не найден.");
    }

    if (lotId) {
      const lot = await prisma.inventoryLot.findUnique({ where: { id: lotId } });
      if (!lot) return fail("Партия склада не найдена.");
    }

    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { id: true },
      });
      if (!service) return fail("Услуга не найдена.");
    }

    await prisma.costLine.create({
      data: {
        hallId,
        serviceId,
        lotId,
        amount: new Prisma.Decimal(amount),
        costType,
        currency: "RUB",
        businessDate,
        description,
      },
    });

    safeRevalidatePaths([...REVALIDATE_PATHS]);
    return { ok: true, message: "COGS сохранён." };
  } catch (error) {
    console.error("[finance] createCostLine:", error);
    return fail("Не удалось сохранить COGS. Проверьте подключение к БД.");
  }
}
