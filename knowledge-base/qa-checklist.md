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
- [x] Dashboard: KPI grid (mock «Загрузка залов», «Выручка за день» и др.)
- [x] Dashboard: блок «Критические алерты»
- [x] Dashboard: блок «Операции сегодня»
- [x] App shell: sidebar + навигация по модулям

## Регрессия (MVP) — pending

- [ ] Auth / защищённые маршруты
- [ ] KPI из БД (не mock)
- [ ] Нет `console.error` на happy path в production build _(dev: hydration warning от Cursor browser refs — не блокер приложения)_

## Команды проверки

```bash
npm run build
npm run lint
npm run db:generate
# smoke (dev или start на :3000):
# /, /dashboard, /finance, /crm, /operations
```
