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

---

## Discovery sessions

| Дата | Участники | Топик (TASK) | Итог | Связанные задачи |
|------|-----------|--------------|------|------------------|
| 2026-05-26 | PM (agent) | Delivery / Knowledge | Интеграция Product Map 3.10 в `@role-pm`; этот stub | T-015 (BACKLOG) |

---

## Open questions (→ Architect)

- [ ] Auth provider для T-009 (NextAuth / Clerk / custom)?
- [ ] Phase 2 scope: что после 8-недельного пилота (T-014)?

---

## Artifacts index

| Артефакт | Файл | Статус |
|----------|------|--------|
| Problem, personas, MVP, metrics | `product-brief.md` | Заполнен (T-004) |
| Data model, modules | `architecture.md` | Актуален |
| Roadmap phases | `docs/roadmap.md` | Актуален |
| Owner narrative | `docs/management-overview.md` | Черновик (T-008) |
| Backlog & AC | `orchestration-queue.md` | T-010…014 READY |
| Pilot reglement | `docs/pilot-reglement.md` | T-014 (ожидает PM) |

---

## Risks (living)

| Риск | P | I | Mitigation |
|------|---|---|------------|
| Auth не решён — блокирует роли | 2 | 3 | T-009 BLOCKED/BACKLOG до Architect |
| Scope creep Phase 2 | 2 | 2 | Product Map discovery перед новыми P0 |

---

_Обновляйте после каждой Product Map / Figma сессии с Human._
