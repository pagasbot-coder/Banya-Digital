# Server Actions — реестр точек мутации

_Для QA и регрессии. Обновлено: T-035 (2026-05-30)._

Все actions возвращают `{ ok: boolean; message: string }` (RU) и используют `safeRevalidatePaths` из `lib/safe-revalidate.ts`.

**Next.js 16:** файлы с `"use server"` экспортируют **только async functions**. Начальное состояние `useActionState` — в отдельных модулях: `finance-action-state.ts`, `crm-action-state.ts`, `fifo-action-state.ts`.

## Состояние форм (не "use server")

| Модуль | Файл |
|--------|------|
| Finance | `modules/finance/actions/finance-action-state.ts` |
| CRM | `modules/crm/actions/crm-action-state.ts` |
| FIFO OUT | `modules/operations/inventory/actions/fifo-action-state.ts` |

## Finance (`modules/finance/actions/create-finance-lines.ts`)

| Action | Триггер UI | Revalidate | Особенности |
|--------|------------|------------|-------------|
| `createRevenueLine` | `/finance` → форма «Выручка» | `/finance`, `/dashboard` | `parseBusinessDateInput`, `Prisma.Decimal` |
| `createCostLine` | `/finance` → форма «COGS» | `/finance`, `/dashboard` | `parseBusinessDateInput`, `Prisma.Decimal`, опц. hall/lot |

## CRM (`modules/crm/actions/crm-actions.ts`)

| Action | Триггер UI | Revalidate | Особенности |
|--------|------------|------------|-------------|
| `createGuest` | `/crm/guests/new` | `/crm`, `/dashboard`, `/crm/guests/[id]` | валидация имени ≥2 |
| `updateGuest` | `/crm/guests/[id]` | `/crm`, `/dashboard`, `/crm/guests/[id]` | |
| `createBooking` | `/crm` → форма брони | `/crm`, `/dashboard` | `parseBusinessDateInput`, conflict check |
| `updateBooking` | `/crm` → редактирование | `/crm`, `/dashboard` | conflict check |
| `updateBookingStatus` | `/crm` → select статуса | `/crm`, `/dashboard` | быстрый статус из таблицы |

## Operations — склад (`modules/operations/inventory/actions/fifo-out-action.ts`)

| Action | Триггер UI | Revalidate | Особенности |
|--------|------------|------------|-------------|
| `performFifoOut` | `/operations/inventory` → FIFO OUT | `/operations/inventory`, `/dashboard`, `/finance` | `$transaction` в `fifoStockOut`, `Prisma.Decimal` qty |

## Operations — смена (`modules/operations/actions/`)

| Action | Файл | Триггер UI | Revalidate |
|--------|------|------------|------------|
| `toggleChecklistItem` | `toggle-checklist-item.ts` | `/dashboard` → чеклист N/M | `/dashboard`, `/operations` |
| `resolveKitchenConflict` | `resolve-kitchen-conflict.ts` | `/operations` → «Разобрано» | `/operations`, `/dashboard` |

## Команда быстрой проверки

```bash
npm run build
# E2E submit-сценарии: knowledge-base/qa-checklist.md § E2E формы
```
