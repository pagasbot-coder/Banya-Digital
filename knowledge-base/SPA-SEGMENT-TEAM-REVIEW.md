# Сегмент SPA / банные комплексы — единый отчёт для командного ревью

**Дата:** 2026-05-26  
**Версия:** 1.0 (консолидация PM)  
**Product Map:** фазы **1 Strategy**, **2 Generation**, **3 Analysis** (+ People — пилот T-014)  
**Статус:** на согласование командой Muster и Human Architect

**Источники (сохранены без изменений):** `segment-spa-banya-analysis.md`, `team-proposals-spa-segment.md`, блок позиционирования в `product-brief.md`

---

## 1. Титул и как пользоваться

### Для кого

| Аудитория | Зачем читать |
|-----------|--------------|
| **Human Architect (Pavel)** | §Часть C — 5 решений; §Часть D — приоритеты очереди |
| **SME, CMO, PM, Architect, UI/UX, Developer, QA, DevOps** | Своя секция в §Часть B — проверить предложения и внести правки |
| **Вся команда** | §Executive summary и §Часть A — общий контекст сегмента |

### Как читать

1. Прочитайте **Executive summary** (5–10 мин) — общая картина без дублирования двух исходных отчётов.
2. При необходимости углубитесь в **Часть A** или откройте полную версию: [`segment-spa-banya-analysis.md`](segment-spa-banya-analysis.md).
3. Перейдите к **своей роли** в Части B, отметьте статус правок и заполните блок «Место для правок коллеги».
4. Human Architect закрывает **Часть C** (чекбоксы) и фиксирует итог в **Журнале согласования**.

### Как внести правки

- Каждая роль правит **только свой подраздел** `### Роль: …` в Части B.
- Вариант A — HTML-комментарий рядом с изменённым пунктом: `<!-- REVIEW: Имя Фамилия, 2026-05-27 -->`
- Вариант B — таблица **«Правки»** в конце своей секции (шаблон уже в документе).
- После правок добавьте строку в **§7 Журнал согласования** (дата, роль, автор, что изменили).
- Не удаляйте исходные файлы `segment-spa-banya-analysis.md` и `team-proposals-spa-segment.md` — они остаются детальными приложениями.

---

## 2. Executive summary

**Продукт сегодня.** Banya-Digital — **операционный B2B-дашборд** для премиального банно-SPA комплекса: unit economics по зонам, yield залов, синхронизация kitchen↔SPA, FIFO органики. Это **не** замена YCLIENTS/DIKIDI и онлайн-записи гостя. Dashboard уже читает живые KPI из PostgreSQL (T-006 DONE); finance, CRM и operations — в основном **read-only** до закрытия P0 по вводу данных.

**ICP (черновик на sign-off).** Управляющий **одного** комплекса 1 500–8 000 м², 3–10 зон, F&B, штат 15–80; запись и касса уже есть (YCLIENTS, 1С, Excel), но **нет дневной маржи по зонам, yield и пульта смены**. Позиционирование: **«ERP-слой поверх записи и кассы»**.

**Рынок (качественно).** Рост wellness и urban-терм в РФ; цифровизация записи отделена от управления сменой — окно для ops-слоя. Конкуренты записи слабы в P&L по залу и kitchen sync; 1С/ERP — тяжёлые; hotel spa (Zenoti) — избыточны для standalone.

**Главные пробелы.** Ввод RevenueLine/COGS (T-011), FIFO UI (T-012), чеклисты смены (T-013), регламент пилота (T-014), SME discovery (T-017); далее — auth, resolve конфликтов, персонал, абонементы, сезонность, комплаенс.

**Демо «Дегтярные Бани».** Учебный эталон (4 зала, ~196 тыс ₽/день, yield 60–80% как **цель пилота**), не отраслевой стандарт. Рекомендация: два seed-пресета — «баня+кухня» и «urban SPA».

**Приоритет на 8 недель.** Не стартовать пилот с внешним объектом до **DONE T-011, T-012, T-013, T-014** и поднятия **T-017 (SME)**. T-018…T-025 — после sign-off Human (§Часть C).

