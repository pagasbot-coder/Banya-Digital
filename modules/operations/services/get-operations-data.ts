/**
 * Операции смены: тайминги spa, слоты кухни (SLA/конфликт), сводка чеклистов.
 */
import { addDays, formatTimeRange, startOfDay } from "@/lib/date-utils";
import { prisma } from "@/lib/db";
import type {
  ChecklistLinkSummary,
  KitchenConflictAuditRow,
  KitchenConflictRow,
  KitchenSlotRow,
  OperationsResult,
  ProgramTimingRow,
} from "@/modules/operations/types";

const EMPTY_MESSAGE =
  "База пуста — выполните: npm run db:push && npm run db:seed";

const KITCHEN_STATUS_RU: Record<string, string> = {
  PLANNED: "Запланирован",
  CONFIRMED: "Подтверждён",
  IN_PROGRESS: "В работе",
  DONE: "Готово",
  CONFLICT: "Конфликт / SLA",
};

export async function getOperationsData(): Promise<OperationsResult> {
  if (!process.env.DATABASE_URL) {
    return {
      kind: "empty",
      message:
        "DATABASE_URL не задан. Скопируйте .env.example → .env и запустите Docker PostgreSQL.",
    };
  }

  try {
    const hallCount = await prisma.hall.count();
    if (hallCount === 0) {
      return { kind: "empty", message: EMPTY_MESSAGE };
    }

    const today = startOfDay();
    const tomorrow = addDays(today, 1);

    const timings = await prisma.programTiming.findMany({
      where: {
        startsAt: { gte: today, lt: tomorrow },
      },
      include: {
        hall: true,
        spaProgram: true,
        kitchenSlots: { orderBy: { startsAt: "asc" } },
      },
      orderBy: { startsAt: "asc" },
    });

    const programTimings: ProgramTimingRow[] = timings.map((t) => ({
      id: t.id,
      hallName: t.hall.name,
      programName: t.spaProgram.name,
      timeLabel: formatTimeRange(t.startsAt, t.endsAt),
      staffLabel: t.staffLabel,
      kitchenSlots: t.kitchenSlots.map(
        (slot): KitchenSlotRow => ({
          id: slot.id,
          timeLabel: formatTimeRange(slot.startsAt, slot.endsAt),
          station: slot.station,
          syncStatus:
            slot.resolvedAt != null
              ? "Разобрано"
              : (KITCHEN_STATUS_RU[slot.syncStatus] ?? slot.syncStatus),
          syncStatusCode: slot.syncStatus,
          isConflict:
            slot.syncStatus === "CONFLICT" && slot.resolvedAt == null,
          isResolved: slot.resolvedAt != null,
          notes: slot.notes,
        })
      ),
    }));

    const conflictSlots = await prisma.kitchenSlot.findMany({
      where: {
        startsAt: { gte: today, lt: tomorrow },
        OR: [
          { syncStatus: "CONFLICT", resolvedAt: null },
          { resolvedAt: { not: null } },
        ],
      },
      include: {
        programTiming: { include: { hall: true, spaProgram: true } },
      },
      orderBy: [{ resolvedAt: "desc" }, { startsAt: "asc" }],
    });

    const openConflicts: KitchenConflictRow[] = [];
    const conflictAudit: KitchenConflictAuditRow[] = [];

    for (const slot of conflictSlots) {
      const hallName = slot.programTiming.hall.name;
      const programName = slot.programTiming.spaProgram.name;
      const timeLabel = formatTimeRange(slot.startsAt, slot.endsAt);

      if (slot.syncStatus === "CONFLICT" && slot.resolvedAt == null) {
        openConflicts.push({
          slotId: slot.id,
          programName,
          hallName,
          timeLabel,
          station: slot.station,
          notes: slot.notes,
          updatedAt: slot.updatedAt,
        });
      } else if (slot.resolvedAt && slot.resolvedBy) {
        conflictAudit.push({
          slotId: slot.id,
          programName,
          hallName,
          timeLabel,
          station: slot.station,
          notes: slot.notes,
          resolvedAt: slot.resolvedAt,
          resolvedBy: slot.resolvedBy,
        });
      }
    }

    const checklists = await prisma.shiftChecklist.findMany({
      where: { shiftDate: today },
      include: { items: true },
    });

    const allItems = checklists.flatMap((c) => c.items);
    const checklistSummary: ChecklistLinkSummary = {
      completed: allItems.filter((i) => i.completedAt !== null).length,
      total: allItems.length,
      groupsCount: checklists.length,
    };

    if (programTimings.length === 0 && checklistSummary.total === 0) {
      return {
        kind: "empty",
        message: "Нет операций на сегодня. Запустите npm run db:seed.",
      };
    }

    return {
      kind: "data",
      programTimings,
      openConflicts,
      conflictAudit,
      checklists: checklistSummary,
    };
  } catch (error) {
    console.error("[operations] DB query failed:", error);
    return { kind: "empty", message: EMPTY_MESSAGE };
  }
}
