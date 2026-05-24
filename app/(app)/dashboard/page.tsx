import { ModulePlaceholder } from "@/components/layout/module-placeholder";
import { getModuleById } from "@/lib/config/modules";

export default function DashboardPage() {
  const mod = getModuleById("dashboard")!;

  return (
    <ModulePlaceholder
      title={mod.label}
      description={mod.description}
      features={[
        "KPI: загрузка залов и выручка за день",
        "Маржа по залам и услугам",
        "Критические алерты (склад, конфликты таймингов)",
      ]}
    />
  );
}
