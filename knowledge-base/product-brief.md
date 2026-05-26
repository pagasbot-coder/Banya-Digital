# Product Brief — Banya-Digital ERP

**Премиальный ERP/CRM для банно-спа комплекса:** unit economics, загрузка залов (yield), синхронизация программ и кухни, FIFO-склад органики (сено, пихта).

### Позиционирование (сегмент SPA / банные комплексы)

**Операционный контекст (SME):** `@knowledge-base/industry-brief.md`, `@knowledge-base/operational-processes.md`.

**ICP:** управляющий **одного** премиального или upper-middle банно-SPA комплекса (несколько зон, F&B), у которого запись/касса уже есть (YCLIENTS, 1С, Excel), но нет **дневной маржи по зонам, yield и пульта смены**. Banya-Digital — **операционный B2B-дашборд**, не замена онлайн-записи гостя. **Командный ревью (все роли):** `@knowledge-base/SPA-SEGMENT-TEAM-REVIEW.md`. Детали: `@knowledge-base/segment-spa-banya-analysis.md`, `@knowledge-base/team-proposals-spa-segment.md` (2026-05-26).

---

## Проблема

Операции премиальной бани живут в разрозненных инструментах: финансы — в таблицах и выгрузках, загрузка залов — «на глаз», тайминги мастеров и кухни не синхронизированы, учёт сена и пихты без FIFO и прозрачного COGS. Владелец не видит **маржинальность по залу и услуге в реальном времени**; операции не видят **конфликты слотов** до гостя; склад не получает **ранние алерты** по остаткам органики.

**Следствие:** потери yield, перерасход органики, ручная сводка в конце смены, ошибки в unit economics.

---

## Аудитория

| Роль | Потребность | Первичные модули |
|------|-------------|------------------|
| **Владелец / финдиректор** | P&L, маржа, выручка vs план, unit economics по залам | dashboard, finance |
| **Операционный менеджер** | Загрузка залов, чеклисты смены, spa ↔ kitchen sync, алерты простоя | dashboard, operations |
| **Склад / закупки** | FIFO сено/пихта, остатки, сроки, COGS в финансы | operations/inventory, dashboard (алерты) |
| **Администратор / CRM** | Гости, брони, программы, связь с таймингами | crm, operations/timings |
| **Системный админ** (Phase 1+) | Роли, доступ к модулям | auth (решение отложено) |

---

## MVP (v1) — фичи по модулям

Приоритеты: **P0** — без этого пилот не имеет смысла; **P1** — сразу после P0 в Phase 1–2.

### dashboard

| Фича | Приоритет | Описание |
|------|-----------|----------|
| KPI-сетка (4 метрики) | **P0** | Загрузка залов, выручка за день, маржа %, алерты склада — из БД, не mock |
| Критические алерты | **P0** | Простой зала, FIFO/остатки, задержка kitchen↔SPA — из операций/склада |
| Операции смены (сводка) | **P1** | Yield, сеансы, sync-слоты, чеклисты — агрегаты за текущую смену |
| Сравнение с вчера / планом | **P1** | Delta на KPI (как в mock UI) |

### finance

| Фича | Приоритет | Описание |
|------|-----------|----------|
| RevenueLine / CostLine по `businessDate` | **P0** | Запись выручки и COGS с привязкой к залу/услуге |
| Валовая маржа за день (агрегат) | **P0** | Питает KPI «Маржа» на dashboard |
| Отчёт по залу за период | **P1** | Таблица/простой список: выручка, COGS, маржа % |
| COGS органики через `CostLine.lotId` | **P1** | Связь с FIFO-партией |

### operations

| Фича | Приоритет | Описание |
|------|-----------|----------|
| Справочник залов (`Hall`) | **P0** | База для yield и броней |
| Загрузка залов (yield %) | **P0** | Агрегат для KPI «Загрузка залов» |
| ProgramTiming + KitchenSlot | **P1** | Тайминги spa и слоты кухни, детекция конфликтов |
| ShiftChecklist + ChecklistItem | **P1** | Чеклисты смены, прогресс N/M |
| Алерты простоя / конфликта | **P0** | Источник для блока «Критические алерты» |

### operations/inventory

| Фича | Приоритет | Описание |
|------|-----------|----------|
| InventoryItem + InventoryLot (FIFO) | **P0** | Партии сено/пихта, `quantityLeft` |
| StockMovement IN/OUT | **P0** | Списание по FIFO в сервисном слое |
| Пороговые алерты остатков | **P0** | KPI «Алерты склада», критические уведомления |
| Прогноз исчерпания (дни) | **P1** | Подсказка в алерте (как в mock) |

### crm

| Фича | Приоритет | Описание |
|------|-----------|----------|
| Guest CRUD (базовый) | **P1** | Карточка гостя, контакты |
| Booking + статусы | **P1** | Бронь зала, связь с `SpaProgram` |
| SpaProgram (справочник) | **P1** | Программы для таймингов и выручки |
| Воронка / маркетинг | — | Вне scope v1 |

---

## User stories (v1)

1. **Владелец:** «Как владелец, я открываю dashboard утром и вижу выручку, маржу и загрузку залов за вчера и сегодня из одной системы, без сводных таблиц.»
2. **Владелец:** «Как финдиректор, я вижу валовую маржу % за текущий business day и могу сопоставить её с планом (delta на карточке).»
3. **Операционный менеджер:** «Как ops-менеджер, я вижу критические алерты (простой зала, конфликт тайминга, задержка кухни) в одном списке и могу открыть детали слота/зала.»
4. **Операционный менеджер:** «Как ops-менеджер, я вижу прогресс чеклистов смены (N/M) и загрузку залов (итого) на dashboard в блоке операций смены (цель 60%).»
5. **Склад:** «Как кладовщик, я списываю сено/пихту по FIFO и система показывает алерт, когда остаток ниже нормы и прогноз исчерпания в сменах.»

