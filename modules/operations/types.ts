export type KitchenSlotRow = {
  id: string;
  timeLabel: string;
  station: string | null;
  syncStatus: string;
  syncStatusCode: string;
  isConflict: boolean;
  isResolved: boolean;
  notes: string | null;
};

/** Открытый конфликт kitchen↔SPA для разбора на /operations. */
export type KitchenConflictRow = {
  slotId: string;
  programName: string;
  hallName: string;
  timeLabel: string;
  station: string | null;
  notes: string | null;
  updatedAt: Date;
};

/** Журнал разобранных конфликтов (audit). */
export type KitchenConflictAuditRow = {
  slotId: string;
  programName: string;
  hallName: string;
  timeLabel: string;
  station: string | null;
  notes: string | null;
  resolvedAt: Date;
  resolvedBy: string;
};

export type ProgramTimingRow = {
  id: string;
  hallName: string;
  programName: string;
  timeLabel: string;
  staffLabel: string | null;
  kitchenSlots: KitchenSlotRow[];
};

export type ChecklistLinkSummary = {
  completed: number;
  total: number;
  groupsCount: number;
};

export type OperationsResult =
  | {
      kind: "data";
      programTimings: ProgramTimingRow[];
      openConflicts: KitchenConflictRow[];
      conflictAudit: KitchenConflictAuditRow[];
      checklists: ChecklistLinkSummary;
    }
  | { kind: "empty"; message: string };

export function isOperationsEmpty(
  result: OperationsResult
): result is Extract<OperationsResult, { kind: "empty" }> {
  return result.kind === "empty";
}
