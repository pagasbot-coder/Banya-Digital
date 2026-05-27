# Architecture decisions (ADR)

## ADR-001 — Staff authentication (T-009)

| Поле | Значение |
|------|----------|
| **Статус** | Accepted (Human Architect 2026-05-25) |
| **Контекст** | Пилот ERP требует разграничения сессий персонала (не гостевой портал). Self-host policy исключает Clerk/Stytch. MVP без Keycloak/Kratos. |
| **Решение** | **Auth.js (NextAuth v5)** + `@auth/prisma-adapter` + PostgreSQL. Провайдер **Credentials** для демо/пилота. Сессия **JWT** (требование Credentials). |
| **Роли** | `owner` \| `ops` \| `admin` \| `warehouse` — в `User.role` и `session.user.role`. |
| **Маршруты** | `(app)` защищены `middleware.ts` → редирект на `/login`. Публично: `/login`, `/api/auth/*`. |
| **Демо** | `npm run db:seed` — `*@demo.local`; пароль `banya-demo` (`DEMO_STAFF_PASSWORD`, виден на `/login`). |
| **Отложено** | RBAC по модулям (finance write только owner/admin) — отдельные задачи после scaffold. |
| **Связано** | T-024 YCLIENTS keys — после T-009 DONE, отдельный sprint. |

### Отклонённые варианты

- Keycloak / Ory Kratos — избыточно для MVP single-tenant.
- Clerk / Stytch — конфликт с self-host policy.

### Последствия

- Prisma-модели `User`, `Account`, `Session`, `VerificationToken`.
- Обязательные env: `AUTH_SECRET`, `AUTH_URL` (или `NEXTAUTH_URL` legacy alias).
- Guest-facing auth — out of scope v1 (`product-brief`).

## ADR-002 — Finance CSV export (T-023 MVP)

| Поле | Значение |
|------|----------|
| **Статус** | Accepted (Developer MVP 2026-05-27) |
| **Контекст** | Пилот требует выгрузку для бухгалтерии/Excel до интеграции с 1С. |
| **Решение** | `GET /api/finance/export` — UTF-8 CSV (BOM): сводка дня, план/факт недели, залы, розница день/неделя. Кнопка на `/finance`. |
| **Отложено** | Формат 1С, НДС, проводки, расписание cron — отдельный sprint после Human sign-off. |
| **White-label** | `NEXT_PUBLIC_BRAND_NAME`, `NEXT_PUBLIC_BRAND_TAGLINE` в sidebar (без смены seed). |
