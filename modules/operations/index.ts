/** Подмодули operations — каждый расширяется отдельной папкой. */
export const OPERATIONS_SUBMODULES = [
  {
    id: "yield",
    label: "Yield management — динамическая загрузка залов",
  },
  {
    id: "checklists",
    label: "Чеклисты смены и зон",
  },
  {
    id: "timings",
    label: "Тайминги spa-программ + синхронизация кухни",
  },
  {
    id: "inventory",
    label: "FIFO-склад органики (сено, пихта)",
  },
] as const;

export type OperationsSubmoduleId =
  (typeof OPERATIONS_SUBMODULES)[number]["id"];
