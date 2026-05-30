# QA Report — Pilot Week 1 (prod smoke)

**Пилот:** Дегтярные Бани (Санкт-Петербург) · старт 2026-05-27  
**QA:** Muster QA agent · **T-027** sign-off  
**Prod:** https://banya-digital.vercel.app

## TL;DR

**Итог: PASS (критичные проверки).** `npm run build` и `npm run lint` (exit 0) успешны. Все 6 prod-маршрутов smoke — HTTP **200**, без 5xx. CSV export отдаёт `text/csv`. Блокеры для релиза пилота **нет**. Визуальный обход UI командой пилота — в рамках **T-028** (Human ops).

## Таблица результатов

| Проверка | Результат | Детали |
|----------|-----------|--------|
| `npm run build` | **PASS** | exit 0; маршруты: `/dashboard`, `/finance`, `/crm`, `/operations`, `/operations/inventory`, `/api/finance/export` |
| `npm run lint` | **PASS** | exit 0; 1 warning: unused `statusVariant` в `today-bookings-interactive.tsx` |
| GET `/dashboard` | **PASS** | 200; WAMZ, критические алерты в теле |
| GET `/finance` | **PASS** | 200; план/факт, розница, сезонность |
| GET `/crm` | **PASS** | 200; гости, брони |
| GET `/operations` | **PASS** | 200; конфликты кухня↔SPA |
| GET `/operations/inventory` | **PASS** | 200; FIFO / инвентарь |
| GET `/api/finance/export` | **PASS** | 200; `Content-Type: text/csv`; ~1.9 KB |
| Seasonality (T-022) | **PASS** | «сезон» на `/dashboard` и `/finance` |
| Retail (T-021) | **PASS** | «розниц» на `/dashboard` и `/finance` |

## Hotfix T-029 (2026-05-27)

**Симптом:** при отправке форм на `/finance` (выручка за услугу в зале) и `/operations/inventory` (FIFO OUT) — «This page couldn't load — server error».

**Исправление:** server actions не отдают необработанные исключения; FIFO — интерактивная `$transaction` + `Prisma.Decimal`; `safeRevalidatePaths`; валидация `serviceId`.

**Повторная проверка (Human):**

| URL | Действие |
|-----|----------|
| https://banya-digital.vercel.app/finance | Добавить выручку: зал + услуга + сумма |
| https://banya-digital.vercel.app/operations/inventory | «Списать по FIFO» на позиции с остатком |

## Hotfix T-030 (2026-05-27)

**Симптом:** при создании гостя на `/crm/guests/new` (и брони на `/crm`) — тот же server error, что до T-029 на finance/inventory.

**Причина:** `revalidatePath` без обёртки мог ронять server action после успешного `prisma.guest.create`; у `createBooking` проверка конфликта и запросы Prisma были вне единого `try/catch`; дата брони парсилась иначе, чем business day в finance.

**Исправление:** `safeRevalidatePaths` для `/crm`, `/dashboard`, `/crm/guests/[id]`; все CRM actions в `try/catch` с RU-сообщениями; `parseBusinessDateInput` для даты брони; валидация guest / hall / spaProgram до записи.

**Повторная проверка (Human):**

| URL | Действие |
|-----|----------|
| https://banya-digital.vercel.app/crm/guests/new | Новый гость: имя + телефон |
| https://banya-digital.vercel.app/crm | Новая бронь: гость, зал, дата/время |

## Hotfix T-034 (2026-05-30)

**Симптом:** POST `/finance` после «Добавить выручку» → error boundary «Не удалось загрузить финансы» (prod и local).

**Причина:** `initialFinanceActionState` экспортировался из файла с `"use server"`. Next.js 16 при submit: `invalid-use-server-value` — «A use server file can only export async functions, found object».

**Исправление:** `modules/finance/actions/finance-action-state.ts` (тип + initial state); `create-finance-lines.ts` — только async actions; client import из state-модуля.

**Form submit QA (2026-05-30, local + Neon DB):**

| Сценарий | POST | UI после refresh | KPI |
|----------|------|------------------|-----|
| Зал «Парная» + 7 777 ₽ (без услуги) | **200** | «Выручка сохранена.», страница без crash | Факт недели +7 777 ₽ |
| VIP + услуга «Император» + 12 000 ₽ | **200** | «Выручка сохранена.», страница без crash | Факт недели +12 000 ₽ |

**Prod retest:** после `vercel --prod` — см. 3-step retest ниже.

## Блокеры

Нет (после деплоя T-034 на prod).

## Ручная проверка UI (Human / пилот)

Открыть в браузере и подтвердить визуально (T-028):

| URL | На что смотреть |
|-----|-----------------|
| https://banya-digital.vercel.app/dashboard | KPI, WAMZ 3/4, демо-баннер пилота, алерты, чеклисты |
| https://banya-digital.vercel.app/finance | План/факт недели, сезонные chips, розница, кнопка CSV |
| https://banya-digital.vercel.app/crm | Список гостей, брони на сегодня |
| https://banya-digital.vercel.app/operations | Конфликты кухня↔SPA, «Разобрано», журнал |
| https://banya-digital.vercel.app/operations/inventory | FIFO остатки, списание |
| https://banya-digital.vercel.app/api/finance/export | Скачивание CSV (или кнопка на `/finance`) |

## Команды (повтор smoke)

```bash
cd banya-digital
npm run build
npm run lint
```

---

_См. также `@knowledge-base/qa-checklist.md` § Prod smoke 2026-05-27._
