# Architecture — Banya-Digital ERP

## Принцип

**Модульный монолит:** один Next.js-процесс, логика разделена по `modules/`, UI — по `app/(app)/`.  
Новые фичи добавляются в свой модуль без переписывания соседей.

## Слои

```
app/(app)/          → маршруты и страницы (тонкий слой)
components/         → UI (layout, shadcn/ui)
modules/            → доменная логика, типы, будущие services
lib/                → общие утилиты, config
knowledge-base/     → спеки Muster (не runtime)
```

## Модули

| Модуль | Путь UI | Папка | Назначение |
|--------|---------|-------|------------|
| dashboard | `/dashboard` | `modules/dashboard/` | KPI, сводки |
| finance | `/finance` | `modules/finance/` | Unit economics |
| crm | `/crm` | `modules/crm/` | Гости, брони |
| operations | `/operations` | `modules/operations/` | Yield, чеклисты, тайминги, FIFO |

### Operations (подмодули)

- `operations/checklists/` — чеклисты смен
- `operations/timings/` — spa + kitchen sync
- `operations/inventory/` — FIFO органика (hay, fir)

## Расширение (Phase 1+)

1. **T-002:** `lib/db/` + Prisma/Drizzle + PostgreSQL
2. Каждый модуль получает `modules/<name>/services/` и API routes `app/api/<name>/`
3. Auth: middleware + роли (owner, ops, warehouse)
4. Dashboard читает агрегаты из finance + operations

## Конфиг

- `lib/config/modules.ts` — реестр модулей для nav и feature flags
- `.env.example` — DATABASE_URL и пр.
