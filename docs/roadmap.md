# Roadmap — Banya-Digital ERP

## Phase 0 — Foundation (current)

- [x] Muster: `orchestration-queue.md`, `knowledge-base/`, `.cursor/agents/`
- [x] T-001: Next.js 16 + Tailwind v4 + shadcn + module folders
- [x] Placeholder pages: Dashboard, Finance, CRM, Operations
- [x] **T-002** — PostgreSQL schema design (Developer)
- [x] **T-003** — Dashboard shell design (UI/UX)
- [x] T-004 — Product brief refinement (PM)
- [x] T-005 — QA foundation pass (QA)

## Phase 1 — Data & live dashboard

- [x] PostgreSQL + ORM scaffold (T-002)
- [x] Dashboard KPI layout — mock (T-003)
- [x] Product brief: MVP P0/P1, metrics, T-006 acceptance criteria (T-004)
- [ ] **T-006** — Wire dashboard KPIs to PostgreSQL + seed (**READY**, Developer; needs `DATABASE_URL`)
- [ ] Auth (decision deferred)

**Следующий шаг для архитектора:** задать `DATABASE_URL` в `.env` или сказать «шаг A» — Developer берёт T-006.

## Phase 2 — Operations core

- Hall load / yield
- Spa timings + kitchen sync
- Checklists

## Phase 3 — Finance & inventory

- Unit economics views
- FIFO organic warehouse (hay, fir)

## Phase 4 — CRM

- Guests, bookings, programs

_See live status in `orchestration-queue.md`._
