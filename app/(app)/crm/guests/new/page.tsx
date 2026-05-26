import Link from "next/link";
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

export const dynamic = "force-dynamic";

export default function NewGuestPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            CRM
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Новый гость
          </h1>
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
          <CardTitle className="font-heading text-lg">Контакты</CardTitle>
          <CardDescription>Имя, телефон, сегмент — сохраняются в PostgreSQL</CardDescription>
        </CardHeader>
        <CardContent>
          <GuestForm />
        </CardContent>
      </Card>
    </div>
  );
}
