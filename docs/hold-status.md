# Banya-Digital ERP — Project HOLD

**Status:** ON HOLD  
**Date:** 2026-05-30  
**Reason:** Human Architect decided to pause pilot execution and wrap up MVP development until further notice.

---

## Production (unchanged)

| Item | Value |
|------|--------|
| **Prod URL** | https://banya-digital.vercel.app |
| **GitHub** | https://github.com/pagasbot-coder/Banya-Digital |
| **Pilot object** | Дегтярные Бани (Санкт-Петербург) |
| **Auth mode** | `DEMO_SKIP_AUTH=true` — open access, no login required |
| **Demo staff** (when auth enabled) | `owner@demo.local` / password from `DEMO_STAFF_PASSWORD` (default `banya-demo`) |

---

## Pilot status (honest)

| Milestone | Status |
|-----------|--------|
| Prod smoke (T-027) | DONE — routes 200, CSV OK |
| Pilot Week 1 Day 1 | DONE (2026-05-27) |
| Pilot Week 1 Days 2–7 | **Not completed** — paused on hold |
| WAMZ week 1 close | **Not recorded** |

Do **not** mark pilot days complete until Human ops resumes `docs/pilot-start.md`.

---

## Known issues (accept for hold)

1. Demo auth bypass on prod — anyone can read/write ERP data.
2. No role-based write permissions (all staff roles equal for mutations).
3. Only `/finance` has custom error boundary.
4. No automated E2E tests in CI.
5. T-024 YCLIENTS import — BLOCKED, not started.

Full review: [`docs/code-review-hold-2026-05.md`](code-review-hold-2026-05.md).

---

## How to resume

### 1. Environment (local)

```powershell
cd d:\curorproject\banya-digital
copy .env.example .env
docker compose up -d          # or use Neon DATABASE_URL
npm install
npm run db:push
npm run db:seed
npm run dev
```

### 2. Verify quality gate

```powershell
npm run build
npm run lint
```

### 3. Read queue

Open `orchestration-queue.md` — section **PROJECT HOLD** → follow resume checklist.

### 4. Pilot ops (Human)

Continue from **Day 2** in `docs/pilot-start.md`:

- https://banya-digital.vercel.app/finance — revenue entry (2 halls)
- https://banya-digital.vercel.app/dashboard — KPI / WAMZ check

### 5. Before non-demo production

- [ ] Vercel: `DEMO_SKIP_AUTH=false`
- [ ] Set strong `AUTH_SECRET`, rotate demo passwords in Neon
- [ ] Smoke: `/login` → protected routes → CSV requires session
- [ ] PM: RBAC backlog task

### 6. Developer backlog (when un-hold)

| Priority | Task |
|----------|------|
| P0 | Complete T-028 pilot week 1 (Human ops) |
| P1 | Enable prod auth (Human sign-off) |
| P1 | Module RBAC on server actions |
| P2 | T-015 Product Map Phase 2 (with Human) |
| P2 | T-024 YCLIENTS (Architect unblock) |
| P3 | Playwright smoke in CI |
| P3 | Middleware → proxy migration (Next.js 16) |

---

## Prod retest checklist (after any deploy)

| URL | Check |
|-----|-------|
| `/dashboard` | KPI, WAMZ, demo banner, checklists |
| `/finance` | Submit revenue → «Выручка сохранена.» (no error boundary) |
| `/crm/guests/new` | Create guest |
| `/crm` | Create booking |
| `/operations/inventory` | FIFO OUT |
| `/api/finance/export` | CSV download |

Manual scripts (optional):

```powershell
node scripts/test-crm-fifo-actions.mjs
node scripts/test-revenue-action.mjs
```

---

## Contacts / docs

| Doc | Purpose |
|-----|---------|
| `orchestration-queue.md` | Task source of truth |
| `knowledge-base/project-hold-summary.md` | RU summary for Human |
| `docs/pilot-reglement.md` | 8-week pilot framework |
| `docs/GITHUB-DEPLOY.md` | Vercel + Neon deploy |
| `knowledge-base/qa-checklist.md` | QA regression |
