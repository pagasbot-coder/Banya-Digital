# Banya-Digital ERP

ERP/CRM для премиальных банных комплексов: unit economics, yield management, spa/kitchen sync, FIFO-склад органики.

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

## Открыть в Cursor

**File → Open Folder →** `d:\curorproject\banya-digital`

> Папка `D:\Banya-Digital` давала сбой `npm run build` (баг Next.js на этом пути). Рабочий проект — здесь.
