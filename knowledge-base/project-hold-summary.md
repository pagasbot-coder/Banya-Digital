# Banya-Digital — проект на паузе (2026-05-30)

## TL;DR

MVP ERP **готов к демо и возобновлению пилота**, но **разработка и пилот приостановлены** по решению Human Architect. Prod работает: https://banya-digital.vercel.app (режим демо без входа).

---

## Что сделано

- Next.js 16 ERP: сводка, финансы, CRM, операции, FIFO-склад
- PostgreSQL (Neon) + seed «Дегтярные Бани»
- Auth.js v5 (отключён на prod через `DEMO_SKIP_AUTH`)
- Пилот Day 1 выполнен; prod smoke PASS (T-027)
- Hotfix-волна T-029…T-035: формы submit работают (Next.js 16 server actions)

---

## Почему HOLD

- Пилот Week 1 не завершён (дни 2–7 не пройдены)
- Human решил поставить проект на паузу до следующего этапа
- Новые фичи (YCLIENTS, prod auth, RBAC) **не начинаем** на hold

---

## Риски (принять на паузе)

| Риск | Уровень |
|------|---------|
| Prod без авторизации — любой может менять данные | Высокий (осознанно для демо) |
| Нет RBAC по ролям на запись | Средний |
| Нет автотестов в CI | Средний |

---

## Как возобновить (5 шагов)

1. Открыть `docs/hold-status.md` и `orchestration-queue.md` → секция **PROJECT HOLD**
2. Локально: `.env` + `npm run db:seed` + `npm run build`
3. Human ops: продолжить **День 2** из `docs/pilot-start.md`
4. Перед «настоящим» prod: `DEMO_SKIP_AUTH=false` на Vercel
5. PM: приоритизировать RBAC и закрытие недели 1 пилота (WAMZ)

---

## Prod и доступ

- **URL:** https://banya-digital.vercel.app
- **Вход:** не требуется (демо)
- **Учётки для обучения** (когда включим auth): `*@demo.local`, пароль `DEMO_STAFF_PASSWORD`

---

## Документы

- Code review: `docs/code-review-hold-2026-05.md`
- Hold runbook: `docs/hold-status.md`
- Очередь задач: `orchestration-queue.md`

_Обновлено: 2026-05-30 · Muster Developer wrap-up._
