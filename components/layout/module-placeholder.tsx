type ModulePlaceholderProps = {
  title: string;
  description: string;
  features: string[];
};

/** Заглушка модуля до реализации фич — единый layout для всех разделов. */
export function ModulePlaceholder({
  title,
  description,
  features,
}: ModulePlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
      </header>
      <section className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-sm font-medium text-foreground">Планируется в модуле</h3>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
          {features.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
