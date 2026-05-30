# Code Review — Banya-Digital ERP (Hold 2026-05-30)

**Reviewer:** Muster Developer (wrap-up session)  
**Scope:** Full pragmatic review before project HOLD  
**Branch:** `master` @ post T-035  
**Build/lint:** `npm run build` exit 0 · `npm run lint` exit 0 (after unused-var fix)

---

## Executive summary

MVP ERP is **deployable and functional** for pilot/demo use. Architecture is modular and consistent with Muster conventions. Post T-034/T-035, Next.js 16 `"use server"` anti-patterns are resolved for form action state. Remaining risks are **operational/security** (demo auth bypass on prod, no RBAC on writes) and **test coverage** (manual scripts only). No CRITICAL code defects block holding the project; prod remains suitable for controlled demo/pilot with documented caveats.

---

## Findings by severity

### CRITICAL

_None after T-034/T-035._ Previously: exporting `initial*ActionState` objects from `"use server"` modules caused `invalid-use-server-value` and 500 on form submit — **fixed** in commits `7af2e2e`, `9557629`.

---

### HIGH

| ID | Area | Finding | Recommendation |
|----|------|---------|----------------|
| H-01 | Security | `DEMO_SKIP_AUTH` defaults to **skip auth** (`!== "false"`). Prod at https://banya-digital.vercel.app runs open ERP + unauthenticated CSV export. | Before any non-demo prod use: set `DEMO_SKIP_AUTH=false` on Vercel, verify `/login` + middleware, restrict CSV route. Documented in `.env.example`. |
| H-02 | Security | No **module-level RBAC** — any authenticated (or demo) user can mutate finance, CRM, inventory, checklists. ADR-001 defers write RBAC to backlog. | Resume with PM task: role-gated server actions (`owner` vs `ops` vs `warehouse`). |
| H-03 | Pilot | **T-028 Week 1 incomplete** — Day 1 done; Days 2–7 not verified (WAMZ X/4 not closed). Queue row incorrectly stated «День 1–7 выполнены». | Hold with honest status; resume pilot when Human ops ready. |

---

### MEDIUM

| ID | Area | Finding | Recommendation |
|----|------|---------|----------------|
| M-01 | Next.js 16 | Middleware convention **deprecated** — build warns: use `proxy` instead. | Track Next.js 16 migration guide; non-blocking for hold. |
| M-02 | UX | Only `/finance` has `error.tsx`. `/dashboard`, `/crm`, `/operations` rely on Next.js generic error UI. | Add route-level `error.tsx` when resuming (copy finance pattern). |
| M-03 | UX | No `loading.tsx` on data-heavy routes — SSR pages may feel slow on Neon cold start. | Optional `loading.tsx` + Suspense boundaries. |
| M-04 | Data | `withDbTimeout` (8s) **swallows errors** and returns fallbacks — good for resilience, but silent degradation (zeros/empty) without user-visible warning except finance empty state. | Log + optional «данные могут быть неполными» banner on timeout. |
| M-05 | Audit | `completedBy` / `resolvedBy` hardcoded `"demo-user"` when auth bypassed — audit trail not tied to real staff. | Wire `auth()` session user id when `DEMO_SKIP_AUTH=false`. |
| M-06 | Tests | No Jest/Vitest/Playwright — only `scripts/test-*.mjs` smoke for actions. Regression relies on manual QA checklist. | Add minimal Playwright smoke on resume (3 form submits). |
| M-07 | Docs | `docs/roadmap.md` partially stale (T-023 marked pending; Phase labels duplicated). | Update on resume or in hold pass (low priority). |

---

### LOW

| ID | Area | Finding | Recommendation |
|----|------|---------|----------------|
| L-01 | Lint | Unused `statusVariant` in `today-bookings-interactive.tsx` — **fixed** in hold pass. | — |
| L-02 | Demo | `lib/demo-auth.ts` exports hardcoded `DEMO_STAFF_PASSWORD = "banya-demo"` (mirrors seed). Acceptable for demo; not a prod secret if auth enabled with rotated passwords. | Keep seed password in env only (`DEMO_STAFF_PASSWORD`). |
| L-03 | Types | `"use server"` files export `export type` result aliases (`ToggleChecklistResult`, etc.) — valid per Next.js 16 (types erased at compile). | No change. |
| L-04 | Infra | `staff-session-bar.tsx` inline `"use server"` on signOut form action — valid pattern. | — |

---

### INFO

