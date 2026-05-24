import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TodayBookingRow } from "@/modules/crm/types";

function statusVariant(code: string) {
  if (code === "CONFIRMED" || code === "CHECKED_IN") return "secondary" as const;
  if (code === "COMPLETED") return "outline" as const;
  if (code === "CANCELLED" || code === "NO_SHOW") return "destructive" as const;
  return "outline" as const;
}

type TodayBookingsSectionProps = {
  bookings: TodayBookingRow[];
};

/** Бронирования на сегодня. */
export function TodayBookingsSection({ bookings }: TodayBookingsSectionProps) {
  return (
    <section aria-labelledby="crm-bookings-heading">
      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle
            id="crm-bookings-heading"
            className="font-heading text-xl font-semibold tracking-tight md:text-2xl"
          >
            Брони на сегодня
          </CardTitle>
          <CardDescription>
            {bookings.length === 0
              ? "Нет броней на текущую дату"
              : `${bookings.length} записей по расписанию`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Брони не найдены</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Время</TableHead>
                  <TableHead>Гость</TableHead>
                  <TableHead>Зал</TableHead>
                  <TableHead>Услуга</TableHead>
                  <TableHead>Гостей</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="tabular-nums">{b.timeLabel}</TableCell>
                    <TableCell className="font-medium">{b.guestName}</TableCell>
                    <TableCell>{b.hallName ?? "—"}</TableCell>
                    <TableCell className="max-w-[12rem] truncate">
                      {b.serviceName ?? "—"}
                    </TableCell>
                    <TableCell className="text-center">{b.partySize}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(b.statusCode)}>
                        {b.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
