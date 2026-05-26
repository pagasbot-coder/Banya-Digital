/** Фиксированные учебные учётные данные (только демо, не для prod-секретов). */
export const DEMO_STAFF_EMAIL = "owner@demo.local";
export const DEMO_STAFF_PASSWORD = "banya-demo";

/** Pilot/demo mode: skip Auth.js route protection (re-enable with DEMO_SKIP_AUTH=false). */
export function isDemoSkipAuth(): boolean {
  return process.env.DEMO_SKIP_AUTH !== "false";
}
