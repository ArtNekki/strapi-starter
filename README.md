# Strapi Starter

[Русский](README.md) | [English](README.en.md)

## Описание

Проект использует **SQL LIte** для локальной разработки, **PostgreSQL** для разработки в Docker и **Doppler** для управления переменными окружения.
Реализован деплой как на продакшн сервер, так и на тестовый сервер.

## Навигация

1. [Подготовка проекта к запуску](#подготовка-проекта-к-запуску)

- [Локально](#1-локально)
- [GitHub настройки](#2-github-настройки)
- [Doppler настройки](#3-doppler-настройки)

2. [Запуск проекта](#запуск-проекта)

- [Локально](#локально-1)
- [В Docker](#в-docker)

3. [Управление переменными окружения через Doppler](#управление-переменными-окружения-через-doppler)

- [Установка](#установка)
- [Подключение к проекту](#подключение-к-проекту)
- [Получение секрета](#получение-секрета)

4. [Процесс работы с ветками в Git](#процесс-работы-с-ветками-в-git)
5. [Работа с тегами](#работа-с-тегами)
6. [Дополнительные команды для работы с Git](#дополнительные-команды-для-работы-с-git)

- [Удаление веток](#удаление-веток)
- [Обновление информации о ветках](#обновление-информации-о-ветках)

7. [Тестирование проекта](#тестирование-проекта)
8. [Работа с базой данных](#работа-с-базой-данных)
9. [Генерация ключей для Strapi](#генерация-ключей-для-strapi)
10. [Миграция данных](#миграция-данных)
11. [Подключение к VPS](#подключение-к-vps)
12. [Добавление домена](#добавление-домена)

## Подготовка проекта к запуску

### 1. Локально

- Склонировать проект на свой компьютер:
  - `https://github.com/ArtNekki/strapi-starter.git`
- Перейти в проект и установить зависимости:
  - `npm ci`
- В проекте активировать ветку `develop`:
  - `git checkout develop`

### 2. GitHub настройки

- Перейти в проект на `github.com`
- Перейти в `Settings` -> `Branches` и создать для веток `main` и `develop` protection rules:

  - `Require a pull request before merging` (вложенные настройки не нужны)
  - `Require status checks to pass before merging`:
    - `Require branches to be up to date before merging`:
      - `build-and-test` (до первого pull request может не быть)
      - `security-scan` (до первого pull request может не быть)
      - `docker-build` (до первого pull request может не быть)

- Перейти в `Settings` -> `Secrets and Variables` -> `Actions`:

  - В `Repository secrets` указать секреты:
    - `DOCKER_USERNAME`
    - `DOCKER_PASSWORD`
  - В `Repository variables` указать переменные:
    - `PROJECT_NAME`
    - `S3_URL`

- Перейти в `Settings` -> `Environments`:
  - Создать два окружения `production` и `staging`
- Перейти в `Settings` -> `Actions` -> `Workflow permissions`:
  - Установить `Read and write permissions`
  - Установить `Allow GitHub Actions to create and approve pull requests`

### 3. Doppler настройки

- Зарегистрироваться на [doppler.com](https://www.doppler.com/)
- Создать workspace
- Создать проект
- В проекте добавить переменные окружения для необходимых environments
- Перейти в `Integrations` и синхронизировать environments с проектом на GitHub и соответствующими environments в нем

#### Варианты окружений

| dev_local         | dev               | stage             | prod              |
| ----------------- | ----------------- | ----------------- | ----------------- |
| Strapi            | Strapi            | Strapi            | Strapi            |
| SQL Lite          | PostgreSQL        | PostgreSQL        | PostgreSQL        |
| Cloudinary plugin | Cloudinary plugin | Cloudinary plugin | Cloudinary plugin |
| Email plugin      | Email plugin      | Email plugin      | Email plugin      |
|                   |                   | Deploy            | Deploy            |
|                   |                   | Backup to S3      | Backup to S3      |

#### Детали окружения

| Категория         | Параметр                         | Значение                    |
| ----------------- | -------------------------------- | --------------------------- |
| Strapi            | ADMIN_JWT_SECRET                 | (string)                    |
|                   | API_TOKEN_SALT                   | (string)                    |
|                   | APP_KEYS                         | (string)                    |
|                   | JWT_SECRET                       | (string)                    |
|                   | TRANSFER_TOKEN_SALT              | (string)                    |
|                   | STRAPI_URL                       | http://**.\***.**_._**:1337 |
| SQL Lite          | DATABASE_CLIENT                  | sqlite                      |
|                   | DATABASE_FILENAME                | .tmp/data.db                |
| PostgreSQL        | DATABASE_CLIENT                  | postgres                    |
|                   | DATABASE_HOST                    | localhost                   |
|                   | DATABASE_NAME                    | strapi                      |
|                   | DATABASE_PASSWORD                | (string)                    |
|                   | DATABASE_PORT                    | 5432                        |
|                   | DATABASE_SSL                     | false                       |
|                   | DATABASE_USERNAME                | strapi                      |
| Deploy            | SSH_HOST                         | **.\***.**_._**             |
|                   | SSH_KEY                          | (string)                    |
|                   | SSH_PASSPHRASE                   | (string)                    |
|                   | SSH_USER                         | root                        |
| Backup to S3      | KNOWN_HOSTS                      | (string)                    |
|                   | S3_BUCKET_NAME                   | (string)                    |
|                   | AWS_ACCESS_KEY_ID                | (string)                    |
|                   | AWS_SECRET_ACCESS_KEY            | (string)                    |
| Database SSL      | DATABASE_SSL                     | true                        |
|                   | DATABASE_SSL_REJECT_UNAUTHORIZED | true                        |
| Email Plugin      | EMAIL_ADDRESS_FROM               | "sales@example.ru"          |
|                   | EMAIL_ADDRESS_REPLY              | "no_reply@example.ru"       |
|                   | EMAIL_PROVIDER                   | "nodemailer"                |
|                   | SMTP_HOST                        | "smtp.timeweb.ru"           |
|                   | SMTP_PASSWORD                    | (string)                    |
|                   | SMTP_PORT                        | "25"                        |
|                   | SMTP_USERNAME                    | "sales@example.ru"          |
| Cloudinary Plugin | CLOUDINARY_KEY                   | (string)                    |
|                   | CLOUDINARY_NAME                  | (string)                    |
|                   | CLOUDINARY_SECRET                | (string)                    |

### 4. Подготовка завершена!

## Запуск проекта

### Локально

- `./run.sh local`

### В Docker

- `./run.sh dev|stage|prod` (по умолчанию `dev`, можно не указывать)

## Управление переменными окружения через Doppler

### Установка

1. **Установка gnupg для проверки подписи бинарных файлов:**

- `brew install gnupg`

2. **Установка Doppler CLI:**

- `brew install dopplerhq/cli/doppler`

### Подключение к проекту

1. **Авторизация в Doppler:**

- `doppler login`

2. **Выбор конфига:**

- `doppler setup`

3. **Запуск команды, например, `npm run develop`:**

- `doppler run --config dev|stage|prod npm run develop`

### Получение секрета

- `doppler secrets get 'SOME_SECRET' --plain`

## Процесс работы с ветками в Git

1. **Создание feature-ветки от ветки `develop`**

- Например, `git checkout -b feature/new-feature`
- В этой ветке реализуется необходимый функционал

2. **Отправка данных в GitHub после завершения работы**

- `git commit -m "feat(new-feature): Create new feature"`
- `git push origin -u feature/new-feature`

3. **Создание pull-request в ветку `develop`**

- После подтверждения pull-request происходит деплой на ТЕСТОВЫЙ сервер

4. **Переход в локальную ветку `develop` для дальнейшей разработки**

- `git checkout develop`
- Получение данных из удаленной ветки `develop`: `git pull`

5. **Создание новой feature-ветки для реализации новой задачи**

6. **Создание pull-request из ветки `develop` в ветку `main` для релиза**

7. **Переход в локальную ветку `main` и получение данных**

- `git pull`

8. **Создание тега для релиза**

- Например, `git tag -a v1.0.0 -m "Release version 1.0.0"`

9. **Пуш тега и деплой на PRODUCTION сервер**

- `git push origin v1.0.0`

10. **Обновление ветки `develop` после создания релиза**

- Переход в ветку `develop`: `git checkout develop`
- Проверка неполученных данных: `git pull`
- Объединение с веткой `main`: `git merge origin/main`

11. **Продолжение разработки**

## Работа с тегами

1. **Создание легковесного тега:**

- `git tag v1.0.0`

2. **Создание аннотированного тега (рекомендуется для релизов):**

- `git tag -a v1.0.0 -m "Release version 1.0.0"`
  - Флаг `-a` создает аннотированный тег, а `-m` позволяет добавить сообщение.

3. **Создание тега для определенного коммита:**

- `git tag -a v1.0.0 9fceb02 -m "Release version 1.0.0"`

4. **Отправка тега в удаленный репозиторий:**

- `git push origin v1.0.0`

5. **Просмотр существующих тегов:**

- `git tag`

6. **Просмотр информации о конкретном теге:**

- `git show v1.0.0`

7. **Удаление локального тега:**

- `git tag -d v1.0.0`

8. **Удаление удаленного тега:**

- `git push origin :refs/tags/v1.0.0`

9. **Удаление локального и удаленного тега:**

- `git push origin --delete v1.0.0`

## Дополнительные команды для работы с Git

### Удаление веток

- **Удалить удаленную ветку с именем "feature-branch":**

  - `git push origin --delete feature-branch`

- **Удалить соответствующую локальную ветку:**
  - `git branch -d <имя_ветки>`

### Обновление информации о ветках

- **Обновить информацию о удаленных ветках и удалить ссылки на несуществующие ветки:**
  - `git fetch --all --prune`

## Тестирование проекта

- Запуск тестов `npm run test`

## Работа с базой данных

- **Подключение к контейнеру с PostgreSQL:**

  - `docker exec -it docker_db_container_name bash`

- **Вход в PostgreSQL:**

  - `psql -U $DATABASE_USERNAME -d $DATABASE_NAME`

- **Просмотр списка пользователей:**

  - `\du`

- **Изменение пароля пользователя:**

  - `ALTER USER username WITH PASSWORD 'new_password'`

- **Выход из psql:**

  - `\q`

- **Выход из контейнера:**

  - `exit`

## Генерация ключей для Strapi

`generate-keys.js`

## Миграция данных

`./migrate.sh --help (для справки)`

## Подключение к VPS

`./ssh-connect.sh stage|prod`

## Добавление домена

- Перейти в корень проекта удаленного сервера
- Создать директорию `nginx`
- Настроить Nginx Proxy Manager, следуя инструкциям на сайте:
  - [Nginx Proxy Manager Guide](https://nginxproxymanager.com/guide/)