**Согласованные метрики пилота** (из `product-brief.md`): −30% время закрытия смены; FIFO ≥95%; daily margin на dashboard; 0 необработанных kitchen↔SPA конфликтов.

---

## 3. Часть A — Анализ рынка и продукта

> Сжатая интеграция [`segment-spa-banya-analysis.md`](segment-spa-banya-analysis.md). **Полная версия:** все таблицы, mermaid-квадрант, источники и T-018…T-025 — в исходном файле.

### A.1 Аудит продукта

| Область | Сильные стороны | Пробелы |
|---------|-----------------|---------|
| **dashboard** | KPI, алерты, ops, чеклисты из БД | Нет редактирования с dashboard |
| **finance** | Unit economics по залам (read) | Нет ввода — **T-011 P0** |
| **crm** | Гости, брони (read) | Нет CRUD/конфликтов — **T-010 P1** |
| **operations** | Kitchen↔SPA, тайминги (демо) | Нет resolve workflow — **T-018 P1** |
| **inventory** | Модель FIFO + алерты | Нет экрана — **T-012 P0** |

**Модель данных:** ядро заточено под премиальную русскую баню (органика, кухня, залы). Для urban SPA нужны расширения (`Hall.zoneType`, второй seed), не замена ядра.

### A.2 Рынок и конкуренты

| Класс | Примеры | Наша ниша |
|-------|---------|-----------|
| Запись + CRM | YCLIENTS, DIKIDI, Saby | Слабый unit economics по **залу** |
| Учёт РФ | 1С:Салон | Тяжёлое внедрение, слабый пульт смены |
| Таблицы | Excel | Нет live alerts, ошибки FIFO |
| Resort spa | Zenoti | Дорого, не фокус standalone РФ |
| **Banya-Digital** | — | Ops + P&L + yield + kitchen + FIFO |

**TAM/SAM/SOM (качественно):** крупный растущий рынок wellness; SAM — сотни комплексов 4+ зон с F&B; SOM за 12 мес — **3–8 пилотов** при ручном sales.

### A.3 Позиционирование и gaps → очередь

**JTBD владельца:** за 15–30 мин после смены понять P&L по зонам и операционные сбои без недельной сводки в Excel.

| P0 | P1 | P2 (после sign-off) |
|----|----|---------------------|
| T-011 finance input | T-010 CRM | T-020 zone types + urban seed |
| T-012 FIFO UI | T-009 auth | T-021 retail COGS |
| T-013 checklists | T-018 resolve kitchen | T-022 seasonality |
| T-014 pilot reglement | T-019 plan/fact | T-023/T-024 export/YC (BLOCKED) |
| T-017 SME brief | T-025 brief update | |

### A.4 Риски и anti-features (SME lens)

Не становиться «ещё одной CRM записи»; не обещать AI pricing, полный склад всех SKU, мультифилиал и универсальный wellness ERP в v1. **Mitigation:** не стартовать пилот без T-011…T-013; второй seed для urban SPA без органики.

---

## 4. Часть B — Предложения по ролям

Каждая секция — черновик из [`team-proposals-spa-segment.md`](team-proposals-spa-segment.md). Коллеги: обновите bullets при необходимости и заполните таблицу «Правки».

---

### Роль: SME

**Текущие предложения**

- **Day-in-life (08:00–23:00):** пик заездов, конфликт парная/кухня, 22:30–23:30 — 45 мин сводки в Excel → цель **≤30 мин** чеклистом + KPI.
- **Скрытая боль «левый» гость:** расхождение брони vs факт по залу; дисциплина CRM (T-010).
- **Списание органики без партии:** FIFO OUT обязателен перед закрытием (T-012).
- **MUST KPI на первом экране (7):** выручка vs вчера, yield итого + худший зал, маржа %, count критических алертов, kitchen↔SPA, склад, чеклист N/M.
- **Anti-features:** зарплаты мастеров в MVP; универсальный CRM записи; Роспотреб без регламента; мультифилиал в продажах.
- **Критика generic ERP:** Odoo/Битрикс — 200 справочников до первого алерта; YCLIENTS — мастер, не **зал как P&L**.

**Место для правок коллеги**

