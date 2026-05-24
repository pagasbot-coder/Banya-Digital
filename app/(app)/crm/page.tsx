import { GuestsSection } from "@/components/crm/guests-section";
import { TodayBookingsSection } from "@/components/crm/today-bookings-section";
import { getCrmData, isCrmEmpty } from "@/modules/crm";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const data = await getCrmData();

  if (isCrmEmpty(data)) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <header>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Модуль
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            CRM
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
          CRM
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Гости и бронирования на сегодня — данные из PostgreSQL.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <TodayBookingsSection bookings={data.todayBookings} />
        <GuestsSection guests={data.guests} />
      </div>
    </div>
  );
}
