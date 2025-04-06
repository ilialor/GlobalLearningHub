# Анализ и исправление ошибок при деплое на Vercel

## Выявленные проблемы

1. **Ошибка 404**: Проект не разворачивается, и нет логов рантайма.
2. **Неправильная конфигурация сборки**: Настройки сборки должны быть явно определены в `vercel.json`.
3. **Включение ненужных файлов**: В сборку попали скриншоты и другие лишние ресурсы.

## Исправления

### 1. Полная переработка файла vercel.json

Обновлен файл `vercel.json` с явным указанием всех настроек:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": "dist/public",
  "builds": [
    { "src": "package.json", "use": "@vercel/node" },
    { "src": "dist/public/**/*", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "src": "/(.*\\.(js|css|svg|png|jpg|jpeg|gif|ico|json|woff|woff2|ttf|eot))", "dest": "/dist/public/$1" },
    { "src": "/(.*)", "dest": "/dist/public/index.html" }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "public": false,
  "cleanUrls": true,
  "trailingSlash": false,
  "regions": ["all"],
  "github": {
    "enabled": true,
    "silent": false
  },
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

Основные изменения:
- Добавлен параметр `version: 2` для использования новейшей версии API Vercel
- Добавлена конфигурация `builds` для определения билдеров
- Улучшена конфигурация маршрутов для правильной обработки статических файлов и API
- Добавлены настройки для GitHub-интеграции

### 2. Улучшение адаптера серверных функций

Файл `api/index.js` переработан для лучшей обработки ошибок:

```javascript
// Adapter for Vercel Serverless Functions
import app from '../server/index.js';

// Handler for Vercel serverless environment with enhanced error handling
export default async function handler(req, res) {
  try {
    // Pass the request to the Express app
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    
    // Return proper error response if Express doesn't handle it
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  }
}
```

Это обеспечивает:
- Правильную обработку исключений
- Логирование ошибок сервера
- Предотвращение "зависания" запросов

### 3. Исключение ненужных файлов из деплоя

В `.gitignore` добавлено:
```
**/attached_assets/**
```

Рекомендуется также создать файл `.vercelignore` со следующим содержимым:
```
attached_assets
docs
.git
```

### 4. Рекомендации по диагностике проблем

1. **Проверка логов**:
   - Используйте команду `vercel logs <deployment-url>` для просмотра логов
   - Проверьте вкладку "Functions" в панели управления Vercel

2. **Локальное тестирование**:
   - Используйте `vercel dev` для локальной проверки деплоя

3. **Инкрементальный деплой**:
   - Сначала проверьте работу только статической части
   - Затем добавьте серверную часть

## Заключение

Эти изменения должны устранить проблемы с деплоем на Vercel, обеспечивая:
1. Правильную конфигурацию сборки
2. Корректную маршрутизацию запросов
3. Исключение ненужных файлов из сборки
4. Улучшенную обработку ошибок 