| Статус | Комментарий |
|--------|-------------|
| ☐ OK · ☐ Нужна правка | _ваши уточнения полевых KPI, day-in-life, anti-features_ |

**Правки**

| Дата | Автор | Изменение |
|------|-------|-----------|
| | | |

---

### Роль: CMO / Growth

**Текущие предложения**

- **ICP B2B:** (A) премиум-баня + кухня; (B) urban термы; (C) реконструкция — не салоны и не сети 15+ без tenant.
- **Каналы 90 дней:** Telegram/WhatsApp владельцев; fit-out подрядчики; консультанты запуска; не performance B2C; 2–3 кейса −30% закрытие смены.
- **AARRR оператора:** demo 15 мин → Activation (T-011) → Retention (утренний ритуал D7) → Referral после пилота; ARPU setup + MRR per complex.
- **LTV:CAC (napkin):** ARPU 25–45 тыс ₽/мес, LTV ~480–860 тыс ₽, CAC 120–200 тыс ₽ → LTV:CAC ~2,4–4,3; paid после ≥3 кейсов.
- **Analytics (PostHog OSS):** `demo_opened`, `kpi_viewed`, `alert_clicked`, `finance_line_created`, `fifo_out_completed`, `checklist_item_toggled`, `pilot_week_N` — без PII.
- **GTM-сообщение:** «Запись остаётся. Пульт смены: маржа, yield, кухня↔SPA, склад — 8 недель с метриками в договоре».

**Место для правок коллеги**

| Статус | Комментарий |
|--------|-------------|
| ☐ OK · ☐ Нужна правка | _каналы, сообщение, события аналитики_ |

**Правки**

| Дата | Автор | Изменение |
|------|-------|-----------|
| | | |

---

### Роль: PM

**Текущие предложения**

- **Strategy:** ICP §3.1 analysis → `product-brief.md` после sign-off; **один** North Star на пилот (margin daily **или** −30% close shift).
- **Эпики:** E1 Pilot-ready (T-011…014); E2 CRM+auth (T-010, T-009); E3 Segment SPA (T-018–T-020); E4 Integrations BLOCKED (T-023, T-024).
- **AC themes:** KPI из PostgreSQL; RU UI; touch ≥44px; explicit out of scope.
- **Приоритизация:** P0 — T-011…014, T-017; P1 — T-010, T-009, T-018, T-019, T-025; P2 — остальное.
- **Pilot vs Phase 2:** 8 нед = один комплекс, живой ввод, без YCLIENTS API; Phase 2 marketing — только после DONE E1.
- **People:** T-014 — роли owner/ops/склад, еженедельная сверка остатков.

**Место для правок коллеги**

| Статус | Комментарий |
|--------|-------------|
| ☐ OK · ☐ Нужна правка | _приоритеты, эпики, OMTM_ |

**Правки**

| Дата | Автор | Изменение |
|------|-------|-----------|
| | | |

---

### Роль: IT-Architect

**Текущие предложения**

- **Stack:** Next.js monolith + Prisma 7 + PostgreSQL достаточно для 1 tenant; PostHog/Umami + Listmonk — отдельные compose на VPS.
- **Multi-tenant:** Phase 3+ `Organization` + `tenantId`; не обещать в GTM до ADR.
- **Auth T-009:** по умолчанию **Auth.js v5** + роли owner/ops/warehouse/crm; finance write — owner (+ delegated).
- **Интеграции:** YCLIENTS read-only (T-024 BLOCKED); 1С CSV export (T-023); касса ФЗ-54 — вне scope.
- **Модель:** `Hall.zoneType`; опционально `Staff`; `Booking.source` = MANUAL | YCLIENTS.

**Место для правок коллеги**

| Статус | Комментарий |
|--------|-------------|
| ☐ OK · ☐ Нужна правка | _ADR auth, analytics host, tenant_ |

**Правки**

| Дата | Автор | Изменение |
|------|-------|-----------|
| | | |

---

### Роль: UI/UX

**Текущие предложения**

