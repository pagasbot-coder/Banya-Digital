# Banya-Digital ERP

ERP/CRM для премиальных банных комплексов: unit economics, yield management, spa/kitchen sync, FIFO-склад органики.

> **Статус (2026-05-30):** проект **ON HOLD**. Prod demo: https://banya-digital.vercel.app · Resume: [`docs/hold-status.md`](docs/hold-status.md)

## Быстрый старт

```powershell
cd d:\curorproject\banya-digital
npm install
npm run dev
```

Откройте http://localhost:3000 → редирект на `/dashboard`.

## База данных (PostgreSQL)

### Локально через Docker

```powershell
docker compose up -d
copy .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Параметры контейнера (`docker-compose.yml`):

| Параметр | Значение |
|----------|----------|
| User | `banya` |
| Password | `banya` |
| Database | `banya_digital` |
| Port | `5432` |

`DATABASE_URL` в `.env.example`:

```
postgresql://banya:banya@localhost:5432/banya_digital?schema=public
```

### Seed (демо-данные)

`npm run db:seed` наполняет fictional demo: 4 зала (Парная, VIP, Сеновал, Хамам), гости, брони, spa/kitchen слоты (1 конфликт), FIFO-склад сена/пихты, выручка/COGS за сегодня и вчера, чеклисты смены.

Dashboard читает KPI из PostgreSQL. Без БД — empty state с подсказкой `npm run db:push && npm run db:seed`.

## Структура

| Папка | Назначение |
|-------|------------|
| `app/(app)/` | Страницы модулей (dashboard, finance, crm, operations) |
| `modules/` | Доменная логика по модулям |
| `components/` | UI (layout, shadcn) |
| `lib/db/` | Prisma client |
| `prisma/` | Schema + seed |
| `knowledge-base/` | Product brief, architecture (Muster) |
| `.cursor/agents/` | Subagents: muster-pm, muster-developer, muster-ui-ux, muster-qa |

## Muster

Задачи — в `orchestration-queue.md`.

## Команды

```powershell
npm run dev         # разработка
npm run build       # production build
npm run lint        # ESLint
npm run db:push     # применить schema к БД
npm run db:seed     # demo seed
npm run db:studio   # Prisma Studio
```

## Deploy to Vercel

1. Репозиторий на GitHub (см. [`docs/GITHUB-DEPLOY.md`](docs/GITHUB-DEPLOY.md)).
2. Импорт проекта в [Vercel](https://vercel.com/new) или `vercel --prod`.
3. В **Environment Variables** задать:

| Переменная | Описание |
|------------|----------|
| `DATABASE_URL` | PostgreSQL (Neon, Supabase, Vercel Postgres) — та же строка, что в `.env` локально |
| `NEXT_PUBLIC_APP_URL` | Production URL Vercel (после первого деплоя) |

4. Build: `npm run build` (в `vercel.json` уже указано).
5. После первого деплоя один раз: `npm run db:push` и `npm run db:seed` с prod `DATABASE_URL`.
6. Добавить `NEXT_PUBLIC_APP_URL` в Vercel и сделать redeploy.

Подробные шаги GitHub + Vercel CLI: [`docs/GITHUB-DEPLOY.md`](docs/GITHUB-DEPLOY.md).

## Маршруты (локально)

| URL | Модуль |
|-----|--------|
| http://localhost:3000/dashboard | Сводка KPI |
| http://localhost:3000/finance | Unit economics по залам |
| http://localhost:3000/crm | Гости и брони |
| http://localhost:3000/operations | Spa/кухня и чеклисты |

## Открыть в Cursor

**File → Open Folder →** `d:\curorproject\banya-digital`

> Папка `D:\Banya-Digital` давала сбой `npm run build` (баг Next.js на этом пути). Рабочий проект — здесь.
