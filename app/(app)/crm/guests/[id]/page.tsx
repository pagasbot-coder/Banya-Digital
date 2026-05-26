import Link from "next/link";
import { notFound } from "next/navigation";
import { GuestForm } from "@/components/crm/guest-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getGuestDetail } from "@/modules/crm/services/get-guest-detail";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function GuestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const guest = await getGuestDetail(id);

  if (!guest) notFound();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            CRM · Гость
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            {guest.fullName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Броней в системе: {guest.bookingsCount}
          </p>
        </div>
        <Link
          href="/crm"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          ← К CRM
        </Link>
      </header>

      <Card className="max-w-lg border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Редактирование</CardTitle>
          <CardDescription>Контакты и сегмент гостя</CardDescription>
        </CardHeader>
        <CardContent>
          <GuestForm guest={guest} />
        </CardContent>
      </Card>
    </div>
  );
}
