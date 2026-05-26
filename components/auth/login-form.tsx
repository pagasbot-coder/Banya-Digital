"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DEMO_STAFF_EMAIL, DEMO_STAFF_PASSWORD } from "@/lib/demo-auth";
import { STAFF_ROLE_LABELS, type StaffRoleName } from "@/lib/auth/roles";

type DemoAccount = {
  email: string;
  role: StaffRoleName;
};

type LoginFormProps = {
  demoAccounts: DemoAccount[];
};

/** Credentials login for staff ERP (Auth.js client signIn). */
export function LoginForm({ demoAccounts }: LoginFormProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setPending(false);

    if (result?.error) {
      setError("Неверный email или пароль");
      return;
    }

    window.location.href = result?.url ?? callbackUrl;
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 text-sm">
        <p className="font-medium text-foreground">Учебный доступ (демо)</p>
        <p className="mt-2 text-foreground">
          Демо:{" "}
          <span className="font-mono">{DEMO_STAFF_EMAIL}</span> / пароль:{" "}
          <span className="font-mono font-semibold">{DEMO_STAFF_PASSWORD}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Один пароль для всех demo-аккаунтов после <code className="rounded bg-muted px-1">db:seed</code>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            defaultValue={DEMO_STAFF_EMAIL}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            placeholder={DEMO_STAFF_EMAIL}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Пароль
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            defaultValue={DEMO_STAFF_PASSWORD}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Вход…" : "Войти"}
        </Button>
      </form>

      {demoAccounts.length > 1 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Другие роли (тот же пароль)</p>
          <ul className="mt-2 space-y-1">
            {demoAccounts
              .filter((account) => account.email !== DEMO_STAFF_EMAIL)
              .map((account) => (
                <li key={account.email}>
                  <span className="font-mono text-foreground">{account.email}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — {STAFF_ROLE_LABELS[account.role]}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
