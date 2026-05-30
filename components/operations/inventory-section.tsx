"use client";

import { useActionState } from "react";
import { performFifoOut } from "@/modules/operations/inventory/actions/fifo-out-action";
import { initialFifoActionState } from "@/modules/operations/inventory/actions/fifo-action-state";
import type { InventoryItemRow } from "@/modules/operations/inventory/services/get-inventory-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type InventorySectionProps = {
  items: InventoryItemRow[];
};

const fieldClass =
  "min-h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm";

/** Склад органики: партии, пороги, FIFO OUT (T-012). */
export function InventorySection({ items }: InventorySectionProps) {
  return (
    <div className="space-y-6">
      {items.map((item) => (
        <InventoryItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function InventoryItemCard({ item }: { item: InventoryItemRow }) {
  const [state, action, pending] = useActionState(
    performFifoOut,
    initialFifoActionState
  );
  const belowTotal =
    item.reorderLevel !== null && item.totalLeft < item.reorderLevel;

  return (
    <Card className="border-border/80 bg-card/95 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle className="font-heading text-lg">{item.name}</CardTitle>
          <CardDescription>
            SKU {item.sku} · остаток {item.totalLeft.toFixed(1)} {item.unit}
            {item.reorderLevel !== null
              ? ` · порог ${item.reorderLevel} ${item.unit}`
              : ""}
          </CardDescription>
        </div>
        {belowTotal && (
          <Badge variant="destructive" className="shrink-0">
            Ниже порога
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          action={action}
          className="flex flex-wrap items-end gap-3 rounded-lg border border-border/60 bg-muted/20 p-4"
        >
          <input type="hidden" name="itemId" value={item.id} />
          <label className="space-y-1 text-sm">
            <span className="font-medium">FIFO OUT, {item.unit}</span>
            <input
              type="number"
              name="quantity"
              min="0.001"
              step="0.001"
              defaultValue="1"
              className={cn(fieldClass, "w-28")}
              required
            />
          </label>
          <Button type="submit" disabled={pending} className="min-h-11">
            {pending ? "Списание…" : "Списать по FIFO"}
          </Button>
          {state.message && (
            <p
              role="status"
              className={cn(
                "w-full text-sm",
                state.ok ? "text-accent" : "text-destructive"
              )}
            >
              {state.message}
            </p>
          )}
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Партия</TableHead>
              <TableHead className="text-right">Остаток</TableHead>
              <TableHead>Срок</TableHead>
              <TableHead>Движения (последние)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {item.lots.map((lot) => (
              <TableRow
                key={lot.id}
                className={lot.belowThreshold ? "bg-destructive/5" : undefined}
              >
                <TableCell className="font-medium">{lot.lotCode}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {lot.quantityLeft} {lot.unit}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {lot.expiresAt ?? "—"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {lot.movements.length === 0
                    ? "—"
                    : lot.movements
                        .map(
                          (m) =>
                            `${m.type} ${m.quantity} (${m.occurredAt})`
                        )
                        .join("; ")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
