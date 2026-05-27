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
import { formatRubles } from "@/lib/format-money";
import type { RetailSummary } from "@/modules/finance/types";
import { cn } from "@/lib/utils";

type RetailSectionProps = {
  dateLabel: string;
  retail: RetailSummary;
};

/** Розница (бар/магазин): выручка и COGS по продуктам за день и за неделю. */
export function RetailSection({ dateLabel, retail }: RetailSectionProps) {
  if (retail.rows.length === 0) return null;

  return (
    <section aria-labelledby="finance-retail-heading">
      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle
            id="finance-retail-heading"
            className="font-heading text-xl font-semibold tracking-tight md:text-2xl"
          >
            Розница
          </CardTitle>
          <CardDescription>
            {dateLabel} и последние 7 дней — выручка, COGS и маржа по продуктам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Продукт</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead className="text-right">День: выручка</TableHead>
                <TableHead className="text-right">День: COGS</TableHead>
                <TableHead className="text-right">День: маржа</TableHead>
                <TableHead className="text-right">Неделя: выручка</TableHead>
                <TableHead className="text-right">Неделя: COGS</TableHead>
                <TableHead className="text-right">Неделя: маржа</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retail.rows.map((row) => (
                <TableRow key={row.productId}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.category}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRubles(row.dayRevenue)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatRubles(row.dayCogs)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-heading tabular-nums",
                      row.dayMarginPercent < 40 && row.dayRevenue > 0
                        ? "text-destructive"
                        : null
                    )}
                  >
                    {formatRubles(row.dayMarginRub)} (
                    {row.dayMarginPercent.toFixed(0)}%)
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRubles(row.weekRevenue)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatRubles(row.weekCogs)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-heading tabular-nums",
                      row.weekMarginPercent < 40 && row.weekRevenue > 0
                        ? "text-destructive"
                        : null
                    )}
                  >
                    {formatRubles(row.weekMarginRub)} (
                    {row.weekMarginPercent.toFixed(0)}%)
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/40 font-medium">
                <TableCell colSpan={2}>Итого</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRubles(retail.dayRevenue)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRubles(retail.dayCogs)}
                </TableCell>
                <TableCell className="text-right font-heading tabular-nums">
                  {formatRubles(retail.dayMarginRub)} (
                  {retail.dayMarginPercent.toFixed(0)}%)
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRubles(retail.weekRevenue)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRubles(retail.weekCogs)}
                </TableCell>
                <TableCell className="text-right font-heading tabular-nums">
                  {formatRubles(retail.weekMarginRub)} (
                  {retail.weekMarginPercent.toFixed(0)}%)
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

