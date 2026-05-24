import { ModulePlaceholder } from "@/components/layout/module-placeholder";
import { getModuleById } from "@/lib/config/modules";

export default function FinancePage() {
  const mod = getModuleById("finance")!;

  return (
    <ModulePlaceholder
      title={mod.label}
      description={mod.description}
      features={[
        "Unit economics по залу / услуге / дню",
        "COGS и маржинальность",
        "Экспорт сводок (будущая интеграция с БД)",
      ]}
    />
  );
}
