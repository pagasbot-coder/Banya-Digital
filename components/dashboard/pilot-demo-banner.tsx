import { Info } from "lucide-react";

/** Ненавязчивый баннер пилота на сводке (демо без жёсткого auth). */
export function PilotDemoBanner() {
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-md border border-accent/25 bg-accent/5 px-3 py-2 text-sm text-muted-foreground"
    >
      <Info
        className="mt-0.5 size-4 shrink-0 text-accent"
        aria-hidden
      />
      <p>
        <span className="font-medium text-foreground">Режим демо</span>
        <span aria-hidden> · </span>
        Пилот: укажите объект в{" "}
        <code className="rounded bg-muted/80 px-1 py-0.5 font-mono text-xs">
          docs/pilot-start.md
        </code>
      </p>
    </div>
  );
}
