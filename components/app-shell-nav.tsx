"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_MODULES } from "@/lib/config/modules";
import { cn } from "@/lib/utils";

/** Боковая навигация ERP с активным состоянием и премиум-акцентом. */
export function AppShellNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Основная навигация">
      {APP_MODULES.map((mod) => {
        const isActive =
          pathname === mod.path || pathname.startsWith(`${mod.path}/`);

        return (
          <Link
            key={mod.id}
            href={mod.path}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              isActive
                ? "border border-sidebar-border/80 bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-sm ring-1 ring-accent/25"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            {mod.label}
          </Link>
        );
      })}
    </nav>
  );
}
