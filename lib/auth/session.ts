import { auth } from "@/auth";
import type { StaffRole } from "@prisma/client";

/** Server-side staff session (Auth.js). */
export async function getStaffSession() {
  return auth();
}

export async function requireStaffSession() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session;
}

export function getStaffRole(session: { user: { role: StaffRole } }): StaffRole {
  return session.user.role;
}
