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

| Маршрут / фича | Build compile | Prod manual (Human) |
|----------------|---------------|---------------------|
| `/dashboard` — KPI, WAMZ, алерты, чеклисты | [x] | [ ] |
| `/finance` — формы, план/факт, розница | [x] | [ ] |
| `/crm` — гости, брони | [x] | [ ] |
| `/operations` — конфликты, audit | [x] | [ ] |
| `/operations/inventory` — FIFO | [x] | [ ] |
| CSV export `GET /api/finance/export` + кнопка `/finance` | [x] | [ ] |
| Seasonality chips (T-022) dashboard + `/finance` | [x] | [ ] |
| Retail card dashboard + блок `/finance` (T-021) | [x] | [ ] |

**Lint:** `npm run lint` — запускать перед релизом; при зависании ESLint на Windows — повторить или `npx eslint app components modules lib --max-warnings 0`.

**Sign-off:** T-027 — после prod manual чекбоксов выше.

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
