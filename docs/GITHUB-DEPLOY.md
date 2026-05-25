# GitHub и Vercel — деплой Banya-Digital

**Статус (2026-05-25):** `npm run build` проходит локально. Push на GitHub и Vercel prod **требуют вашей авторизации** (репозиторий на GitHub ещё не создан; `gh` / `vercel login` не выполнены в этой сессии).

## Что уже готово

- Git: ветка `master`, remote `origin` → `https://github.com/pagasbot-coder/Banya-Digital.git`
- `.env` в `.gitignore` — **не коммитить**
- Локально в `.env` настроен **Neon** (`DATABASE_URL`) — для Vercel нужна **та же** строка из Neon Console
- Production build: `npm run build` — OK

---

## 1. GitHub (5–10 минут)

### 1.1 GitHub CLI (рекомендуется)

Установка (если нет):

```powershell
winget install GitHub.cli
```

Перезапустите терминал, затем:

```powershell
gh auth login
```

Выберите: GitHub.com → HTTPS → Login with a web browser (или token).

### 1.2 Создать репозиторий и запушить

```powershell
cd d:\curorproject\banya-digital

# Создать публичный репо и сразу push (если репо ещё нет):
gh repo create pagasbot-coder/Banya-Digital --public --source=. --remote=origin --push

# Если репо уже создан вручную на github.com:
git push -u origin master
```

**Ошибка `Repository not found`:** репозиторий не существует или нет доступа — выполните `gh repo create` или создайте репо на https://github.com/new (имя `Banya-Digital`, owner `pagasbot-coder`), затем снова `git push`.

**Ошибка auth:** `gh auth login` или Personal Access Token с правом `repo`, затем:

```powershell
git remote set-url origin https://<TOKEN>@github.com/pagasbot-coder/Banya-Digital.git
git push -u origin master
```

### 1.3 Проверка

Откройте: **https://github.com/pagasbot-coder/Banya-Digital**

---

## 2. Vercel

### 2.1 CLI

```powershell
npm i -g vercel
cd d:\curorproject\banya-digital
vercel login
vercel link
vercel --prod --yes
```

Если в среде был невалидный `VERCEL_TOKEN`, сбросьте и войдите заново:

```powershell
Remove-Item Env:VERCEL_TOKEN -ErrorAction SilentlyContinue
vercel login
```

### 2.2 Переменные окружения (обязательно)

В [Vercel Dashboard](https://vercel.com) → проект → **Settings → Environment Variables** → **Production**:

| Переменная | Значение |
|------------|----------|
| `DATABASE_URL` | Строка подключения **Neon** — скопируйте из локального `.env` (Neon Console → Connection string). Пароль не публикуйте в чатах и коммитах. |
| `NEXT_PUBLIC_APP_URL` | URL production после первого деплоя, например `https://banya-digital.vercel.app` (ваш фактический домен из Vercel) |

Применить для: **Production** (и при желании Preview с тем же Neon или отдельной БД).

### 2.3 База после первого деплоя (один раз)

С prod `DATABASE_URL` (PowerShell):

```powershell
cd d:\curorproject\banya-digital
$env:DATABASE_URL = "<вставьте строку Neon из .env>"
npm run db:push
npm run db:seed
```

### 2.4 Без CLI (через сайт)

1. https://vercel.com/new → **Import Git Repository** → `pagasbot-coder/Banya-Digital`
2. Framework: **Next.js**, Root: `.`
3. Добавить `DATABASE_URL` → **Deploy**
4. После деплоя добавить `NEXT_PUBLIC_APP_URL` = production URL → **Redeploy**

Регион в `vercel.json`: `arn1` (близко к RU/EU).

---

## 3. Чеклист «утром»

- [ ] `gh auth login` + `gh repo create ... --push` или push вручную
- [ ] Репо виден на GitHub
- [ ] `vercel login` + import / `vercel --prod`
- [ ] В Vercel: `DATABASE_URL` (Neon, как в локальном `.env`)
- [ ] После деплоя: `NEXT_PUBLIC_APP_URL` = ваш Vercel URL → redeploy
- [ ] `npm run db:push` + `npm run db:seed` на prod БД

---

## 4. Устранение неполадок

| Симптом | Действие |
|---------|----------|
| `Repository not found` | Создать репо на GitHub или `gh repo create` |
| `gh` не найден | `winget install GitHub.cli`, новый терминал |
| `The specified token is not valid` (Vercel) | `Remove-Item Env:VERCEL_TOKEN`; `vercel login` |
| Страницы без данных на prod | Проверить `DATABASE_URL` в Vercel; выполнить seed |
| Build failed на Vercel | Локально `npm run build`; смотреть логи Deployments |

---

## Ссылки

- GitHub (целевой): https://github.com/pagasbot-coder/Banya-Digital
- Vercel New Project: https://vercel.com/new
- Neon Console: https://console.neon.tech
