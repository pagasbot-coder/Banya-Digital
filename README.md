# Banya-Digital ERP

ERP/CRM для премиальных банных комплексов: unit economics, yield management, spa/kitchen sync, FIFO-склад органики.

## Быстрый старт

```powershell
cd d:\curorproject\banya-digital
npm install
npm run dev
```

Откройте http://localhost:3000 → редирект на `/dashboard`.

## Структура

| Папка | Назначение |
|-------|------------|
| `app/(app)/` | Страницы модулей (dashboard, finance, crm, operations) |
| `modules/` | Доменная логика по модулям |
| `components/` | UI (layout, shadcn) |
| `lib/config/` | Реестр модулей |
| `knowledge-base/` | Product brief, architecture (Muster) |
| `.cursor/agents/` | Subagents: muster-pm, muster-developer, muster-ui-ux, muster-qa |

## Muster

Задачи — в `orchestration-queue.md`. Следующие READY:

- **T-002** — схема PostgreSQL (Developer)
- **T-003** — dashboard shell (UI/UX)
- **T-005** — QA foundation

## Команды

```powershell
npm run dev      # разработка
npm run build    # production build
npm run lint     # ESLint
```

## Открыть в Cursor

**File → Open Folder →** `d:\curorproject\banya-digital`

> Папка `D:\Banya-Digital` давала сбой `npm run build` (баг Next.js на этом пути). Рабочий проект — здесь.
