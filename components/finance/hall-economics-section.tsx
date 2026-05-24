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
import type { HallEconomicsRow } from "@/modules/finance/types";
import { cn } from "@/lib/utils";

type HallEconomicsSectionProps = {
  dateLabel: string;
  rows: HallEconomicsRow[];
  totals: { revenue: number; cogs: number; marginPercent: number };
};

/** Unit economics по залам за сегодня. */
export function HallEconomicsSection({
  dateLabel,
  rows,
  totals,
}: HallEconomicsSectionProps) {
  return (
    <section aria-labelledby="finance-economics-heading">
      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle
            id="finance-economics-heading"
            className="font-heading text-xl font-semibold tracking-tight md:text-2xl"
          >
            Unit economics по залам
          </CardTitle>
          <CardDescription>
            {dateLabel} — выручка, COGS и валовая маржа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Зал</TableHead>
                <TableHead className="text-right">Выручка</TableHead>
                <TableHead className="text-right">COGS</TableHead>
                <TableHead className="text-right">Маржа</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.hallId}>
                  <TableCell className="font-medium">{row.hallName}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRubles(row.revenue)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatRubles(row.cogs)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-heading tabular-nums",
                      row.marginPercent < 40 && "text-destructive"
                    )}
                  >
                    {row.marginPercent.toFixed(1).replace(".", ",")}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/40 font-medium">
                <TableCell>Итого</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRubles(totals.revenue)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRubles(totals.cogs)}
                </TableCell>
                <TableCell className="text-right font-heading tabular-nums">
                  {totals.marginPercent.toFixed(1).replace(".", ",")}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
