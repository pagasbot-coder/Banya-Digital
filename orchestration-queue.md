# Orchestration Queue (Muster)

> **Источник истины для задач.** PM добавляет задачи; роли берут `READY` → `IN_PROGRESS` → `DONE`.  
> Перед любой работой агент **читает этот файл**; после завершения — **обновляет статус и краткий итог**.

**Проект:** Banya-Digital ERP  
**Архитектор (Human):** _ваше имя_  
**Последнее обновление:** 2026-05-26 (пилот P0 D.1: T-011…014, T-017 DONE; T-018+ READY wave 2)

---

## Как пользоваться (Cursor 3)

| Роль | Subagent | Чат в Agents Window | Правило |
|------|----------|---------------------|---------|
| PM | `muster-pm` | «Role: PM» | `@role-pm` |
| Developer | `muster-developer` | «Role: Developer» | `@role-developer` |
| UI/UX | `muster-ui-ux` | «Role: UI/UX» | `@role-ui-ux` |
| QA | `muster-qa` | «Role: QA» | `@role-qa` |
| Growth / CMO | `muster-growth-marketer` | «Role: CMO» / «Role: Growth» / «Роль: Директор по маркетингу» | `@role-growth-marketer` |
| SME | `muster-sme` | «Role: SME» / «Role: Business Consultant» / «Роль: Прожжённый отраслевой бизнес-консультант» / «Role: Industry Expert» | `@role-sme` |

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
| T-009 | Auth: Auth.js v5 staff sessions + middleware | Developer | DONE | P1 | T-006 | `@knowledge-base/architecture-decisions.md` ADR-001 | Auth.js + Prisma; roles owner/ops/admin/warehouse; `/login`; seed @demo.local; build OK |
| T-010 | CRM: CRUD гостя + создание/редактирование брони | Developer | DONE | P1 | T-006 | `@knowledge-base/product-brief.md`, `modules/crm/` | `/crm` CRUD guests+bookings; `/crm/guests/*`; conflict check; WAMZ on dashboard; build OK |
| T-011 | Finance: ввод RevenueLine / CostLine за business day | Developer | DONE | P0 | T-006 | `@knowledge-base/product-brief.md`, `modules/finance/` | Формы на `/finance`, server actions, revalidate dashboard |
| T-012 | Inventory: FIFO UI (лоты, движения, пороги) | Developer | DONE | P0 | T-006, T-002 | `@knowledge-base/architecture.md`, `modules/operations/inventory/` | `/operations/inventory`: партии, история, FIFO OUT; алерты на dashboard |
| T-013 | Operations: чеклисты смены (прогресс N/M, отметки) | Developer | DONE | P1 | T-006, T-003 | `@knowledge-base/product-brief.md`, `modules/operations/` | Toggle на `/dashboard`, N/M из БД, touch ≥44px |
| T-014 | Pilot: регламент 8-недельного пилота (RU) | PM | DONE | P1 | T-008 | `@docs/management-overview.md`, `@knowledge-base/product-brief.md` | `docs/pilot-reglement.md` + ссылка в management-overview |
| T-015 | Product Map: Phase 2 discovery → brief + roadmap | PM | BACKLOG | P2 | T-014 | `@knowledge-base/product-map-workflow.md`, `@knowledge-base/product-map-3.10-cheatsheet.md`, `@knowledge-base/product-map-notes-from-pdf.md` | KB 2026-05-26: cheatsheet+role-pm mandatory; PDF visual (notes+web) |
| T-016 | iGaming BiJi: Product Map onboarding (новый продукт) | PM | BACKLOG | P2 | — | `@knowledge-base/product-map-workflow.md` (шаблон), `@role-pm` | |
| T-017 | SME: операционный brief бани (day-in-life, KPI, anti-features) | SME | DONE | P1 | — | `@knowledge-base/industry-brief.md`, `@knowledge-base/operational-processes.md` | Brief + processes из SPA team review § SME |
| T-018 | Resolve kitchen↔SPA conflict + audit log | Developer | READY | P1 | T-006, T-011…013 | `@knowledge-base/SPA-SEGMENT-TEAM-REVIEW.md` D.2 | Wave 2 — после Human sign-off ч. C |
| T-019 | Plan/fact неделя на dashboard | Developer | READY | P1 | T-011 | `@knowledge-base/product-brief.md` | |
| T-020 | Hall zone types + seed urban SPA | Developer | READY | P2 | T-006 | `@knowledge-base/segment-spa-banya-analysis.md` | |
| T-021 | Retail COGS PRODUCT line | Developer | BACKLOG | P2 | T-012 | `@knowledge-base/product-brief.md` | |
| T-022 | Seasonality calendar | PM | BACKLOG | P2 | T-019 | — | |
| T-023 | Export CSV / 1С | Developer | BLOCKED | P2 | Architect ADR | — | |
| T-024 | YCLIENTS import | Developer | BLOCKED | P2 | T-010, T-009 | — | |
| T-025 | Обновить ICP в brief post-SME | PM | READY | P1 | T-017 | `@knowledge-base/industry-brief.md`, `product-brief.md` | **PARTIAL:** ICP premium-banya + WAMZ NSM (Human 2026-05-25); сверка industry-brief |

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

