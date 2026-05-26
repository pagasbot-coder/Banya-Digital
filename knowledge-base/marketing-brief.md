# Marketing Brief — Banya-Digital ERP (премиум-баня)

**Версия:** 1.0 · **Дата:** 2026-05-27  
**Роль:** CMO / Growth (T-025, post-SME T-017)  
**ICP (Human Architect 2026-05-25):** владелец или управляющий **одного премиум-банного комплекса** с F&B и kitchen↔SPA — не urban-термы на старте, не сети 15+ точек без tenant.  
**North Star пилота:** **WAMZ** — см. `@knowledge-base/product-brief.md`.

---

## 1. ICP (Ideal Customer Profile)

| Параметр | Значение |
|----------|----------|
| **Сегмент** | Премиум-баня / банно-SPA, 1 500–8 000 м², 3–10 зон |
| **Роли покупателя** | Владелец, управляющий, иногда CFO |
| **Стек сегодня** | YCLIENTS / 1С / Excel для записи и кассы; **нет** пульта смены с маржой по зонам |
| **Триггер покупки** | Рост F&B, конфликты кухня↔SPA, «слепая» маржа, долгое закрытие смены (45+ мин) |
| **Anti-ICP** | Салоны красоты без залов; сети без ADR tenant; объекты без F&B/kitchen sync |

**Jobs-to-be-done:** «Вижу маржу и yield по залам до обеда»; «Закрываю смену за ≤30 мин с чеклистом и без необработанных конфликтов кухни».

---

## 2. Три B2B-канала на 90 дней

| # | Канал | Тактика | KPI канала (90 дней) |
|---|--------|---------|----------------------|
| **1** | **Telegram / WhatsApp владельцев** | Личные интро, 15-мин demo `/dashboard`, кейс «−30% на закрытие смены» | 40 квалифицированных диалогов → 8 demo → 2 пилота |
| **2** | **Fit-out и запуск комплексов** | Партнёрство с подрядчиками бань/SPA: ERP-слой в пакете «открытие объекта» | 3 партнёра с реферальной схемой → 1 пилот |
| **3** | **Консультанты по операциям wellness** | Вебинар «пульт смены без замены YCLIENTS», PDF регламента пилота | 2 совместных эфира → 5 demo → 1 пилот |

**Не в первые 90 дней:** performance B2C, холодный email-массив, платный контекст до **≥3** подписанных кейсов пилота.

---

## 3. AARRR (оператор / B2B)

| Стадия | Определение для Banya-Digital | Событие успеха |
|--------|------------------------------|----------------|
| **Acquisition** | Владелец узнал о «пульте смены» | `demo_opened` (15 мин walkthrough) |
| **Activation** | Живой ввод в пилоте | Первая `finance_line_created` + `checklist_item_toggled` в неделю 1 |
| **Retention** | Утренний ритуал D7 | `kpi_viewed` ≥5 дней/неделю на W2+ |
| **Revenue** | Контракт после пилота | Подписание MRR (вне продукта) |
| **Referral** | Рекомендация коллеге-владельцу | `referral_intro` (ручной тег в CRM пилота) |

**Порог Activation (пилот):** WAMZ ≥ 2/4 к концу недели 2; к неделе 8 — **≥3/4**.

---

## 4. Unit economics (napkin LTV:CAC)

Оценка для **одного комплекса**, RUB, без НДС в модели:

| Метрика | Диапазон | Допущение |
|---------|----------|-----------|
| **ARPU** | 25–45 тыс. ₽/мес | Setup разовый + MRR на объект |
| **Gross margin SaaS** | ~75% | Self-host / Vercel+Neon — см. Architect |
| **Churn (год 1)** | 15–25% annualized | После пилота, при WAMZ < 2/4 |
| **LTV** | ~480–860 тыс. ₽ | ARPU × 24 мес × (1 − churn) × margin |
| **CAC** | 120–200 тыс. ₽ | Founder-led + партнёры, без paid |
| **LTV:CAC** | **~2,4–4,3** | Цель ≥3 перед масштабированием paid |

**Payback:** 4–8 месяцев при ARPU 35 тыс. ₽ и CAC 150 тыс. ₽.

---

## 5. OSS PostHog — события (без PII)

Интеграция кода — backlog; список для ADR analytics и пилотной воронки:

| Событие | Когда | Свойства (без PII) |
|---------|-------|-------------------|
| `demo_opened` | Открыт dashboard без сессии / demo URL | `source`, `week` |
| `kpi_viewed` | Загрузка `/dashboard` с KPI | `has_db`, `alert_count` |
| `alert_clicked` | Клик по критическому алерту | `alert_type`: `kitchen` \| `inventory` \| `timing` |
| `finance_line_created` | Успешный RevenueLine / CostLine | `line_type`, `has_hall` |
| `fifo_out_completed` | FIFO OUT на складе | `organic_type` |
| `checklist_item_toggled` | Toggle пункта чеклиста | `completed_ratio_bucket` |
| `kitchen_conflict_resolved` | T-018 «Разобрано» | `open_conflicts_after` |
| `pilot_week_N` | Ручной тег PM (N=1…8) | `wamz_score` |

**Запрет:** телефоны гостей, email, ФИО в properties.

---

## 6. GTM-сообщение

> **Запись остаётся в YCLIENTS. Пульт смены — маржа, yield, кухня↔SPA и склад — 8 недель с метриками в договоре.**

**Proof points для пилота:** −30% время закрытия смены; ≥95% точность FIFO; 0 необработанных kitchen↔SPA конфликтов за смену; WAMZ ≥ 3/4 к неделе 8.

---

## 7. Связанные артефакты

- `@knowledge-base/product-brief.md` — MVP, WAMZ, метрики
- `@knowledge-base/industry-brief.md` — SME day-in-life
- `@docs/pilot-reglement.md` — регламент 8 недель
- `@knowledge-base/SPA-SEGMENT-TEAM-REVIEW.md` § CMO