| ID | Area | Finding |
|----|------|---------|
| I-01 | Architecture | Clean split: `app/(app)/` pages → `modules/*/services` (read) + `modules/*/actions` (write). Registry in `docs/server-actions-index.md`. |
| I-02 | Architecture | `lib/db/index.ts` lazy Prisma proxy — safe import without `DATABASE_URL` at build time. Prisma 7 + `@prisma/adapter-pg`. |
| I-03 | Security | No `$queryRaw` / string-concat SQL — Prisma ORM only → **no SQL injection** surface in app code. |
| I-04 | Security | `.env*` gitignored; `.env.example` complete for pilot vars. No secrets in tracked files (verified). |
| I-05 | Next.js 16 | Action state modules **without** `"use server"`: `finance-action-state.ts`, `crm-action-state.ts`, `fifo-action-state.ts`. Server modules export **only async functions** (+ types). |
| I-06 | Resilience | All 10 server actions use `try/catch` + RU messages + `safeRevalidatePaths` (T-029…T-031). |
| I-07 | Deploy | Prod URL: https://banya-digital.vercel.app · GitHub: `pagasbot-coder/Banya-Digital` · Neon DB. |
| I-08 | Blocked | T-024 YCLIENTS import — correctly BLOCKED; do not implement on hold. |

---

## Architecture review

### App Router

```
app/
├── (app)/          # ERP shell (sidebar layout)
│   ├── dashboard/
│   ├── finance/    + error.tsx
│   ├── crm/        + guests/[id], guests/new
│   └── operations/ + inventory/
├── api/auth/[...nextauth]/
├── api/finance/export/
├── login/
└── page.tsx        → redirect via middleware
```

**Verdict:** Sound modular routing. Domain logic correctly **not** in `app/` — lives in `modules/`.

### modules/ + lib/

| Layer | Role |
|-------|------|
| `modules/*/services/` | Server-side reads, aggregation, CSV build |
| `modules/*/actions/` | `"use server"` mutations |
| `modules/*/*-action-state.ts` | Client-safe initial state (no directive) |
| `lib/db`, `lib/db-timeout`, `lib/safe-revalidate` | Cross-cutting infra |

**Verdict:** Matches Muster + Vibecoder conventions. Single registry (`lib/config/modules.ts`) for nav.

### Server actions pattern

- `useActionState(action, initialState)` with state in separate files — **correct for Next.js 16**.
- Finance: revalidate dashboard only; `/finance` refreshes via `router.refresh()` (T-033) — avoids RSC crash loop.
- Documented in `docs/server-actions-index.md`.

---

## Security review

| Check | Status |
|-------|--------|
| Secrets in repo | PASS |
| `.env.example` | PASS (AUTH_*, DATABASE_URL, DEMO_*, brand vars) |
| SQL injection | PASS (Prisma only) |
| Auth on prod | **FAIL (intentional demo)** — `DEMO_SKIP_AUTH` true |
| CSV export auth | Gated when auth on; open in demo mode |
| CSRF on server actions | Next.js built-in |
| Password hashing | bcrypt in seed + Credentials provider |

---

## Data layer

- **Prisma 7** + pg Pool adapter; singleton with dev HMR guard.
- **Neon:** 8s timeout wrapper prevents hung RSC; finance uses `Promise.allSettled` for partial failure tolerance.
- **Error handling:** Actions return `{ ok, message }`; pages use `FinanceResult` discriminated union with empty/error states.
- **Migrations:** `db:push` workflow (no committed migration history) — acceptable for pilot; consider `migrate dev` for prod hardening on resume.

---

## UX / error boundaries

| Route | error.tsx | loading.tsx | Empty state |
|-------|-----------|-------------|-------------|
| `/finance` | Yes | No | Yes (no DB / empty) |
| `/dashboard` | No | No | Yes |
| `/crm` | No | No | Partial |
| `/operations` | No | No | Yes |

Demo pilot banner on dashboard (T-026) — OK.

---

## Test coverage

| Type | Coverage |
|------|----------|
| Unit tests | None |
| E2E | None |
| Manual scripts | `scripts/test-crm-fifo-actions.mjs`, `test-revenue-action.mjs` |
| QA docs | `knowledge-base/qa-checklist.md`, `qa-report-pilot-week1.md` |

**Gap:** No CI running build/lint on push (GitHub Actions not configured).

---

## Build / lint / deploy

```text
npm run build  → exit 0 (Next.js 16.2.6, 12 routes)
npm run lint   → exit 0 (post hold fix)
```

**Deployment readiness:** Suitable for **demo/pilot hold** on Vercel + Neon. Not ready for **public production** without auth + RBAC (H-01, H-02).

---

## Tech debt & known bugs (from QA)

| Item | Status |
|------|--------|
| Finance submit 500 (use server export) | **Fixed** T-034 |
| CRM/FIFO submit 500 | **Fixed** T-035 |
| Finance page crash after submit | **Fixed** T-033 |
| Prod 500 on revenue/FIFO (unhandled throws) | **Fixed** T-029 |
| CRM guest/booking 500 | **Fixed** T-030 |
| Middleware → proxy deprecation | Open (M-01) |
| Module RBAC | Backlog |
| YCLIENTS T-024 | BLOCKED |

---

## Hold recommendation

**Put on HOLD** — MVP code stable; pilot ops paused by Human. Resume checklist in `docs/hold-status.md`.

---

_Review date: 2026-05-30 · Commits reviewed through `9557629` (T-035)._
