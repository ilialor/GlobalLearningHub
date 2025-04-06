# Ручной процесс деплоя на Vercel

Поскольку автоматический деплой на Vercel не работает как ожидалось, следуйте этому пошаговому руководству для ручного деплоя:

## 1. Подготовка деплоя в Windows (PowerShell)

### Перед началом убедитесь, что скрипты `build:frontend` и `build:api` присутствуют в package.json:

```json
"scripts": {
  "dev": "tsx server/index.ts",
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=api",
  "build:frontend": "vite build",
  "build:api": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=api",
  "vercel-build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=.vercel/output/functions/api",
  "start": "NODE_ENV=production node dist/index.js",
  "check": "tsc",
  "db:push": "drizzle-kit push"
}
```

### Шаги развертывания:

```powershell
# Очистка предыдущих сборок
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue dist
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue api
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .vercel/output

# Создание необходимых директорий
New-Item -ItemType Directory -Force -Path .vercel/output/static
New-Item -ItemType Directory -Force -Path .vercel/output/functions/api.func

# Сборка фронтенда
npm run build:frontend

# Копирование статических файлов
Copy-Item -Path dist/public/* -Destination .vercel/output/static/ -Recurse -Force

# Сборка API
npm run build:api
Copy-Item -Path api/* -Destination .vercel/output/functions/api.func/ -Recurse -Force

# Создание конфигурации для API функции
$apiConfig = @{
    runtime = "nodejs22.x";
    handler = "index.js";
    launcherType = "Nodejs"
}
$apiConfig | ConvertTo-Json | Set-Content -Path .vercel/output/functions/api.func/.vc-config.json

# Создание общей конфигурации вывода
$outputConfig = @{
    version = 3;
    routes = @(
        @{
            src = "/api/(.*)";
            dest = "/api"
        },
        @{
            handle = "filesystem"
        },
        @{
            src = "/(.*)";
            dest = "/index.html"
        }
    )
}
$outputConfig | ConvertTo-Json -Depth 4 | Set-Content -Path .vercel/output/config.json
```

## 1b. Подготовка деплоя в Linux/macOS (Bash)

```bash
# Очистка предыдущих сборок
rm -rf dist api .vercel/output

# Создание необходимых директорий
mkdir -p .vercel/output/static
mkdir -p .vercel/output/functions/api.func

# Сборка фронтенда
npm run build:frontend

# Копирование статических файлов
cp -r dist/public/* .vercel/output/static/

# Сборка API
npm run build:api
cp -r api/* .vercel/output/functions/api.func/

# Создание конфигурации для API функции
echo '{
  "runtime": "nodejs18.x",
  "handler": "index.js",
  "launcherType": "Nodejs"
}' > .vercel/output/functions/api.func/.vc-config.json

# Создание общей конфигурации вывода
echo '{
  "version": 3,
  "routes": [
    { "src": "/api/(.*)", "dest": "/api" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}' > .vercel/output/config.json
```

## 2. Деплой на Vercel

После подготовки локальной сборки:

```bash
# Используйте Vercel CLI для деплоя
vercel deploy --prebuilt
```

Флаг `--prebuilt` указывает Vercel использовать уже подготовленные файлы из директории `.vercel/output`.

## Устранение возможных проблем

### Если у вас ошибка в PowerShell при создании хеш-таблиц:

Есть два способа объявить хеш-таблицу в PowerShell:

1. Используя точку с запятой между свойствами:
```powershell
$apiConfig = @{ runtime = "nodejs18.x"; handler = "index.js"; launcherType = "Nodejs" }
```

2. Записывая каждое свойство на новой строке:
```powershell
$apiConfig = @{
    runtime = "nodejs18.x"
    handler = "index.js"
    launcherType = "Nodejs"
}
```

### Если файлы не копируются правильно:

Проверьте пути к файлам после сборки:
1. После `npm run build:frontend` убедитесь, что файлы находятся в `dist/public/`
2. После `npm run build:api` проверьте, что файлы находятся в `api/`

Выполните команду для проверки статических файлов:
```powershell
# PowerShell
Get-ChildItem -Path dist/public -Recurse | Select-Object -First 5
```

```bash
# Bash
ls -la dist/public | head -n 5
```

### Если путь к директории не существует:

Измените путь в команде копирования в соответствии с реальной структурой проекта.

## 3. Альтернативный подход: отдельные сервисы

Если проблема сохраняется, рассмотрите вариант с разделением на два отдельных сервиса в Vercel:

1. **Фронтенд** - статический сайт:
   ```bash
   # В директории проекта
   cd client
   npm run build
   vercel deploy --prod
   ```

2. **Бэкенд** - Serverless API:
   ```bash
   # В директории проекта
   cd server
   vercel deploy --prod
   ```

В этом случае вам потребуется настроить CORS и переменные окружения для каждого сервиса отдельно.

## 4. Другие альтернативы хостинга

Если Vercel продолжает вызывать проблемы:

- **Netlify** - хорошая альтернатива для полного стека
- **Railway** - простой в настройке PaaS
- **Render** - удобный сервис для статических сайтов и API