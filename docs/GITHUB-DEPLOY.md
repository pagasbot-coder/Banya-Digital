# GitHub и Vercel — ручные шаги

Автоматический push/deploy в этой среде недоступен (`gh` и `vercel` CLI не установлены). Выполните локально после пробуждения.

## GitHub

### 1. Установить GitHub CLI (опционально)

https://cli.github.com/ — затем `gh auth login`.

### 2. Создать репозиторий и запушить

```powershell
cd d:\curorproject\banya-digital

# если remote ещё нет:
git remote add origin https://github.com/pagasbot-coder/Banya-Digital.git

# или через gh:
# gh repo create pagasbot-coder/Banya-Digital --private --source=. --remote=origin --push

git push -u origin master
```

**Не коммитьте** `.env` — он в `.gitignore`.

### 3. Проверка

Откройте https://github.com/pagasbot-coder/Banya-Digital (или ваш URL).

## Vercel

### 1. Установить CLI

```powershell
npm i -g vercel
vercel login
```

### 2. Подключить проект

```powershell
cd d:\curorproject\banya-digital
vercel link
vercel env add DATABASE_URL   # строка Neon/Supabase PostgreSQL
vercel --prod
```

В дашборде Vercel → **Settings → Environment Variables**:

| Переменная | Значение |
|------------|----------|
| `DATABASE_URL` | `postgresql://...` (Neon, Supabase или Vercel Postgres) |

После первого деплоя выполните миграции/seed **один раз** (Neon SQL или локально с prod URL):

```powershell
$env:DATABASE_URL="postgresql://..."
npm run db:push
npm run db:seed
```

### 3. Альтернатива без CLI

1. https://vercel.com/new — Import Git Repository `Banya-Digital`
2. Root Directory: `.` (корень репозитория)
3. Framework Preset: **Next.js**
4. Build Command: `npm run build` (уже в `vercel.json`)
5. Добавить `DATABASE_URL` → Deploy

Публичный URL появится в Vercel Dashboard после успешного билда.