**Роль:** Developer | **Статус:** DONE (Human Architect 2026-05-25)

**Given/When/Then:**
- **Given** Auth.js Credentials, **When** неавторизованный staff открывает `/finance`, **Then** редирект на `/login`.
- **Given** роль `ops`, **When** входит и открывает `/dashboard`, **Then** видит сводку (finance write RBAC — backlog).

**Checklist:**
- [x] ADR-001 `architecture-decisions.md`; `architecture.md` обновлён
- [x] `.env.example`: `AUTH_SECRET`, `AUTH_URL`, `DEMO_STAFF_PASSWORD`
- [x] 4 роли в seed: owner, ops, admin, warehouse @demo.local
- [x] `npm run build` / lint OK

**Notes:** YCLIENTS (T-024) — отдельный sprint, остаётся BLOCKED. Module-level RBAC — после T-009.

---

### T-010 — CRM CRUD

**Acceptance criteria:**
- [x] `/crm` — кнопка «Добавить гостя»; форма: имя, телефон, email (опционально); сохранение в `Guest`
- [x] Карточка `/crm/guests/[id]` — просмотр и редактирование контактов
- [x] Создание брони на зал: дата/время, зал, статус RU; связь с `Hall` / `SpaProgram` где применимо
- [x] Валидация конфликта слота (базовая: пересечение по залу) — сообщение RU
- [x] RU UI, shadcn Form + Table; `npm run build` OK

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
- [x] PM KB: `product-map-3.10-cheatsheet.md`, `@role-pm` Product Map gate (2026-05-26)
- [x] PDF / web: `product-map-notes-from-pdf.md` + workflow sessions 2026-05-25–26 (PDF — визуальный, TASK+site)
- [ ] Пройден discovery checklist из `@role-pm` (Strategy → People) **с Human** (ICP, North Star, Phase 2 sign-off)
- [x] `product-brief.md` — Phase 2 in/out (гипотезы)
- [ ] `docs/roadmap.md` — Now/Next/Later после пилота
- [x] `product-map-workflow.md`: сессия, mapping, open questions
- [ ] Новые epics разбиты на `T-0xx` с DoR; приоритеты P0/P1 согласованы с метриками пилота
- [x] «Журнал» — запись 2026-05-26 (PDF)

**Notes:** Использовать Figma 3.10 / productmap.io только как референс; артефакты — в git. Не логиниться в app.productmap.io. **Partial DONE** 2026-05-26 — ждёт T-014 + ответы Architect по open questions.

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

### T-017 — SME: операционный brief бани

**Роль:** SME | **Статус:** BACKLOG

