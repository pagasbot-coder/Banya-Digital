# Design Tokens — Banya-Digital ERP

_Заполняет UI/UX (@role-ui-ux) в задаче T-003._

## Направление (premium bath/spa)

- Тёплые нейтрали, приглушённое золото/медь для акцентов
- Много воздуха, крупная типографика для KPI
- Тёмная тема по умолчанию для операционного зала (опционально)

## Цвета (Tailwind)

_Stub — заменить после T-003._

| Token | Назначение |
|-------|------------|
| `--primary` | CTA, активная навигация |
| `--muted` | Вторичный текст, подписи KPI |
| `--accent` | Премиум-акцент (spa gold) |

## Типографика

- Sans: Geist (из Next.js scaffold)
- Heading: semibold, tracking-tight для dashboard

## Spacing / радиусы

- Базовый `--radius`: 0.625rem (shadcn neutral)
- Карточки KPI: `rounded-xl`, padding `p-6`

## Компоненты (shadcn)

- Button, Card (добавить в T-003)
- Sidebar / nav — `components/app-shell-nav.tsx`
