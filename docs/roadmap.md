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
- [x] **T-006** — Wire dashboard KPIs to PostgreSQL + seed (Developer)
- [x] **T-009** — Auth.js v5 staff sessions (`/login`, middleware)

**Локальная БД:** `docker compose up -d` → `npm run db:push` → `npm run db:seed` (см. README).

## Phase 2 — Operations core

- [x] Spa timings + kitchen sync UI (`/operations`)
- [x] Checklists link + dashboard shift checklists
- [ ] Hall load dedicated screen (KPI on dashboard)

## Phase 3 — Finance & inventory

- [x] Unit economics by hall (`/finance`)
- [ ] FIFO warehouse dedicated UI (alerts on dashboard)

## Phase 4 — CRM

- [x] Guests list + today's bookings (`/crm`)
- [x] **T-010** — Guest detail / edit + booking CRUD — **DONE**

## Phase 3 — Input & pilot (queue T-009…T-017)

- [x] **T-009** — Auth.js staff roles (ADR-001)
- [x] **T-011** — Finance data entry (RevenueLine / CostLine forms)
- [x] **T-012** — Inventory FIFO UI (`/operations/inventory`, FIFO OUT)
- [x] **T-013** — Shift checklists toggle on dashboard
- [x] **T-014** — Pilot reglement — [`docs/pilot-reglement.md`](pilot-reglement.md)
- [x] **T-017** — SME industry brief — `knowledge-base/industry-brief.md`
- [ ] **T-018…T-025** — после sign-off Human (см. queue)

## Pilot documentation

- [x] `docs/pilot-reglement.md` — 8 недель, метрики, роли (T-014)

## Документация

- [x] `docs/technical-overview.md` — стек, модули, БД, команды (RU)
- [x] `docs/management-overview.md` — обзор для руководства без жаргона (RU)

_See live status in `orchestration-queue.md`._
