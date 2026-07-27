# Handoff: пульт бренда → Quiet Partner

**Дата:** 27 июля 2026  
**Решение Human:** код `/brand` и дальнейшее обсуждение доработок — **в репо Quiet Partner**, не в Banya-Digital.  
**Этот файл:** мост из Banya-Digital (где собраны KB + волна A).

---

## 1. Что решить в Quiet Partner (сразу)

| # | Действие |
|---|----------|
| 1 | Открыть Cloud Agent / локальный Cursor **на репо Quiet Partner** |
| 2 | Ветка: `cursor/brand-pult-mvp-0821` от `master` (или основной ветки QP) |
| 3 | Скопировать/подтянуть артефакты из списка ниже |
| 4 | Завести эпик T-Brand-001…008 в `orchestration-queue.md` QP |
| 5 | Сборка MVP `/brand` рядом с `/stages` и `/radar` (радар не трогать) |

**Обсуждение доработок** (верстка презентации, формулировки, волна A feedback) — в чате/PR **Quiet Partner**, не в PR Banya-Digital #1.

---

## 2. Что уже готово в Banya-Digital (забрать)

| Артефакт | Путь в Banya-Digital | Куда в QP |
|----------|----------------------|-----------|
| Док. 1 этапы/реестры | `knowledge-base/brand-pult-etapy-0-6.md` | `knowledge-base/` или `content/brand/` |
| Док. 2 Natural v1.14 | `knowledge-base/brand-pult-primer-travelplus-natural.md` | то же + demo seed |
| Платформа Natural | `knowledge-base/brand-platform-travelplus-natural.md` | `knowledge-base/` |
| Playbook бренда | `knowledge-base/brand-management-playbook.md` | `knowledge-base/` |
| Круглый стол док.1 | `knowledge-base/kruglyy-stol-brand-pult-qp.md` | `knowledge-base/` |
| Круглый стол v1.14 | `knowledge-base/kruglyy-stol-natural-v114.md` | `knowledge-base/` |
| Логистика Китай | `knowledge-base/china-russia-logistics.md` | `knowledge-base/` |
| **Волна A markdown** | `brand-pult/` (вся папка) | корень или `content/brand-pult/` |
| Роли Muster | `.cursor/rules/role-brand-manager.mdc`, `role-copywriter.mdc`, `role-china-logistics.mdc` | `.cursor/rules/` |
| Скрипт PPTX (опц.) | `scripts/build-travelplus-interview-pptx.py` | по желанию |

Ветка-источник: `cursor/copywriter-report-fmcg-pm-0821` · PR: https://github.com/pagasbot-coder/Banya-Digital/pull/1

---

## 3. MVP `/brand` (волна B) — scope

```text
/stages   — есть
/radar    — не трогаем
/brand    — новый режим (клон shell /stages)
```

**MVP UI:**
- Этапы 0–6 (на 3–6 плашка «сценарий»)
- Реестры: аудитория · конкуренты · платформа · ассортимент · решения · не знаем · риски
- Demo Travel+ Natural из док. 2; %/origin/COGS = «открыто»
- MD export + localStorage (`qp-brand-*`)
- Без БД, без auth-усложнений, без моста в radar

**Эпик:**

| ID | Задача | Роль |
|----|--------|------|
| T-Brand-001 | Human Go волна B (дан) | Human |
| T-Brand-002 | `content/brand/` шпаргалки из KB | Copywriter |
| T-Brand-003 | `lib/brand/registers.ts` MVP | Developer |
| T-Brand-004 | UI BrandShell + editors | Developer + UI/UX |
| T-Brand-005 | Demo Natural + MD export | Developer |
| T-Brand-006 | China checklist в этапе 2/4 | China + Dev |
| T-Brand-007 | QA smoke + dogfood guide | QA |
| T-Brand-008 | Hub-ссылка «Пульт бренда» (мелко) | UI/UX |

Критерий: dogfood 3×10 мин, refresh не теряет данные.

---

## 4. Статус волны A

Папка `brand-pult/` собрана.  
Ждём Human: прогон `DOGFOOD-CHEKLIST.md` → «волна A ок» (можно сделать уже в QP после копирования папки).

---

## 5. Ограничение Cloud Agent

Агент, который вёл Travel+/Natural в **Banya-Digital**, **не имеет доступа** к репо Quiet Partner из этой среды.  
Код `/brand` пилить только агентом, запущенным **на Quiet Partner**.

---

*Handoff. Дальше — ветка и PR в Quiet Partner.*
