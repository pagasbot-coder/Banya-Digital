import type { StaffRole } from "@prisma/client";

/** Staff roles for ERP operator sessions (not guest portal). */
export const STAFF_ROLES = ["owner", "ops", "admin", "warehouse"] as const satisfies readonly StaffRole[];

export type StaffRoleName = (typeof STAFF_ROLES)[number];

export const STAFF_ROLE_LABELS: Record<StaffRoleName, string> = {
  owner: "Владелец",
  ops: "Операции",
  admin: "Администратор",
  warehouse: "Склад",
};

/** Finance write — owner and admin only (MVP matrix). */
export function canWriteFinance(role: StaffRole): boolean {
  return role === "owner" || role === "admin";
}
