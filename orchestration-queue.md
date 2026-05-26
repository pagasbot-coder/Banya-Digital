# Orchestration Queue (Muster)

> **Источник истины для задач.** PM добавляет задачи; роли берут `READY` → `IN_PROGRESS` → `DONE`.  
> Перед любой работой агент **читает этот файл**; после завершения — **обновляет статус и краткий итог**.

**Проект:** Banya-Digital ERP  
**Архитектор (Human):** _ваше имя_  
**Последнее обновление:** 2026-05-26 (PM: Product Map 3.10 в role-pm; T-015…T-016 BACKLOG)

---

## Как пользоваться (Cursor 3)

| Роль | Subagent | Чат в Agents Window | Правило |
|------|----------|---------------------|---------|
| PM | `muster-pm` | «Role: PM» | `@role-pm` |
| Developer | `muster-developer` | «Role: Developer» | `@role-developer` |
| UI/UX | `muster-ui-ux` | «Role: UI/UX» | `@role-ui-ux` |
| QA | `muster-qa` | «Role: QA» | `@role-qa` |
| Growth / CMO | `muster-growth-marketer` | «Role: CMO» / «Role: Growth» / «Роль: Директор по маркетингу» | `@role-growth-marketer` |

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
| T-009 | Auth: роли и доступ к модулям (решение + scaffold) | Developer | BACKLOG | P1 | T-006 | `@knowledge-base/architecture.md`, `@docs/roadmap.md` | |
| T-010 | CRM: CRUD гостя + создание/редактирование брони | Developer | READY | P1 | T-006 | `@knowledge-base/product-brief.md`, `modules/crm/` | |
| T-011 | Finance: ввод RevenueLine / CostLine за business day | Developer | READY | P0 | T-006 | `@knowledge-base/product-brief.md`, `modules/finance/` | |
| T-012 | Inventory: FIFO UI (лоты, движения, пороги) | Developer | READY | P0 | T-006, T-002 | `@knowledge-base/architecture.md`, `modules/operations/inventory/` | |
| T-013 | Operations: чеклисты смены (прогресс N/M, отметки) | Developer | READY | P1 | T-006, T-003 | `@knowledge-base/product-brief.md`, `modules/operations/` | |
| T-014 | Pilot: регламент 8-недельного пилота (RU) | PM | READY | P1 | T-008 | `@docs/management-overview.md`, `@knowledge-base/product-brief.md` | |
| T-015 | Product Map: Phase 2 discovery → brief + roadmap | PM | BACKLOG | P2 | T-014 | `@knowledge-base/product-map-workflow.md`, `@knowledge-base/product-brief.md` | |
| T-016 | iGaming BiJi: Product Map onboarding (новый продукт) | PM | BACKLOG | P2 | — | `@knowledge-base/product-map-workflow.md` (шаблон), `@role-pm` | |

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

### T-009 — Auth (роли и доступ)

**Роль:** Developer | **Статус:** BACKLOG (ждёт решения Architect)

**Given/When/Then:**
- **Given** выбранный провайдер (NextAuth / Clerk / custom JWT), **When** пользователь без роли `finance` открывает `/finance`, **Then** 403 или редирект на login.
- **Given** роль `ops`, **When** открывает `/dashboard`, **Then** видит сводку без редактирования финансовых проводок (если так задокументировано).

**Checklist (после решения):**
- [ ] ADR или Notes в `architecture.md`: провайдер, модель ролей (owner, ops, warehouse, crm)
- [ ] `.env.example` дополнен переменными auth
- [ ] Минимум 2 роли в seed для демо
- [ ] `npm run build` / lint OK

**Notes:** Roadmap Phase 1 — «Auth (decision deferred)». PM ставит `READY` только после ответа Architect (провайдер + список ролей).

---

### T-010 — CRM CRUD

**Acceptance criteria:**
- [ ] `/crm` — кнопка «Добавить гостя»; форма: имя, телефон, email (опционально); сохранение в `Guest`
- [ ] Карточка `/crm/guests/[id]` — просмотр и редактирование контактов
- [ ] Создание брони на зал: дата/время, зал, статус RU; связь с `Hall` / `SpaProgram` где применимо
- [ ] Валидация конфликта слота (базовая: пересечение по залу) — сообщение RU
- [ ] RU UI, shadcn Form + Table; `npm run build` OK

**Out of scope:** маркетинговая воронка, оплата, SMS.

---

### T-011 — Finance input

