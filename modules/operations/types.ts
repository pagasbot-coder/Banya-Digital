export type KitchenSlotRow = {
  id: string;
  timeLabel: string;
  station: string | null;
  syncStatus: string;
  syncStatusCode: string;
  isConflict: boolean;
  notes: string | null;
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
      checklists: ChecklistLinkSummary;
    }
  | { kind: "empty"; message: string };

export function isOperationsEmpty(
  result: OperationsResult
): result is Extract<OperationsResult, { kind: "empty" }> {
  return result.kind === "empty";
}
