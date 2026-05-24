/** Реестр модулей ERP — единая точка для навигации и будущего lazy-loading. */
export type ModuleId = "dashboard" | "finance" | "crm" | "operations";

export type AppModule = {
  id: ModuleId;
  path: string;
  label: string;
  description: string;
};

export const APP_MODULES: AppModule[] = [
  {
    id: "dashboard",
    path: "/dashboard",
    label: "Сводка",
    description: "KPI: загрузка залов, маржа, алерты",
  },
  {
    id: "finance",
    path: "/finance",
    label: "Финансы",
    description: "Unit economics, выручка, COGS, маржа",
  },
  {
    id: "crm",
    path: "/crm",
    label: "CRM",
    description: "Гости, брони, spa-программы",
  },
  {
    id: "operations",
    path: "/operations",
    label: "Операции",
    description: "Yield, чеклисты, тайминги, FIFO-склад",
  },
];

export function getModuleById(id: ModuleId): AppModule | undefined {
  return APP_MODULES.find((m) => m.id === id);
}
