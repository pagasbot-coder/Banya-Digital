import { InventorySection } from "@/components/operations/inventory-section";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getInventoryData } from "@/modules/operations/inventory/services/get-inventory-data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const data = await getInventoryData();

  if (data.kind === "empty") {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <header>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Операции
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Склад органики
          </h1>
        </header>
        <div
          role="status"
          className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-6 py-10 text-center"
        >
          <p className="text-sm text-muted-foreground">{data.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Операции
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Склад органики (FIFO)
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Партии сена и пихты: остатки, пороги, списание по FIFO. Алерты — на
            сводке.
          </p>
        </div>
        <Link
          href="/operations"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          ← К операциям
        </Link>
      </header>

      <InventorySection items={data.items} />
    </div>
  );
}