- **White-label:** `NEXT_PUBLIC_VENUE_NAME`; пресеты **«Баня»** (wood/amber) и **«Термы»** (slate/teal).
- **Dashboard IA:** KPI 4-up → критические алерты (sticky mobile) → yield → ops → чеклисты; finance drill-down по клику.
- **Mobile смены:** bottom sheet алертов; крупные toggle T-013; скрыть finance для роли ops после auth.
- **a11y:** WCAG AA на KPI; `aria-live` для алертов; RU без CAPS.
- **Urban SPA:** иконы зон; empty state FIFO, не нулевые заглушки.
- **Демо:** бейдж «Демо-данные»; tooltip yield «цель пилота ~60%».

**Место для правок коллеги**

| Статус | Комментарий |
|--------|-------------|
| ☐ OK · ☐ Нужна правка | _IA, темы, mobile_ |

**Правки**

| Дата | Автор | Изменение |
|------|-------|-----------|
| | | |

---

### Роль: Developer

**Текущие предложения**

- **Порядок:** T-011 (M) → T-012 (L) → T-013 (M) → T-010 (L) → T-009 (L, после ADR) → T-018 (M).
- **Data model gaps:** `Hall.zoneType`; `OperationalAlert.resolvedAt`; `RevenuePlan`; расширение `InventoryItem.category`.
- **APIs:** `POST /api/finance/revenue-lines`, `POST /api/inventory/out`, `PATCH` checklist items, `PATCH` alerts resolve — thin routes → `modules/*/services/`.
- **Оценки эпиков:** E1 L; E2 L; E3 M; E4 L BLOCKED.
- **Seed:** `seed-urban-spa.ts` — без сено/пихта, F&B, kitchen off (M).
- **Не делать до пилота:** multi-tenant, WebSocket, guest app, AI pricing.

**Место для правок коллеги**

| Статус | Комментарий |
|--------|-------------|
| ☐ OK · ☐ Нужна правка | _оценки, API, порядок_ |

**Правки**

| Дата | Автор | Изменение |
|------|-------|-----------|
| | | |

---

### Роль: QA

**Текущие предложения**

- **Сценарий «премиум-баня»:** KPI = SQL; RevenueLine → margin; FIFO OUT → alert; checklist N/M; kitchen conflict + resolve (T-018).
- **Сценарий «urban SPA»:** empty FIFO OK; нет kitchen alert; PRODUCT line в finance.
- **Themes:** 100% P0 KPI из БД; RU validation; TZ Europe/Moscow; graceful без `DATABASE_URL`.
- **Demo vs prod:** запрет `db:seed` на production; баннер «не финансовая отчётность»; без реальных телефонов в скриншотах.
- **UAT 8 нед:** чеклисты неделя 1/4/8 в `qa-checklist.md` § Pilot.
- **Auth:** role matrix — ops без finance write; warehouse без CRM PII export.

**Место для правок коллеги**

| Статус | Комментарий |
|--------|-------------|
| ☐ OK · ☐ Нужна правка | _сценарии, UAT_ |

**Правки**

| Дата | Автор | Изменение |
|------|-------|-----------|
| | | |

---

### Роль: DevOps / SRE

**Текущие предложения**

- **Пилоты:** Vercel+Neon — demo 1–2 объекта; self-host (Coolify/VPS) — paid tier при требовании данных в РФ.
- **Backup:** Neon PITR или `pg_dump` daily → S3-compatible; RPO 24h / RTO 4h.
- **152-ФЗ:** ПДн гостей — БД в РФ на production; политика + согласие CRM; решение Human/legal по Neon/Vercel DPA.
- **Monitoring:** Uptime Kuma / Healthchecks `/api/health`; Grafana + Postgres exporter; Telegram при 5xx.
- **CI/CD:** GH Actions lint/build/migrate check; preview на PR; prod — tag + manual approval.
- **Секреты:** не в repo; rotate при утечке demo URL.

**Место для правок коллеги**

| Статус | Комментарий |
|--------|-------------|
| ☐ OK · ☐ Нужна правка | _хостинг пилота, backup, compliance_ |

**Правки**

| Дата | Автор | Изменение |
|------|-------|-----------|
| | | |

---

## 5. Часть C — Решения Human Architect

Только Human отмечает `[x]`. Рекомендации PM — в колонке «Рекомендация».

