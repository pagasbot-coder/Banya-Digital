export default function CrmPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-accent">
          Модуль
        </p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          CRM
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Гости, бронирования и spa-программы — в разработке.
        </p>
      </header>
      <div className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
        Раздел появится в следующих итерациях.
      </div>
    </div>
  );
}
