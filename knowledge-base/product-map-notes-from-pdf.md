# Product Map 3.10 — заметки из PDF (Human export)

> **Источник:** `c:\Users\Павел\OneDrive\Рабочий стол\The Product Map 3.10.pdf` (Figma export, май 2026).  
> PM-сессия: **2026-05-25**. Полный текст карты не копируется — только структура и привязка к Banya-Digital.

---

## Что это

**The Product Map 3.10** — интерактивная mind map ~64+ тем PM с ресурсами сообщества. Навигация: **START** → фазы жизненного цикла → темы L1–L5 → ссылки на гайды (productmap.io).

Связанный фреймворк **TASK** (Topics → Agents → Skills → Knowledge): https://www.productmap.io/task-agentic-product-management

---

## Навигация карты (3 режима)

| Режим | Назначение |
|-------|------------|
| **Topics** | Основная ось: домены и темы по фазам продукта |
| **Skills** | 5 групп × **15 essential PM skills** (sunburst): Strategic Impact, Voice of Customer, Fluency with Data, Backlog Management, Communication, … |
| **Grades** | Junior → Middle → Senior → Director → C-Level; у каждой темы — звёзды seniority |

**Уровни детализации:** L1 (домен) → L2 (категории) → L3 (подтемы) → L4+ (материалы, ссылки).

---

## Четыре фазы жизненного цикла (основная ось PDF)

| Фаза | Название | Ключевые блоки на карте |
|------|----------|-------------------------|
| **1** | Product Strategy | Business Model Generation, Customer Development, **Monetization & Pricing** (NEW 3.10) |
| **2** | Product Generation | Product-Market Fit, Market Research, Competitor Analysis, Product-Market Fit Path |
| **3** | Product Analysis | MVP / Minimum Viable Product Development, Product Maturity Levels, Product Roadmaps |
| **4** | Product Delivery | Market Segmentation (Process, Models), **Ideal Customer Profile**, People & Processes |

---

## Сквозные домены (между фазами)

| Домен | Подтемы (выборка) |
|-------|-------------------|
| OKRs | OKR Process, OKR Best Practices |
| User Research | Methods, Needfinding Interviews |
| Design, UX | Design Processes, Design Thinking, Interaction Design, Visual Design & Branding |
| Marketing / Growth | Digital Marketing, GTM, Performance Marketing, Growth Hacking, Sales B2C/B2B |
| AI | AI Algorithms, AI Use Cases, Prompt Engineering, Context Engineering |
| KPIs & Analytics | Product/Application/Marketing Metrics, Product Analytics, Data Analytics |
| Unit Economics & Finance | Calculation, Improvements, Financial Management, Reporting |
| Backlog & Agile | Stakeholder Analysis, User Story Mapping, Prioritization, Requirements; Agile/Kanban/Scrum/Scaling; Lean |
| Development | SDLC, Frontend, Backend, Web3 |
| Risk | Processes, Risk Control |
| People | Negotiation, Facilitation, Leadership, Team Growth, Performance Management, Skills Assessment, **Product Ops** |
| Community | Join community, LinkedIn, Product Map AI Agents |

---

## TASK ↔ 5 доменов Product Map

| TASK домен | Типичные артефакты (из productmap.io) | Banya-Digital (git) |
|------------|--------------------------------------|---------------------|
| **Strategy** | business-model-canvas, competitor matrix, ICP, OKR, roadmap N/N/L | `product-brief.md`, `docs/roadmap.md` |
| **Generation** | research synthesis, GTM, growth experiments | `management-overview.md`, pilot narrative (T-014) |
| **Analysis** | north-star, unit economics model, KPI tree, funnel reports | `product-brief.md` метрики, dashboard AC, `architecture.md` aggregates |
| **Delivery** | PRD, user story map, RICE, risk register, ADR | `orchestration-queue.md`, `architecture.md` |
| **People** | stakeholder map, RACI, product ops playbook | `product-map-workflow.md`, pilot roles (T-014) |

---

## Новое в 3.10 (changelog PDF)

- **Monetization & Pricing** — отдельный гайд (карта + web), кураторы Pricing I/O и др.
- Обновления 3.9: **Context Engineering**; 3.8: **Product Analytics**; 3.7: **ICP**; 3.6: **Product Ops**; 3.5: Prompt Engineering; 3.4: Product Roadmaps; 3.3: Unit Economics handbook.

---

## Релевантность для Banya-Digital (Phase 2+)

| Тема PDF | Применение к ERP бани |
|----------|------------------------|
| Unit Economics Calculation / Improvements | Зал × услуга × COGS органики — уже в MVP; Phase 2: отчёты по периоду, сценарии |
| Product Metrics / Product Analytics | KPI dashboard, freshness, OMTM пилота |
| MVP / Product Maturity Levels | Пилот 8 нед → решение «scale / pivot / stop» |
| Product Roadmaps | Now/Next/Later после T-010…013 |
| Backlog: Prioritization, User Story Mapping | `orchestration-queue.md`, vertical slices |
| Ideal Customer Profile | Уточнить ICP: премиум баня, 1 tenant, владелец+ops |
| Product Ops | Muster = product ops в git (queue + knowledge-base) |
| Stakeholder Analysis | Участники пилота (T-014) |
| Risk Management | Auth blocker, scope creep — в workflow risks |

**Меньше приоритет сейчас:** Growth Hacking, Web3, Performance Marketing, Monetization & Pricing (B2C SaaS), AI PRD (до явного запроса Architect).

---

## Как пользоваться PDF / Figma (из карты)

- Zoom ~50%; Cmd/Ctrl+\ — скрыть UI; Cmd/Ctrl+F — поиск.
- PDF — офлайн и мобильный просмотр; комментарии в FigJam (C/E).
- Brain Dump — секция обратной связи на доске.

---

_Детальные гайды по темам — на productmap.io; PM не дублирует контент гайдов в репозитории._
