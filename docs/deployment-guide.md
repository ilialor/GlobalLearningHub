# Руководство по деплою GlobalLearningHub на Vercel

Это руководство описывает процесс развертывания проекта GlobalLearningHub на платформе Vercel.

## Предварительные требования

1. Учетная запись на [Vercel](https://vercel.com)
2. Установленный [Node.js](https://nodejs.org/) (v20.x или выше)
3. Доступ к репозиторию проекта
4. Ключ API для OpenAI
5. База данных PostgreSQL (например, Neon, Supabase)

## Шаги по деплою

### 1. Подготовка проекта

Проект уже настроен для деплоя на Vercel с соответствующими конфигурационными файлами:
- `vercel.json` - содержит настройки для платформы Vercel
- В `package.json` определены скрипты сборки
- Созданы необходимые адаптеры для Serverless Functions

### 2. Настройка базы данных

1. Создайте базу данных PostgreSQL через выбранный сервис (Neon, Supabase и т.д.)
2. Сохраните строку подключения - она понадобится для настройки переменных окружения

### 3. Деплой через Vercel CLI

**Пошаговый процесс деплоя через Vercel CLI:**

1. **Установка Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Вход в учетную запись:**
   ```bash
   vercel login
   ```

3. **Выполнение деплоя:**
   Перейдите в корневую директорию проекта и выполните:
   ```bash
   vercel
   ```

4. **Ответьте на вопросы Vercel CLI:**
   ```
   ? Set up and deploy "[путь к проекту]"? (y/N) y
   ? Which scope should contain your project? [выберите свой аккаунт/организацию]
   ? Link to existing project? (y/N) n
   ? What's your project's name? academy-online (или другое название)
   ? In which directory is your code located? ./
   ```
   
   > **Важно**: Когда Vercel спрашивает о директории с кодом, укажите `./` (корневая директория проекта), а **не** `./dist/public`, так как это директория будет создана во время сборки.

5. **Настройка параметров проекта:**
   Vercel покажет обнаруженные настройки из vercel.json:
   ```
   Local settings detected in vercel.json:
   - Build Command: npm run build
   - Output Directory: dist/public
   - Development Command: ...
   - Install Command: npm install
   ```

   На вопрос о модификации настроек:
   ```
   ? Want to modify these settings? (y/N)
   ```
   
   Обычно нужно выбрать "n", так как настройки уже определены в vercel.json.

   Если выбрали "y", то появится список настроек для редактирования:
   ```
   ? Which settings would you like to overwrite? [выберите опции с помощью пробела]
   ```

6. **После запуска деплоя**, Vercel будет выполнять:
   - Клонирование репозитория
   - Установку зависимостей (`npm install`)
   - Запуск сборки (`npm run build`)
   - Развертывание готового проекта

7. **Успешный деплой:**
   После завершения процесса вы увидите примерно такой вывод:
   ```
   🔗 Linked to [organization]/[project-name] (created .vercel and added it to .gitignore)
   🔍 Inspect: https://vercel.com/[organization]/[project-name]/[deployment-id] [время]
   ✅ Production: https://[project-name]-xxxx.vercel.app [время]
   ```

### 4. Настройка переменных окружения

После первого деплоя необходимо настроить переменные окружения:

1. **Через Веб-интерфейс Vercel:**
   - Перейдите в панель управления Vercel
   - Выберите ваш проект
   - Перейдите в раздел "Settings" > "Environment Variables"
   - Добавьте следующие переменные:

   | Имя переменной | Описание | Пример значения |
   |----------------|----------|----------------|
   | `DATABASE_URL` | Строка подключения к PostgreSQL | `postgresql://user:password@neon.tech/db` |
   | `OPENAI_API_KEY` | Ключ API для OpenAI | `sk-...` |
   | `BLOB_READ_WRITE_TOKEN` | Токен для Vercel Blob Storage | `vercel_blob_rw_...` |

2. **Через Vercel CLI:**
   ```bash
   vercel env add DATABASE_URL
   vercel env add OPENAI_API_KEY
   vercel env add BLOB_READ_WRITE_TOKEN
   ```

   После добавления всех переменных выполните редеплой:
   ```bash
   vercel --prod
   ```

### 5. Миграция базы данных

После настройки переменных окружения нужно выполнить миграцию базы данных:

1. **Через Vercel CLI:**
   ```bash
   vercel run db:push
   ```
   
   Или через Vercel Console в панели управления проектом (раздел "Deployments" > выберите последний деплой > "Functions Console").

### 6. Проверка деплоя

После успешного деплоя:

1. Откройте URL проекта (предоставленный Vercel в формате `https://[project-name]-xxxx.vercel.app`)
2. Проверьте доступность frontend-части
3. Протестируйте API-эндпоинты (например, `/api/courses`)
4. Убедитесь, что взаимодействие с базой данных работает корректно

## Альтернативный метод: Деплой через Git

1. **В панели управления Vercel:**
   - Нажмите "Add New..." > "Project"
   - Подключите свой GitHub/GitLab репозиторий
   - Выберите репозиторий с проектом

2. **Настройте параметры проекта:**
   - Framework Preset: "Other" (или оставьте автоопределение)
   - Root Directory: `./` (корневая директория проекта)
   - Build Command: `npm run build`
   - Output Directory: `dist/public`

3. **Добавьте переменные окружения**
   - Раздел "Environment Variables"
   - Добавьте те же переменные, что указаны выше

4. **Нажмите "Deploy"**

## Устранение неполадок

### Проблема: Ошибка при указании директории `./dist/public`

**Ошибка:**
```
Error: The provided path "[путь]\dist\public" does not exist. Please choose a different one.
```

**Решение**: 
- При вопросе "In which directory is your code located?" всегда указывайте `./` (корневая директория проекта)
- Директория `dist/public` создается в процессе сборки и указывается в `vercel.json` как `outputDirectory`

### Проблема: Ошибки 404 при обращении к API

**Решение**: 
- Проверьте правильность конфигурации путей в `vercel.json`
- Убедитесь, что файл `api/index.js` корректно собран
- Проверьте логи через `vercel logs [deployment-url]`

### Проблема: Ошибки при взаимодействии с базой данных

**Решение**: 
1. Проверьте, правильно ли указана переменная окружения `DATABASE_URL`
2. Убедитесь, что выполнена миграция базы данных
3. Проверьте, что IP-адрес Vercel разрешен в настройках базы данных (для Neon/Supabase)

## Полезные команды Vercel CLI

```bash
# Просмотр списка деплоев
vercel ls

# Просмотр логов
vercel logs [deployment-url]

# Локальная разработка с окружением Vercel
vercel dev

# Принудительный повторный деплой
vercel --force

# Переключение между Production/Preview/Development
vercel --prod
vercel --preview
vercel --dev
```

## Полезные ссылки

- [Документация Vercel](https://vercel.com/docs)
- [Работа с Serverless Functions](https://vercel.com/docs/functions)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Vercel PostgreSQL](https://vercel.com/docs/storage/vercel-postgres) 