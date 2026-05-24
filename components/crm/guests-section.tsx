import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GuestRow } from "@/modules/crm/types";

type GuestsSectionProps = {
  guests: GuestRow[];
};

/** Список гостей с числом броней на сегодня. */
export function GuestsSection({ guests }: GuestsSectionProps) {
  return (
    <section aria-labelledby="crm-guests-heading">
      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle
            id="crm-guests-heading"
            className="font-heading text-xl font-semibold tracking-tight md:text-2xl"
          >
            Гости
          </CardTitle>
          <CardDescription>
            {guests.length} в базе — брони на сегодня отмечены
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
            {guests.map((guest) => (
              <li
                key={guest.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{guest.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {[guest.phone, guest.email].filter(Boolean).join(" · ") ||
                      "Контакт не указан"}
                  </p>
                </div>
                {guest.bookingsToday > 0 ? (
                  <Badge variant="secondary">
                    {guest.bookingsToday} бронь сегодня
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
