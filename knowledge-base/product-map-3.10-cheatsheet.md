# Product Map 3.10 — шпаргалка PM (Muster)

> **Источник:** [Product Map 3.10](https://www.productmap.io/product-management-map) (релиз: Monetization & Pricing), [TASK](https://www.productmap.io/task-agentic-product-management), Figma [The Product Map 3.10](https://www.figma.com/board/SABujfIEwzpa1NuWiVS3RR/The-Product-Map-3.10).  
> **Локальный PDF (Human):** `c:\Users\Павел\OneDrive\Рабочий стол\The Product Map 3.10.pdf` — визуальная карта, текст не извлекается автоматически; PM опирается на этот cheatsheet + сайт + `product-map-notes-from-pdf.md`.  
> **Правило:** `@role-pm` | **Лог сессий:** `product-map-workflow.md`

---

## TASK — цикл агента PM

| Буква | Смысл | В Muster |
|-------|--------|----------|
| **T** Topics | 5 доменов PM + методы | Секции brief + workflow |
| **A** Agents | Исполнители в домене | `muster-developer`, `muster-ui-ux`, `muster-qa` |
| **S** Skills | Суждение PM / Architect | Приоритет, `BLOCKED`, DoR |
| **K** Knowledge | Артефакты в git | `knowledge-base/`, `docs/`, queue |

**Ритуал:** Topic → назначить Agent (`READY`) → Skills (проверить AC) → Knowledge (commit markdown по запросу Human).

---

## 5 фаз карты → файлы репозитория

| Фаза Product Map | Ключевые темы (выборочно) | PM заполняет в репо | Когда |
|------------------|---------------------------|---------------------|--------|
| **1 Strategy** | BMC, Customer Dev, PMF, сегментация, ICP, OKR, roadmap | `product-brief.md` (vision, проблема, аудитория, out of scope); `docs/roadmap.md` (Now/Next/Later) | Новый продукт, Phase N, T-015 |
| **2 Generation** | User research, Design/UX, GTM, Growth, AI | `product-brief.md` (personas, JTBD, MVP in/out); `@design-tokens` / UI handoff | Перед UI-heavy `READY` |
| **3 Analysis** | Product metrics, analytics, unit economics, finance | `product-brief.md` (метрики baseline→target); AC в queue с источником данных | Grooming P0, dashboard/finance |
| **4 Delivery** | Backlog, stories, prioritization, Agile, SDLC, risk | `orchestration-queue.md` (`T-0xx`, AC); `architecture.md` (границы); риски в workflow | Каждая сессия PM |
| **People** | Negotiation, talent, soft skills, **Product Ops** | `docs/management-overview.md`, pilot reglement; stakeholders в workflow | T-014, пилот, эскалации |

---

## Обязательные артефакты (минимум)

| Артефакт | Шаблон (кратко) | Файл |
|----------|-----------------|------|
| Problem statement | Для [ICP] который [боль]… в отличие от [альтернатива]… | `product-brief.md` |
| Persona | Роль, цель, боль, триггер успеха, модули | `product-brief.md` |
| JTBD | Когда … хочу … чтобы … | `product-brief.md` или workflow |
| North Star / OMTM | Одна метрика пилота + KPI tree (3–5) | `product-brief.md` |
| MVP slice | In / Out / Pilot success / Stop | brief + `roadmap.md` |
| Now/Next/Later | Фазы с deps | `docs/roadmap.md` |
| Epic → tasks | Вертикальные `T-0xx`, DoR | `orchestration-queue.md` |
| Risk register | P×I, mitigation, owner | `product-map-workflow.md` |

---

## Чеклист PM перед `READY` (1 страница)

**Strategy:** vision (1 предложение)? ICP? 3 цели квартала?  
**Generation:** 2–4 personas? JTBD? альтернатива (таблицы/конкурент)?  
**Analysis:** North Star? метрики с baseline/target? топ-5 рисков?  
**Delivery:** MVP slice? deps (auth, legal)? epic → `T-0xx` с тестируемым AC?  
**People:** владелец решений? участники пилота?

Пробелы без ответа Architect → `BLOCKED` с options + default.

---

## Приоритизация (напоминание)

RICE/ICE — для Phase 2+; в пилоте Banya-Digital: rubric P0/P1/P2 в `@role-pm` (impact, risk, deps).

---

## Ссылки (без логина в SaaS)

| Ресурс | URL |
|--------|-----|
| PM Map 3.10 | https://www.productmap.io/product-management-map |
| TASK | https://www.productmap.io/task-agentic-product-management |
| Create project (опционально Human) | https://app.productmap.io/profile/assistant/create-project |
| Figma 3.10 | https://www.figma.com/board/SABujfIEwzpa1NuWiVS3RR/The-Product-Map-3.10 |

---

_Обновлено: 2026-05-26 (PM, сессия усиления role-pm; PDF — визуальный источник Human)._
