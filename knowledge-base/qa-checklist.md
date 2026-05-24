# QA Checklist — Banya-Digital ERP

_Ведёт QA (@role-qa). Задача T-005._

## Foundation (T-001) — baseline

- [x] `npm run build` без ошибок
- [x] `npm run lint` без ошибок
- [x] `.env` в `.gitignore`, есть `.env.example`
- [ ] Все placeholder-страницы открываются: `/dashboard`, `/finance`, `/crm`, `/operations`
- [ ] Навигация подсвечивает активный раздел
- [ ] Нет секретов в репозитории

## Перед каждым PR

- [ ] `npm run build` / `npm run lint`
- [ ] Критерии из `orchestration-queue.md` для задачи выполнены
- [ ] Обновлён `qa-checklist` при новых рисках

## Регрессия (после модулей)

- [ ] Finance: формы не ломают layout
- [ ] Operations: тайминги не пересекают kitchen sync (когда реализовано)
- [ ] Inventory: FIFO списание в правильном порядке партий
