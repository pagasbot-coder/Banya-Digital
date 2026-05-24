import { ModulePlaceholder } from "@/components/layout/module-placeholder";
import { getModuleById } from "@/lib/config/modules";
import { OPERATIONS_SUBMODULES } from "@/modules/operations";

export default function OperationsPage() {
  const mod = getModuleById("operations")!;

  return (
    <ModulePlaceholder
      title={mod.label}
      description={mod.description}
      features={OPERATIONS_SUBMODULES.map((s) => s.label)}
    />
  );
}
