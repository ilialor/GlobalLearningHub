# Анализ и исправление ошибок при деплое на Vercel

## Выявленные проблемы

1. **Ошибка 404**: Проект не разворачивается, и нет логов рантайма.
2. **Неправильная конфигурация сборки**: Настройки сборки должны быть явно определены в `vercel.json`.
3. **Включение ненужных файлов**: В сборку попали скриншоты и другие лишние ресурсы.

## Новая проблема: Vercel не выполняет реальную сборку

Анализ логов деплоя показал:
```
[14:50:41.050] Build Completed in /vercel/output [126ms]
```

Это указывает на то, что реальная сборка (npm run build) не выполняется. Сборка в 126мс слишком быстрая для React+Node приложения.

### Решение:

1. Полностью переработан `vercel.json`:
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "builds": [
    { "src": "package.json", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/dist/public/index.html" }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

2. Изменен скрипт сборки в `package.json` для правильной последовательности действий:
```json
"build": "rm -rf dist api && vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=api && cp -r ./*.json ./api/ && rm -rf ./api/attached_assets"
```

Этот скрипт:
- Очищает предыдущие сборки
- Собирает frontend с помощью Vite
- Собирает backend с помощью esbuild
- Копирует необходимые JSON-файлы в директорию API
- Удаляет директорию attached_assets из сборки

## Исправления

### 1. Полная переработка файла vercel.json

Обновлен файл `vercel.json` с явным указанием всех настроек:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "builds": [
    { "src": "package.json", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/dist/public/index.html" }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

Основные изменения:
- Упрощена конфигурация builds для принудительного запуска скрипта в package.json
- Добавлен обработчик статических файлов с помощью `"handle": "filesystem"`
- Исключены лишние настройки, которые могли конфликтовать

### 2. Улучшение скрипта сборки

Файл `package.json` изменен для улучшения процесса сборки:

```json
"build": "rm -rf dist api && vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=api && cp -r ./*.json ./api/ && rm -rf ./api/attached_assets"
```

Это обеспечивает:
- Очистку старых сборок
- Правильную последовательность шагов
- Исключение ненужных файлов из конечной сборки

### 3. Исключение ненужных файлов из деплоя

Директория `attached_assets` теперь исключается прямо во время сборки, что более надежно, чем полагаться на `.vercelignore`.

## Заключение

Эти изменения должны устранить проблемы с деплоем на Vercel, обеспечивая:
1. Правильное выполнение всего процесса сборки
2. Корректную маршрутизацию запросов
3. Исключение ненужных файлов из сборки
4. Улучшенную обработку ошибок 