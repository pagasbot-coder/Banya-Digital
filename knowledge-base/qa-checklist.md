# QA Checklist — Banya-Digital ERP

_Ведёт QA (@role-qa). Обновлено: T-005 foundation pass (2026-05-24)._

## Перед каждым PR

- [x] `npm run build` без ошибок (включает `prisma generate`)
- [x] `npm run lint` без ошибок
- [x] Нет секретов в коде (`.env*` в `.gitignore`, есть `.env.example`)
- [ ] Критерии из `orchestration-queue.md` для задачи выполнены _(проверять per-task)_

## Foundation (T-001 / T-002 / T-003) — T-005

- [x] `npm run db:generate` — Prisma Client генерируется без ошибок
- [x] Маршруты отвечают: `/` → redirect `/dashboard`; `/dashboard`, `/finance`, `/crm`, `/operations` → HTTP 200
- [x] Dashboard: KPI grid (live PostgreSQL при seed; empty state без БД)
- [x] Dashboard: блок «Критические алерты» (из БД: timing conflict, inventory, kitchen)
- [x] Dashboard: блок «Операции сегодня» (yield, kitchen-sync, checklists из БД)
- [x] App shell: sidebar + навигация по модулям

## T-018 — Kitchen↔SPA conflict resolve (2026-05-27)

- [ ] `/operations`: блок «Конфликты кухня ↔ SPA» показывает seed-конфликт (после `db:seed`)
- [ ] Кнопка **Разобрано** снимает конфликт; слот в «Журнал разборов» (resolvedBy, resolvedAt RU)
- [ ] `/dashboard`: критический алерт kitchen исчезает после разбора; KPI kitchen-sync обновляется
- [ ] Повторный клик «Разобрано» — сообщение об ошибке (уже разобран)
- [ ] `npm run build` exit 0 после schema `resolvedAt` / `resolvedBy`

## Регрессия (MVP) — pending

- [ ] Auth / защищённые маршруты
- [x] KPI из БД (не mock) — T-006: `db:seed` + `DATABASE_URL`, см. README
- [ ] Нет `console.error` на happy path в production build _(dev: hydration warning от Cursor browser refs — не блокер приложения)_

## Prod smoke 2026-05-27 (pilot readiness)

**Среда:** `npm run build` exit 0 (Next.js 16.2.6, routes compiled).  
**Prod base:** https://banya-digital.vercel.app · `DEMO_SKIP_AUTH` не менялся (default skip login).

| Маршрут / фича | Build compile | Prod smoke (QA 2026-05-27) |
|----------------|---------------|------------------------------|
| `/dashboard` — KPI, WAMZ, алерты, чеклисты | [x] | [x] HTTP 200; WAMZ, «Критические» в HTML |
| `/finance` — формы, план/факт, розница | [x] | [x] HTTP 200; план/факт, розница в HTML |
| `/crm` — гости, брони | [x] | [x] HTTP 200; гости/брони в HTML |
| `/operations` — конфликты, audit | [x] | [x] HTTP 200; конфликты, кухня в HTML |
| `/operations/inventory` — FIFO | [x] | [x] HTTP 200; FIFO, инвентарь в HTML |
| CSV export `GET /api/finance/export` + кнопка `/finance` | [x] | [x] HTTP 200; `text/csv`; ~1.9 KB |
| Seasonality chips (T-022) dashboard + `/finance` | [x] | [x] «сезон» на dashboard и `/finance` |
| Retail card dashboard + блок `/finance` (T-021) | [x] | [x] «розниц» на dashboard и `/finance` |

**Lint (2026-05-27):** `npm run lint` exit 0; 1 warning (`today-bookings-interactive.tsx` unused `statusVariant`) — не блокер.

**Sign-off:** T-027 **DONE** (QA agent prod smoke). Визуальный UAT пилота — Human ops, T-028 Week 1.

## Команды проверки

```bash
npm run build
npm run lint
npm run db:generate
# локальная БД:
docker compose up -d
npm run db:push && npm run db:seed
# smoke (dev или start на :3000):
# /, /dashboard, /finance, /crm, /operations, /operations/inventory
# prod: https://banya-digital.vercel.app/dashboard
```