| # | Решение | Варианты | Рекомендация PM | Решение Human |
|---|---------|----------|-----------------|---------------|
| 1 | **ICP сегмента** | A) Премиум-баня + кухня · B) Urban термы · C) Оба + два seed | **C** | [ ] A [ ] B [ ] C |
| 2 | **North Star пилота (8 нед)** | A) Daily margin visibility · B) −30% закрытие смены | **A** primary; **B** co-metric в T-014 | [ ] A [ ] B [ ] оба |
| 3 | **T-018…T-025 в queue** | Все · Только T-018–T-020 · Отложить | **T-018–T-020** после DONE T-011…T-013 | [ ] |
| 4 | **T-017 SME в READY** | Да / Нет | **Да** — до outbound CMO | [ ] Да [ ] Нет |
| 5 | **Auth (T-009)** | Auth.js · Clerk · Пилот без auth | **Auth.js** | [ ] Auth.js [ ] Clerk [ ] Отложить |

**Дополнительно (опционально):**

- [ ] Подтвердить commit+push пакета docs на `master`
- [ ] Разрешить пилот на **Vercel+Neon** без self-host для первого объекта
- [ ] Запретить маркетинг «мультифилиал» до ADR tenant

---

## 6. Часть D — Следующие шаги

### D.1 P0 — до sign-off и пилота (T-011…T-017)

| ID | Задача | Роль | Статус | Действие |
|----|--------|------|--------|----------|
| **T-011** | Finance: ввод RevenueLine / CostLine | Developer | READY | Реализовать ввод за business day |
| **T-012** | Inventory: FIFO UI | Developer | READY | Экран лотов, OUT, пороги |
| **T-013** | Operations: чеклисты смены | Developer | READY | N/M, toggle из БД |
| **T-014** | Регламент пилота 8 нед | PM | READY | Документ RU, роли, метрики |
| **T-017** | SME: operational brief | SME | BACKLOG → **READY*** | `industry-brief.md` по шаблону |

\*T-017 — поднять в READY после решения Human (§C, п.4).

### D.2 После sign-off Human (T-018+)

| ID | Задача | Роль | Приоритет | Зависимости |
|----|--------|------|-----------|-------------|
| T-018 | Resolve kitchen↔SPA + audit | Developer | P1 | T-006, T-011…013 |
| T-019 | Plan/fact неделя на dashboard | Developer | P1 | T-011 |
| T-020 | Hall zone types + seed urban SPA | Developer | P2 | T-006 |
| T-021 | Retail COGS PRODUCT | Developer | P2 | T-012 |
| T-022 | Seasonality calendar | PM/Dev | P2 | T-019 |
| T-023 | Export CSV / 1С | Developer | P2 BLOCKED | Architect |
| T-024 | YCLIENTS import | Developer | P2 BLOCKED | T-010, T-009 |
| T-025 | Обновить ICP в brief post-SME | PM | P1 | T-017 |

PM добавляет строки T-018+ в `orchestration-queue.md` **после** отметок в §Часть C.

### D.3 Кто что делает (после ревью этого документа)

| Роль | Действие |
|------|----------|
| **Human Architect** | Закрыть §Часть C; разрешить T-017 READY и T-018+ в очередь |
| **SME** | Правки §B SME → T-017 `industry-brief.md` |
| **CMO** | Правки §B CMO → черновик `marketing-brief.md` |
| **PM** | Журнал queue; T-014; T-025 после T-017; строки T-018+ |
| **IT-Architect** | ADR auth + analytics; unblock T-009 |
| **UI/UX** | White-label / темы «Термы» в backlog после E1 |
| **Developer** | T-011 → T-012 → T-013 (P0) |
| **QA** | Регресс T-006 + сценарии §B QA; § Pilot в checklist |
| **DevOps** | `devops-runbook.md`; health + backup для пилота |

---

## 7. Журнал согласования

| Дата | Роль | Автор | Что изменили |
|------|------|-------|--------------|
| 2026-05-26 | PM | muster-pm | Создан консолидированный документ из analysis + team-proposals |
| | | | |
| | | | |

---

*Следующий шаг: каждая роль — §4 Часть B + строка в §7; Human — §5; PM — очередь и brief после sign-off.*
