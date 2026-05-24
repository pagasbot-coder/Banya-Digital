import Link from "next/link";
import { APP_MODULES } from "@/lib/config/modules";

export const dynamic = "force-dynamic";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 bg-background">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border px-4 py-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Banya-Digital
          </p>
          <h1 className="text-lg font-semibold text-foreground">ERP</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {APP_MODULES.map((mod) => (
            <Link
              key={mod.id}
              href={mod.path}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {mod.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex flex-1 flex-col overflow-auto">{children}</main>
    </div>
  );
}
