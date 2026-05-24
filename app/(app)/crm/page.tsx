import { ModulePlaceholder } from "@/components/layout/module-placeholder";
import { getModuleById } from "@/lib/config/modules";

export default function CrmPage() {
  const mod = getModuleById("crm")!;

  return (
    <ModulePlaceholder
      title={mod.label}
      description={mod.description}
      features={[
        "Карточка гостя и история визитов",
        "Бронирования залов и программ",
        "Связь с spa-программами и кухней",
      ]}
    />
  );
}
