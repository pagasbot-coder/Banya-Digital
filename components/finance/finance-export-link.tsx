import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Ссылка на CSV-выгрузку (T-023 MVP). */
export function FinanceExportLink() {
  return (
    <a
      href="/api/finance/export"
      download
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
    >
      <Download className="size-4" aria-hidden />
      Скачать CSV
    </a>
  );
}
