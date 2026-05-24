# Design Tokens — Banya-Digital ERP

_Premium bath/spa ERP — спокойный, тёплый, не «кричащий» UI. Обновлено в T-003._

## Направление

- **Тёплые нейтрали** (hue ~50–85 в OKLCH) — фон, карточки, sidebar
- **Акцент spa gold** — `accent` / `ring` / активная навигация (`sidebar-primary`)
- **Много воздуха** — KPI `text-3xl`, секции с `gap-6`–`gap-8`
- **Тёмная тема** — класс `.dark` на `<html>`; палитра согласована, контраст WCAG для текста

## Цвета (CSS variables → Tailwind)

| Token | Light (назначение) | Dark |
|-------|-------------------|------|
| `--background` | Тёплый off-white зала | Глубокий warm charcoal |
| `--foreground` | Основной текст | Светлый warm white |
| `--card` | Карточки KPI / секций | Приподнятый слой |
| `--muted-foreground` | Подписи KPI, hints | Приглушённый текст |
| `--accent` | Gold/amber CTA, бейджи роста | Тот же hue, чуть ярче |
| `--primary` | Кнопки, emphasis | Инверсия для кнопок |
| `--sidebar-*` | Боковая панель ERP | Тёмный sidebar |
| `--destructive` | Высокий приоритет алертов | Смягчённый red |

Реализация: `app/globals.css` (`:root` + `.dark`).

## Типографика

| Роль | Стек | Классы |
|------|------|--------|
| UI / body | Geist Sans (`--font-geist-sans`) | `font-sans`, `text-sm` |
| KPI / заголовки | Geist Sans | `font-heading`, `text-2xl`–`text-3xl`, `font-semibold`, `tracking-tight` |
| Mono (будущее) | Geist Mono | `font-mono` — коды заказов, SKU |

`lang="ru"` на `<html>` для скринридеров.

## Spacing / радиусы

- `--radius`: `0.625rem` (shadcn)
- KPI cards: `rounded-xl`, padding через `Card` (`py-4`, content `pb-5`)
- Dashboard page: `p-6 md:p-8`, grid `gap-4` / `gap-6`

## Компоненты (shadcn)

| Компонент | Путь | Использование |
|-----------|------|----------------|
| Button | `components/ui/button.tsx` | Действия в header / алертах |
| Card | `components/ui/card.tsx` | KPI, алерты, операции |
| Badge | `components/ui/badge.tsx` | Severity, delta KPI |
| AppShellNav | `components/app-shell-nav.tsx` | Sidebar + `aria-current` |

## Dashboard layout (`/dashboard`)

1. **Header** — заголовок, подзаголовок, CTA «Экспорт»
2. **KPI row** — 4 метрики: загрузка залов, выручка, маржа, алерты склада
3. **2-col (xl)** — критические алерты (3/5) + операции сегодня (2/5)

Mock data: `modules/dashboard/mock-kpis.ts` (не в UI-компонентах).

## Доступность

- Семантика: `h1` на странице, `section` + `aria-labelledby`, `sr-only` для KPI grid title
- Focus: `focus-visible:ring` на nav links и кнопках
- Контраст: foreground/muted-foreground на warm background проверять при смене accent

## Переключение темы

```html
<html class="dark"> … </html>
```

По умолчанию светлая тёплая тема; для ночной смены — `dark` на root.