**Acceptance criteria:**
- [ ] Форма добавления `RevenueLine`: businessDate (default today), зал/услуга, сумма, валюта RUB
- [ ] Форма добавления `CostLine`: COGS, опционально `lotId` для органики
- [ ] После сохранения — `/finance` и dashboard KPI пересчитываются при refresh (SSR/revalidate)
- [ ] RU labels; ошибки валидации на форме
- [ ] Seed-совместимость: `db:seed` не ломается

**Out of scope:** экспорт в 1С, НДС, мульти-валюта.

---

### T-012 — Inventory FIFO UI

**Acceptance criteria:**
- [ ] Страница `/operations/inventory` (или подраздел): список `InventoryItem` + остатки по `InventoryLot`
- [ ] Действие OUT: списание по FIFO (сервисный слой), обновление `quantityLeft`
- [ ] Пороговый алерт при OUT ниже `minThreshold` — отражение на dashboard KPI «Алерты склада»
- [ ] RU UI; движения `StockMovement` видны в истории лота
- [ ] AC product-brief: точность остатков — сценарий для QA описан в Notes

**Out of scope:** закупки/поставщики, штрихкоды.

---

### T-013 — Operations checklists

**Acceptance criteria:**
- [ ] Список `ShiftChecklist` на сегодня с прогрессом **N/M** по `ChecklistItem`
- [ ] Отметка пункта выполненным (toggle) с `updatedAt`
- [ ] Dashboard block «Операции смены» показывает актуальный N/M из БД (не stub)
- [ ] RU статусы; mobile-friendly touch targets (min 44px)
- [ ] `npm run build` OK

**Out of scope:** назначение чеклиста на сотрудника, push-уведомления.

---

### T-015 — Product Map Phase 2 discovery

**Роль:** PM | **Статус:** BACKLOG (поднять в `READY` после T-014 или по запросу Architect)

**Acceptance criteria:**
- [ ] Пройден discovery checklist из `@role-pm` (Strategy → People)
- [ ] Обновлены `product-brief.md` (Phase 2 in/out), `docs/roadmap.md` (Now/Next/Later)
- [ ] `product-map-workflow.md`: сессия в таблице, риски, open questions закрыты или `BLOCKED`
- [ ] Новые epics разбиты на `T-0xx` с DoR; приоритеты P0/P1 согласованы с метриками пилота
- [ ] «Журнал» — запись о scope Phase 2

**Notes:** Использовать Figma 3.10 / productmap.io только как референс; артефакты — в git. Не логиниться в app.productmap.io.

---

### T-016 — iGaming BiJi Product Map onboarding

**Роль:** PM | **Статус:** BACKLOG (нет репозитория/ brief в workspace)

**Acceptance criteria:**
- [ ] Architect: отдельный product context (имя, стадия, регуляторика) или новый каталог в monorepo
- [ ] `product-brief.md` + `product-map-workflow.md` по шаблону Product Map 3.10
- [ ] Figma/Product Map ссылки от Human зафиксированы в workflow log
- [ ] Первые 3–5 `T-0xx` в очереди (foundation) с DoR

**Notes:** До появления `knowledge-base/` для BiJi — не ставить `READY`. Опционально: Human создаёт проект в https://app.productmap.io/profile/assistant/create-project и экспортирует контекст в markdown.

---

### T-014 — Pilot reglement (8 недель)

**Роль:** PM | **Deliverable:** `docs/pilot-reglement.md` (новый) + ссылки из `management-overview.md`

**Acceptance criteria:**
- [ ] Цели пилота из product-brief (метрики: −30% закрытие смены, ≥95% остатки, daily margin)
- [ ] Роли участников, ритм (ежедневная сводка, еженедельная инвентаризация)
- [ ] Definition of pilot success / stop criteria
- [ ] Чеклист «до старта пилота» (Neon DB, seed, обучение 30 мин)
- [ ] RU язык, без IT-жаргона в основном тексте
- [ ] `roadmap.md` — ссылка на Phase «Pilot»

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
| 2026-05-26 | PM | Phase 3: T-009…T-014 в очередь; T-010…013 READY (Developer), T-014 READY (PM), T-009 BACKLOG до auth-решения |
| 2026-05-26 | PM | Product Map 3.10: `@role-pm` + `product-map-workflow.md`; T-015 Phase 2 discovery BACKLOG; T-016 iGaming BiJi BACKLOG |

---

## Правила для всех агентов

1. **Старт:** прочитать `orchestration-queue.md` → взять одну задачу `READY` своей роли → поставить `IN_PROGRESS`.
2. **Работа:** использовать `@knowledge-base/*` и правила роли.
3. **Финиш:** статус → `DONE`, заполнить «Итог / PR», при необходимости обновить `knowledge-base/` и `docs/roadmap.md`.
