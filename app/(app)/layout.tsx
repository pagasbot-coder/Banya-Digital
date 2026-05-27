import { AppShellNav } from "@/components/app-shell-nav";
import { StaffSessionBar } from "@/components/auth/staff-session-bar";
import { getBrandConfig } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = getBrandConfig();

  return (
    <div className="flex min-h-full flex-1 bg-background">
      <aside className="flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:w-60">
        <div className="border-b border-sidebar-border px-4 py-5">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            {brand.name}
          </p>
          <h1 className="font-heading text-lg font-semibold tracking-tight text-sidebar-foreground">
            ERP
          </h1>
          <p className="mt-1 text-xs text-sidebar-foreground/70">
            {brand.tagline}
          </p>
        </div>
        <AppShellNav />
        <footer className="mt-auto border-t border-sidebar-border px-4 py-3 text-xs text-sidebar-foreground/60">
          <StaffSessionBar />
          <p className="mt-3">Операционная смена</p>
        </footer>
      </aside>
      <main className="flex flex-1 flex-col overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}
