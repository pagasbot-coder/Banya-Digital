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