---

## Метрики успеха (измеримые)

| Метрика | Baseline | Цель v1 (пилот 8 недель) | Как измеряем |
|---------|----------|---------------------------|--------------|
| Время закрытия смены | Таблицы (~45 мин) | **−30%** (≤31 мин) | Хронометраж 5 смен до/после |
| Точность остатков органики | Оценочно ~70% | **≥95%** | Инвентаризация vs система (еженедельно) |
| Видимость маржи по залу | Ручная сводка 1×/нед | **Daily** на dashboard | KPI обновляется при наличии `RevenueLine`/`CostLine` за день |
| Конфликты kitchen ↔ SPA | Не отслеживаются | **0 необработанных** на пилоте | Алерт создан → отмечен resolved в смену |
| Dashboard data freshness | Mock | **100% KPI из PostgreSQL** | QA: нет импорта из `mock-kpis` на prod path |

---

## Phase 2 (post-pilot) — гипотезы из Product Map 3.10

> Уточнить с Architect после T-014 (пилот 8 нед). Источник: PDF Product Map 3.10 + TASK Delivery/Analysis.

**In (кандидаты P1→P0):**

- Auth + роли (owner, ops, warehouse, crm) — тема Delivery / Stakeholder Analysis
- Finance: отчёт по залу за период, углубление unit economics (Unit Economics Improvements)
- CRM: полный CRUD + конфликты слотов (Backlog / Prioritization)
- Operations: kitchen↔SPA sync в UI, чеклисты с ответственными
- Inventory: прогноз исчерпания, закупки (лёгкий контур)
- Product analytics: воронка пилота, dashboard без ручного refresh (Application Metrics)

**Out (пока):**

- Мультифилиальность, guest mobile app, AI pricing, GTM/Growth Hacking
- Monetization & Pricing как отдельный SaaS-модуль (margin по залу уже в finance)
- Web3, performance marketing, полная бухгалтерия

**Pilot success (напоминание):** метрики в таблице выше; stop criteria — в `docs/pilot-reglement.md` (T-014).

---

## Вне scope (v1)

- Полная бухгалтерия, НДС, 1С / банк-интеграция
- Мобильное приложение для гостей и онлайн-оплата
- AI-прогноз спроса и динамическое ценообразование
- Мультифилиальность (один комплекс = один tenant)
- Полноценный RBAC (до решения по auth — см. roadmap Phase 1)
- Реализация всех P1-фич CRM и kitchen sync **до** P0 dashboard + finance aggregates + FIFO alerts

---

## Acceptance criteria — Dashboard live data (задача T-006)

**Цель:** заменить `modules/dashboard/mock-kpis.ts` на серверные агрегаты из PostgreSQL с seed-данными для демо/QA.

### P0 — KPI grid

- [ ] При заданном `DATABASE_URL`: `npm run db:push` (или migrate) + `npm run db:seed` наполняет минимум: 4 зала, выручка/COGS за **сегодня** и **вчера**, 2+ `InventoryLot` с порогом, 1+ конфликтный/критичный сценарий для алертов
- [ ] `hall_load`: % средней загрузки активных залов за business day (из броней / capacity — формула задокументирована в `modules/dashboard/services/`)
- [ ] `daily_revenue`: сумма `RevenueLine` за `businessDate = today`
- [ ] `margin`: `(revenue − cost) / revenue × 100` за today из `RevenueLine` + `CostLine`
- [ ] `inventory_alerts`: count лотов ниже `minThreshold` или срок &lt; N дней
- [ ] Delta KPI: сравнение с **вчера** (или планом, если seed содержит plan) — тренд `up`/`down`/`neutral` как в UI
- [ ] Dashboard page **не импортирует** `mock-kpis` для KPI grid в production path (mock допустим только в Storybook/tests, если появятся)

### P0 — Critical alerts

- [ ] Минимум 3 типа алертов из данных: (1) простой/конфликт зала, (2) низкий остаток FIFO, (3) задержка kitchen↔SPA
- [ ] Сортировка: high severity first; поля `title`, `description`, `timeLabel` (относительное время от `updatedAt`)

### P1 — Today operations block

- [ ] Строки yield, kitchen-sync, checklists — из БД или помечены stub с TODO в коде (если P1 отложен — явно в PR)

### Definition of Done (T-006)

- [ ] `npm run build` / `npm run lint` exit 0
- [ ] QA checklist: пункт «KPI из БД» отмечен
- [ ] README или `knowledge-base/qa-checklist.md`: команды seed + пример `DATABASE_URL`
- [ ] Без `DATABASE_URL` — graceful empty state или dev-only banner (не падать SSR)

### Out of scope (T-006)

- Auth и row-level security
- Редактирование данных из dashboard
- Real-time WebSocket (достаточно SSR + revalidate on navigation)

---

## Референсы / ссылки

- `@knowledge-base/product-map-workflow.md` — discovery log, layer→repo
- `@knowledge-base/product-map-notes-from-pdf.md` — структура Product Map 3.10 (PDF Human)
- `@knowledge-base/architecture.md` — модули, Prisma-модели, FIFO и unit economics
- `@knowledge-base/design-tokens.md` — layout dashboard, KPI ids
- `@modules/dashboard/mock-kpis.ts` — контракт UI до T-006
- `@docs/roadmap.md` — фазы внедрения
- `@orchestration-queue.md` — T-006 Developer
