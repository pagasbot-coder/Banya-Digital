import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import type { StaffRoleName } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

const DEMO_ACCOUNTS: { email: string; role: StaffRoleName }[] = [
  { email: "owner@demo.local", role: "owner" },
  { email: "ops@demo.local", role: "ops" },
  { email: "admin@demo.local", role: "admin" },
  { email: "warehouse@demo.local", role: "warehouse" },
];

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">
          Дегтярные Бани
        </p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Вход для персонала
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Операционный ERP — сессии владельца, операций, администратора и склада
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Загрузка…</p>}>
        <LoginForm demoAccounts={DEMO_ACCOUNTS} />
      </Suspense>
    </div>
  );
}
