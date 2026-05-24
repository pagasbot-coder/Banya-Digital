# Tech Stack — Banya-Digital ERP

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Next.js API routes / Server Actions (Node.js TypeScript) |
| Database | PostgreSQL (Supabase or Neon) — T-002 |
| ORM | TBD (Prisma / Drizzle) — T-002 |
| Deploy | Vercel |
| DevOps | Docker (later), Git |

## Conventions

- Agent rules: `.cursor/rules/` (`vibecoder-master.mdc`, `muster-orchestration.mdc`, `role-*.mdc`)
- Domain code: `modules/<name>/` + routes under `app/(app)/<name>/`
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`)
- Shared UI: `components/ui/` (shadcn), shell: `components/app-shell-nav.tsx`
