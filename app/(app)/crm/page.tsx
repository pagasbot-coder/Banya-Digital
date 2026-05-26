import { BookingForm } from "@/components/crm/booking-form";
import { GuestsSection } from "@/components/crm/guests-section";
import { TodayBookingsInteractive } from "@/components/crm/today-bookings-interactive";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BUSINESS_TIMEZONE, startOfDay } from "@/lib/date-utils";
import { getCrmData, isCrmEmpty } from "@/modules/crm";
import { getCrmFormOptions } from "@/modules/crm/services/get-crm-form-options";

export const dynamic = "force-dynamic";

function todayInputValue(): string {
  return startOfDay().toLocaleDateString("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
  });
}

export default async function CrmPage() {
  const [data, formOptions] = await Promise.all([
    getCrmData(),
    getCrmFormOptions(),
  ]);
  const defaultBookingDate = todayInputValue();

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
          Гости и бронирования на сегодня — создание, редактирование, проверка
          слотов по залам.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <TodayBookingsInteractive
          bookings={data.todayBookings}
          options={formOptions}
          defaultBookingDate={defaultBookingDate}
        />
        <GuestsSection guests={data.guests} />
      </div>

      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Новая бронь</CardTitle>
          <CardDescription>
            Дата, зал, программа и статус — конфликт слота проверяется автоматически
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-xl">
          <BookingForm
            options={formOptions}
            defaultBookingDate={defaultBookingDate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
