# Orchestration Queue (Muster)

> **Источник истины для задач.** PM добавляет задачи; роли берут `READY` → `IN_PROGRESS` → `DONE`.  
> Перед любой работой агент **читает этот файл**; после завершения — **обновляет статус и краткий итог**.

**Проект:** Banya-Digital ERP  
**Архитектор (Human):** _ваше имя_  
**Последнее обновление:** 2026-05-25 (docs: technical + management overview)

---

## Как пользоваться (Cursor 3)

| Роль | Subagent | Чат в Agents Window | Правило |
|------|----------|---------------------|---------|
| PM | `muster-pm` | «Role: PM» | `@role-pm` |
| Developer | `muster-developer` | «Role: Developer» | `@role-developer` |
| UI/UX | `muster-ui-ux` | «Role: UI/UX» | `@role-ui-ux` |
| QA | `muster-qa` | «Role: QA» | `@role-qa` |

Контекст из `knowledge-base/` подключайте через **@** (например `@knowledge-base/product-brief.md`).

---

## Статусы

| Статус | Значение |
|--------|----------|
| `BACKLOG` | Идея, ещё не готова к работе |
| `READY` | Можно взять в работу |
| `IN_PROGRESS` | В работе (указать роль и агента) |
| `BLOCKED` | Ждёт решения архитектора |
| `DONE` | Выполнено |
| `CANCELLED` | Отменено |

---

## Активная очередь

| ID | Задача | Роль | Статус | Приоритет | Зависимости | Контекст (@files) | Итог / PR |
|----|--------|------|--------|-----------|-------------|-------------------|-----------|
| T-001 | Bootstrap Next.js + Muster + модульная структура | Developer | DONE | P0 | — | `@docs/tech-stack.md` | Next.js 16 + Tailwind v4 + shadcn; модули finance/crm/operations/dashboard; build/lint OK |
| T-002 | Проектирование схемы PostgreSQL (ядро ERP) | Developer | DONE | P0 | T-001 | `@knowledge-base/architecture.md` | Prisma 7 (14 models), `lib/db/` + adapter-pg, `prisma.config.ts`, db:* scripts |
| T-003 | Дизайн dashboard shell (premium spa UI) | UI/UX | DONE | P1 | T-001 | `@knowledge-base/design-tokens.md` | Premium shell: KPI grid, alerts, ops stub; mock-kpis; tokens + sidebar |
| T-004 | Расширить product-brief (метрики, MVP v1) | PM | DONE | P1 | — | `@knowledge-base/product-brief.md` | MVP P0/P1 по модулям, user stories, метрики, AC для Dashboard live data (T-006) |
| T-005 | Чеклист QA для foundation | QA | DONE | P2 | T-001 | `@knowledge-base/qa-checklist.md` | PASS: build/lint/db:generate OK; routes 200; dashboard KPI+alerts+ops; hydration note (Cursor refs) non-blocking |
| T-006 | Wire dashboard KPIs to PostgreSQL + seed data | Developer | DONE | P0 | T-004, T-002, T-003 | `@knowledge-base/product-brief.md` (AC T-006), `@prisma/schema.prisma` | docker-compose, rich seed, dashboard live KPIs/alerts/ops, `db:seed`, build OK |
| T-008 | Обзоры docs: technical + management (RU) | PM | DONE | P2 | T-006 | `@docs/technical-overview.md`, `@docs/management-overview.md` | Черновики для dev и руководства; roadmap обновлён |

---

## Детали задач

### T-001 — Foundation scaffold

**Acceptance criteria:**
- [x] `npm run dev` поднимает приложение
- [x] Tailwind + shadcn/ui подключены
- [x] Структура `app/(app)/`, `modules/`, `components/`, `lib/`
- [x] Placeholder-страницы: Dashboard, Finance, CRM, Operations

**Notes:** Не включать полную схему БД и реализацию dashboard — только foundation.

---

### T-002 — PostgreSQL schema (ядро)

**Acceptance criteria:**
- [x] ER-диаграмма или описание сущностей в `knowledge-base/`
- [x] Миграции / Drizzle или Prisma scaffold (Prisma 7)
- [x] `.env.example` согласован с выбранным ORM

**Out of scope:** Полная реализация FIFO склада и unit economics — отдельные задачи после ядра.

---

### T-003 — Dashboard design

**Acceptance criteria:**
- [x] Заполнены design tokens (premium bath/spa)
- [x] Wireframe или layout spec для `app/(app)/dashboard`
- [x] Навигация и KPI-зоны согласованы с PM

---

### T-005 — QA foundation pass

**Acceptance criteria:**
- [x] `npm run build` exit 0
- [x] `npm run lint` exit 0
- [x] `npm run db:generate` exit 0
- [x] Routes `/`, `/dashboard`, `/finance`, `/crm`, `/operations` load
- [x] Dashboard: KPI cards, critical alerts, today operations sections
- [x] `knowledge-base/qa-checklist.md` updated

**Notes:** Dev console hydration mismatch on `data-cursor-ref` (Cursor IDE browser) — not an app defect. DB wire (`db:push`, live KPI) out of scope for T-005.

---

### T-004 — Product brief refinement

**Acceptance criteria:**
- [x] Проблема и аудитория заполнены
- [x] MVP v1: фичи по модулям с приоритетами P0/P1
- [x] 5 user stories (owner, ops, warehouse)
- [x] Измеримые метрики успеха
- [x] Out of scope v1
- [x] Секция AC «Dashboard live data» для handoff T-006

---

### T-006 — Wire dashboard KPIs to PostgreSQL + seed

**Роль:** Developer | **Зависимости:** T-004, T-002, T-003

**Acceptance criteria:** см. `@knowledge-base/product-brief.md` → «Acceptance criteria — Dashboard live data».

**Краткий чеклист:**
- [x] `db:seed` + `DATABASE_URL` → KPI grid из `RevenueLine`/`CostLine`/inventory/yield
- [x] Critical alerts из операций/склада (не mock)
- [x] Убрать prod-import `mock-kpis` с dashboard page
- [x] Graceful empty state без БД
- [x] QA checklist: KPI из БД

**Blocker:** снят — local Docker в `docker-compose.yml` + `.env.example`.

---

## Журнал (лог решений)

| Дата | Кто | Событие |
|------|-----|---------|
| 2026-05-23 | Developer | Создан Banya-Digital ERP foundation (Muster + Next.js 16) |
| 2026-05-23 | Developer | T-001 DONE: модульная структура, placeholder pages |
| 2026-05-24 | Developer | T-002 DONE: Prisma schema, lib/db, architecture data model |
| 2026-05-24 | UI/UX | T-003 DONE: dashboard shell, design tokens, mock KPIs, AppShellNav |
| 2026-05-24 | QA | T-005 DONE: foundation checklist pass; build/lint/routes/dashboard verified |
| 2026-05-24 | Developer | T-006 DONE: PostgreSQL seed, dashboard live KPIs/alerts/ops, docker-compose |

---

## Правила для всех агентов

1. **Старт:** прочитать `orchestration-queue.md` → взять одну задачу `READY` своей роли → поставить `IN_PROGRESS`.
2. **Работа:** использовать `@knowledge-base/*` и правила роли.
3. **Финиш:** статус → `DONE`, заполнить «Итог / PR», при необходимости обновить `knowledge-base/` и `docs/roadmap.md`.
