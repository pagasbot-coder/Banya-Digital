import { ChecklistsLinkCard } from "@/components/operations/checklists-link-card";
import { KitchenConflictAuditSection } from "@/components/operations/kitchen-conflict-audit-section";
import { KitchenConflictsSection } from "@/components/operations/kitchen-conflicts-section";
import { ProgramTimingsSection } from "@/components/operations/program-timings-section";
import { getOperationsData, isOperationsEmpty } from "@/modules/operations";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const data = await getOperationsData();

  if (isOperationsEmpty(data)) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <header>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Модуль
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Операции
          </h1>
        </header>
        <div
          role="status"
          className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-6 py-10 text-center"
        >
          <p className="text-sm text-muted-foreground">{data.message}</p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            npm run db:push && npm run db:seed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-accent">
          Модуль
        </p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Операции
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Расписание spa, слоты кухни (SLA / конфликты) и чеклисты смены.
        </p>
      </header>

      <KitchenConflictsSection conflicts={data.openConflicts} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <ProgramTimingsSection rows={data.programTimings} />
          <KitchenConflictAuditSection rows={data.conflictAudit} />
        </div>
        <div>
          <ChecklistsLinkCard summary={data.checklists} />
        </div>
      </div>
    </div>
  );
}