**Acceptance criteria:**
- [ ] `knowledge-base/industry-brief.md` заполнен по `@knowledge-base/industry-brief-template.md` (day-in-life, hidden pains, daily KPIs, anti-features, glossary)
- [ ] `knowledge-base/operational-processes.md` — процессы смены, брони, закрытия кассы
- [ ] `product-brief.md` § проблемы/персоны обновлены с handoff для PM
- [ ] Top-5 MUST KPI на первом экране дашборда явно перечислены
- [ ] Критика минимум 2 текущих гипотез PM/CMO (если есть в brief)

**Notes:** SME идёт **до** раздувания backlog Phase 3+. Human может перевести в `READY` когда нужен operational discovery.

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
| 2026-05-26 | PM | Product Map 3.10 KB: cheatsheet RU, workflow (PDF blocker), `@role-pm` mandatory layers + gate, `muster-pm`; T-015 partial discovery |
| 2026-05-26 | PM | Product Map 3.10: `@role-pm` + `product-map-workflow.md`; T-015 Phase 2 discovery BACKLOG; T-016 iGaming BiJi BACKLOG |
| 2026-05-26 | PM | T-015 partial: PDF `The Product Map 3.10.pdf` → `product-map-notes-from-pdf.md`, workflow session 2026-05-25, `product-brief` Phase 2; T-015 остаётся BACKLOG до Human/Architect (ICP, NSM, roadmap N/N/L) |
| 2026-05-26 | SME | T-017 BACKLOG: операционный brief бани; `@role-sme` + industry-brief-template |
| 2026-05-26 | PM | Сегмент SPA/бани: `knowledge-base/segment-spa-banya-analysis.md`; ICP/позиционирование в `product-brief.md`; кандидаты T-018…T-025 (ожидают sign-off Human) |
| 2026-05-26 | Developer | D.1 P0: T-011 finance forms, T-012 inventory FIFO UI, T-013 checklist toggle; T-014/T-017 docs; T-018…T-025 в queue; build OK |
| 2026-05-26 | Developer | T-009 DONE: Auth.js v5 staff auth, middleware, seed, ADR-001 |
| 2026-05-25 | Human Architect | T-009 Auth.js APPROVED; T-018+ wave 2; T-017 ACCEPTED → T-025 |
| 2026-05-25 | Human Architect | Часть C: ICP **A** премиум-баня; North Star **WAMZ** (Weekly Active Managed Zones) |
| 2026-05-26 | PM | T-025 PARTIAL: `product-brief` ICP+WAMZ; `SPA-SEGMENT-TEAM-REVIEW` ч.C; `pilot-reglement`; workflow ICP/NSM closed |

### D.3 — владение задачами (после SPA team review)

| Роль | Task IDs |
|------|----------|
| **Human Architect** | Часть C ✅; T-023 ADR |
| **SME** | T-017 ✅; правки `industry-brief.md` |
| **CMO** | `marketing-brief.md` (черновик из § CMO) |
| **PM** | T-014 ✅; T-025 READY; T-022; journal queue |
| **IT-Architect** | Analytics ADR; unblock T-023 |
| **UI/UX** | White-label «Термы» backlog post-E1 |
| **Developer** | T-009 ✅; T-010, T-018 READY; T-019, T-020 READY; **T-024 BLOCKED** (YCLIENTS — не в этом спринте) |
| **QA** | Регресс T-006 + pilot UAT `qa-checklist.md` |
| **DevOps** | `devops-runbook.md`; health + backup пилота |

---

## Правила для всех агентов

1. **Старт:** прочитать `orchestration-queue.md` → взять одну задачу `READY` своей роли → поставить `IN_PROGRESS`.
2. **Работа:** использовать `@knowledge-base/*` и правила роли.
3. **Финиш:** статус → `DONE`, заполнить «Итог / PR», при необходимости обновить `knowledge-base/` и `docs/roadmap.md`.
