# Product Map workflow — Banya-Digital (Muster)

> **Stub PM maintains.** Mirrors [Product Map 3.10](https://www.productmap.io/) / [TASK](https://www.productmap.io/task-agentic-product-management) in-repo — no dependency on SaaS login.  
> Rule: `@role-pm` § Product Map 3.10 | Figma: [board 3.10](https://www.figma.com/board/SABujfIEwzpa1NuWiVS3RR/The-Product-Map-3.10?node-id=100-6433)

---

## Product context (step 1)

| Поле | Значение |
|------|----------|
| **Продукт** | Banya-Digital ERP |
| **Стадия** | Pilot prep (Phase 3 dev) |
| **Домен** | Premium bath/spa operations, unit economics, FIFO organic inventory |
| **Copilot focus** | Daily PM + early-stage delivery (MVP v1 shipped to dashboard; CRM/finance/ops next) |
| **PDF source** | Human: `The Product Map 3.10.pdf` (Desktop, OneDrive) — Figma export |

---

## Discovery sessions

| Дата | Участники | Топик (TASK) | Итог | Связанные задачи |
|------|-----------|--------------|------|------------------|
| 2026-05-26 | PM (agent) | Delivery / Knowledge | Интеграция Product Map 3.10 в `@role-pm`; stub workflow | T-015 (BACKLOG) |
| **2026-05-25** | Human (PDF) + PM (agent) | Strategy → Delivery (full map skim) | Структура 4 фаз + 64 тем; layer→repo mapping; Phase 2 гипотезы в brief | **T-015** (частично) |
| **2026-05-25** | Human Architect (Pavel) | Strategy / Analysis | ICP **премиум-баня**; North Star **WAMZ** → `product-brief`, Part C SPA review | T-025 PARTIAL |

### Сессия 2026-05-25 — insights

1. Карта организована по **4 фазам LC**: Strategy → Generation → Analysis → Delivery; плюс сквозные блоки (OKR, UX, Analytics, Backlog, Agile, People).
2. **TASK** совпадает с Muster: Topics = домены brief/roadmap; Agents = muster-*; Skills = Human/PM; Knowledge = `knowledge-base/` + queue.
3. Для Banya на пилоте критичны **Analysis**: Product Metrics, Unit Economics, MVP/Maturity; **Delivery**: Prioritization, Product Roadmaps.
4. **3.10 new:** Monetization & Pricing — для ERP не P0; margin/pricing залов уже в finance module.
5. **Product Ops** (3.6) — аналог нашего `orchestration-queue.md` + журнал; усилить после T-014.
6. **ICP** (3.7) — **закрыто 2026-05-25:** премиум-баня, 1 tenant; urban-термы — не primary.
7. Навигация **Skills** (15) и **Grades** — для оценки зрелости команды пилота, не для backlog.
8. Детальные гайды — только ссылки; в git храним **артефакты**, не копию PDF.

Полная выписка структуры: `@knowledge-base/product-map-notes-from-pdf.md`.

---

## Layer → repo mapping (Banya)

| Product Map layer / TASK | Muster file | Статус / действие |
|--------------------------|-------------|-------------------|
| Vision, problem, ICP | `product-brief.md` | Заполнен; ICP — уточнить post-pilot |
| Users, personas, JTBD | `product-brief.md` (аудитория) | Таблица ролей есть |
| Problems, alternatives | `product-brief.md` «Проблема» | Таблицы/разрозненные инструменты |
| Solutions, MVP | `product-brief.md` MVP + Phase 2 | Phase 2 bullets добавлены 2026-05-25 |
| Metrics, KPI tree | `product-brief.md` метрики | Пилот 8 нед |
| Roadmap N/N/L | `docs/roadmap.md` | Синхронизировать после T-010…014 DONE |
| Backlog, AC | `orchestration-queue.md` | T-010…014 READY |
| Unit economics / finance | `architecture.md`, finance module | T-011 |
| Product analytics | dashboard services, QA checklist | T-006 DONE |
| Stakeholder / pilot | `docs/management-overview.md`, `pilot-reglement` (T-014) | В работе |
| Discovery log, risks | **этот файл** | Living |
| TASK Knowledge | весь `knowledge-base/` | Versioned in git |

---

## Open questions (→ Architect / Human)

- [ ] **Auth** (T-009): провайдер и роли — блокирует RBAC Phase 2.
- [ ] **Phase 2 scope** после 8-недельного пилота: multi-hall reporting, notifications, guest app — что In/Out?
- [x] **ICP:** премиум-баня, 1 tenant — Human **2026-05-25** (не urban-термы как primary).
- [x] **North Star / OMTM:** **WAMZ** — Human **2026-05-25**; определение в `product-brief.md`.
- [ ] **Monetization & Pricing (3.10):** нужен ли модуль ценообразования залов/программ в ERP или вне scope?

---

## Risks (living)

| Риск | P | I | Mitigation |
|------|---|---|------------|
| Auth не решён — блокирует роли | 2 | 3 | T-009 BACKLOG до Architect |
| Scope creep Phase 2 | 2 | 2 | Product Map discovery перед новыми P0; T-015 |
| PDF/Figma drift vs git | 1 | 2 | Один workflow log; не копировать гайды целиком |

---

## Artifacts index

| Артефакт | Файл | Статус |
|----------|------|--------|
| Problem, personas, MVP, metrics | `product-brief.md` | Актуален + Phase 2 |
| PDF structure notes | `product-map-notes-from-pdf.md` | **NEW** 2026-05-25 |
| Data model, modules | `architecture.md` | Актуален |
| Roadmap phases | `docs/roadmap.md` | Обновить после pilot reglement |
| Owner narrative | `docs/management-overview.md` | Черновик (T-008) |
| Backlog & AC | `orchestration-queue.md` | T-010…014 READY |
| Pilot reglement | `docs/pilot-reglement.md` | T-014 (ожидает PM) |

---

_Обновляйте после каждой Product Map / Figma сессии с Human._
