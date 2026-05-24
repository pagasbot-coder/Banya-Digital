# Design Tokens — Дегтярные Бани / d1a.ru

_Референс: [d1a.ru](https://d1a.ru/) — премиум банный комплекс, тёплая классика._

## Бренд

- **Название в UI:** Дегтярные Бани · ERP
- **Тон:** тёплые нейтрали, золотой акцент, без холодного «tech SaaS»

## Цвета (Tailwind / CSS variables)

| Роль | Значение | Примечание |
|------|----------|------------|
| `--background` | `oklch(0.985 0.008 85)` | кремовый фон |
| `--foreground` | `oklch(0.28 0.02 55)` | тёмно-коричневый текст |
| `--accent` | `oklch(0.72 0.11 75)` | золото / латунь (кнопки, метки) |
| `--primary` | `oklch(0.32 0.03 55)` | глубокий коричневый |
| `--sidebar` | `oklch(0.97 0.01 82)` | светлая панель навигации |
| `--destructive` | `oklch(0.55 0.2 25)` | алерты, низкая маржа |

Порог маржи в dashboard: **40%** — ниже → алерт «Высокий».

## Типографика

| Роль | Шрифт | Источник |
|------|-------|----------|
| Заголовки (`font-heading`) | **Cardo** | Google Fonts — на d1a.ru в WP preset `--font-family--cardo` |
| UI / body (`font-sans`) | **Inter** | Google Fonts — основной текст на d1a.ru |
| Fallback serif | Cormorant Garamond | если Cardo недоступен |

MuseoSans на сайте d1a — проприетарный; в ERP не подключаем, используем Inter.

## Spacing / радиусы

- `--radius`: `0.625rem` (10px) — мягкие карточки KPI
- Сетка dashboard: `gap-4` / `gap-6`, контейнер `p-6 md:p-8`

## Компоненты (shadcn)

- Card: `border-border/80 bg-card/95 shadow-sm`
- Sidebar link active: `bg-sidebar-accent` + золотой `text-accent` в шапке
- Badge trend up: `bg-accent/10`; down: `destructive`
