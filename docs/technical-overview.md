# Технический обзор — Banya-Digital ERP

Документ для разработчиков и технических специалистов. Кратко описывает стек, структуру кода, базу данных и команды запуска.

---

## Стек

| Слой | Технология |
|------|------------|
| Frontend | **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS v4**, **shadcn/ui** |
| Backend | Next.js Server Components, серверные сервисы в `modules/` (API routes — по мере роста) |
| База данных | **PostgreSQL** (локально Docker, прод — **Neon** или Supabase) |
| ORM | **Prisma 7** (`@prisma/adapter-pg`, драйвер `pg`) |
| Деплой (план) | Vercel |

Подробнее по соглашениям: `docs/tech-stack.md`.

---

## Архитектура модулей

Проект — **модульный монолит**: один процесс Next.js, домены разделены по папкам.

```
app/(app)/          → маршруты: /dashboard, /finance, /crm, /operations
components/         → UI (shell, dashboard-секции, shadcn/ui)
modules/            → доменная логика: dashboard, finance, crm, operations
lib/                → db-клиент, config/modules.ts, utils
prisma/             → schema.prisma, seed.ts
knowledge-base/     → спеки Muster (не в runtime)
```

| Модуль | URL | Папка | Назначение |
|--------|-----|-------|------------|
| **dashboard** | `/dashboard` | `modules/dashboard/` | KPI из БД: загрузка залов, выручка, маржа, алерты, чеклисты смены |
| **finance** | `/finance` | `modules/finance/` | `getFinanceData()` — RevenueLine + CostLine (COGS) по залам за сегодня |
| **crm** | `/crm` | `modules/crm/` | `getCrmData()` — Guest + Booking на сегодня |
| **operations** | `/operations` | `modules/operations/` | `getOperationsData()` — ProgramTiming, KitchenSlot, сводка чеклистов |

Реестр навигации: `lib/config/modules.ts` → `APP_MODULES`.

**Расширенная архитектура** (слои, ER, FIFO, unit economics): см. [`knowledge-base/architecture.md`](../knowledge-base/architecture.md).

---

## База данных

**Источник истины:** `prisma/schema.prisma`.  
**Клиент:** `lib/db/index.ts` (singleton Prisma + adapter-pg).

### 14 моделей (сводка)

| Домен | Модели | Назначение |
|-------|--------|------------|
| Core | `Hall`, `Service` | Залы/зоны, услуги и товары |
| CRM | `Guest`, `Booking`, `SpaProgram` | Гости, брони, шаблоны программ |
| Operations | `ProgramTiming`, `KitchenSlot` | Тайминги spa и слоты кухни |
| Operations | `ShiftChecklist`, `ChecklistItem` | Чеклисты смен (N/M выполнено) |
| Inventory | `InventoryItem`, `InventoryLot`, `StockMovement` | FIFO органика (сено, пихта) |
| Finance | `RevenueLine`, `CostLine` | Выручка и затраты (COGS и др.) по `businessDate` |

### Seed

- Скрипт: `prisma/seed.ts`
- Команда: `npm run db:seed`
- Демо: 4 зала, гости/брони, конфликт kitchen↔SPA, FIFO с порогами, выручка/COGS за **сегодня** и **вчера**, чеклисты с отметками выполнения
- Повторный запуск очищает demo-данные и пересоздаёт их (`clearDemoData`)

### Переменные окружения

1. Скопировать `.env.example` → `.env`
2. Задать `DATABASE_URL` (локально — из docker-compose, облако — строка Neon)

Пример локально:

```env
DATABASE_URL="postgresql://banya:banya@localhost:5432/banya_digital?schema=public"
```

**Не коммитить** файл `.env` в git.

### Первичная настройка БД

```powershell
docker compose up -d          # локальный PostgreSQL
copy .env.example .env
npm run db:push               # применить схему (без миграций — для dev)
npm run db:seed               # демо-данные
```

Альтернатива с миграциями: `npm run db:migrate`.

---

## Команды

| Команда | Действие |
|---------|----------|
| `npm run dev` | Dev-сервер Next.js (http://localhost:3000) |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Запуск production-сборки |
| `npm run lint` | ESLint |
| `npm run db:generate` | Генерация Prisma Client |
| `npm run db:push` | Синхронизация схемы с БД (dev) |
| `npm run db:seed` | Заполнение демо-данными |
| `npm run db:migrate` | Миграции Prisma (dev) |
| `npm run db:studio` | Prisma Studio (просмотр таблиц) |

---

## Модули (реализация)

| Модуль | Сервис | UI |
|--------|--------|-----|
| dashboard | `get-dashboard-data.ts` | `components/dashboard/*` |
| finance | `get-finance-data.ts` | `components/finance/hall-economics-section.tsx` |
| crm | `get-crm-data.ts` | `components/crm/*` |
| operations | `get-operations-data.ts` | `components/operations/*` |

Общие утилиты: `lib/date-utils.ts`, `lib/format-money.ts`.  
Без `DATABASE_URL`: graceful empty state на каждой странице.

## Деплой

- `vercel.json` — Next.js 16, `npm run build`
- Переменная окружения: `DATABASE_URL` (Neon / Supabase / Vercel Postgres)
- Ручные шаги GitHub + Vercel: [`docs/GITHUB-DEPLOY.md`](GITHUB-DEPLOY.md)

---

## Muster и документация

- Очередь задач: `orchestration-queue.md`
- Продукт и метрики: `knowledge-base/product-brief.md`
- Дизайн: `knowledge-base/design-tokens.md`
- Дорожная карта: `docs/roadmap.md`

---

## Ссылки

- [Архитектура (детально)](../knowledge-base/architecture.md)
- [Product brief](../knowledge-base/product-brief.md)
- [README — быстрый старт](../README.md)
