import { auth, signOut } from "@/auth";
import { STAFF_ROLE_LABELS } from "@/lib/auth/roles";
import { isDemoSkipAuth } from "@/lib/demo-auth";
import { Button } from "@/components/ui/button";

/** Sidebar footer: current staff user + sign out (or demo label when auth is bypassed). */
export async function StaffSessionBar() {
  const session = await auth();
  const demoBypass = isDemoSkipAuth();

  if (!session?.user) {
    if (demoBypass) {
      return (
        <div className="space-y-1">
          <p className="truncate text-xs text-sidebar-foreground/80">Демо (без входа)</p>
          <p className="text-[0.65rem] uppercase tracking-wide text-sidebar-foreground/60">
            Пилотный доступ
          </p>
        </div>
      );
    }
    return null;
  }

  const roleLabel = STAFF_ROLE_LABELS[session.user.role];

  return (
    <div className="space-y-2">
      <p className="truncate text-xs text-sidebar-foreground/80" title={session.user.email}>
        {session.user.name ?? session.user.email}
      </p>
      <p className="text-[0.65rem] uppercase tracking-wide text-sidebar-foreground/60">
        {roleLabel}
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <Button
          type="submit"
          variant="ghost"
          size="xs"
          className="h-7 w-full justify-start px-0 text-sidebar-foreground/70 hover:text-sidebar-foreground"
        >
          Выйти
        </Button>
      </form>
    </div>
  );
}
