# Lesya Svet

## Развертывание на VPS с использованием GitHub

### Подготовка к деплою

#### Предварительные требования

1. VPS с операционной системой Ubuntu/Debian
2. Установленные Docker и Docker Compose
3. Зарегистрированный домен (например, lesyasvet.ru)
4. Открытые порты 80 и 443 на VPS
5. SSL-сертификаты для домена

#### Настройка DNS

1. В панели управления доменом убедитесь, что A-записи указывают на IP-адрес вашего VPS:
   - А-запись для корневого домена (@) указывает на IP вашего сервера
   - А-запись для поддомена www указывает на IP вашего сервера
2. Дождитесь обновления DNS (может занять до 24 часов)

### Ручной деплой через GitHub и архив

#### Шаг 1: Подготовка репозитория на GitHub

1. Создайте репозиторий на GitHub (или используйте существующий)
2. Загрузите код проекта в репозиторий, исключая большие файлы

#### Шаг 2: Подготовка архива для больших файлов

1. Соберите приложение локально:
   ```bash
   npm ci
   npm run build
   ```

2. Создайте пакет для деплоя:
   ```bash
   mkdir -p deploy-package
   cp -r .next deploy-package/
   cp -r public deploy-package/
   cp -r prisma deploy-package/
   cp package.json package-lock.json next.config.js deploy-package/
   mkdir -p deploy-package/src
   cp src/env.js deploy-package/src/
   cp Dockerfile.production deploy-package/Dockerfile
   cp docker-compose.yml deploy-package/
   cp deploy.sh deploy-package/
   cp .env.production deploy-package/
   ```

3. Создайте TAR архив и отправьте его на сервер:
   ```bash
   tar -czvf deploy-package.tar.gz deploy-package
   scp deploy-package.tar.gz root@45.91.8.162:~/
   ```

#### Шаг 3: Подключение к серверу

1. Подключитесь к VPS через SSH:
   ```bash
   ssh root@45.91.8.162
   ```

2. Установите необходимые компоненты:
   ```bash
   apt-get update
   apt-get install -y git docker.io docker-compose
   ```

#### Шаг 4: Подготовка к деплою

1. Если вы клонируете репозиторий (опционально):
   ```bash
   git clone https://github.com/wastless/svet.git
   cd svet
   ```

2. Если вы используете только архив:
   ```bash
   # Архив должен находиться в домашнем каталоге или там, где вы его разместили
   tar -xzvf deploy-package.tar.gz
   ```

#### Шаг 5: Настройка окружения и сертификатов

1. Убедитесь, что файл .env.production существует:
   ```bash
   # Если вы не включили .env.production в архив:
   nano deploy-package/.env.production
   ```

   Содержимое файла должно выглядеть примерно так:
   ```
   # Next Auth
   AUTH_SECRET="ваш_секретный_ключ_здесь"
   
   # Prisma
   DATABASE_URL="postgres://postgres:надежный_пароль@db:5432/lesya_svet_db"
   DIRECT_URL="postgres://postgres:надежный_пароль@db:5432/lesya_svet_db"
   
   # Yandex Object Storage
   YANDEX_ACCESS_KEY_ID="ваш_ключ_доступа_yandex_cloud"
   YANDEX_SECRET_ACCESS_KEY="ваш_секретный_ключ_yandex_cloud"
   YANDEX_BUCKET_NAME="lesyasvet"
   
   # База данных
   DB_PASSWORD="надежный_пароль"
   DB_NAME="lesya_svet_db"
   ```

2. Создайте директории для Nginx и подготовьте SSL-сертификаты:
   ```bash
   mkdir -p deploy-package/nginx/ssl
   mkdir -p deploy-package/nginx/logs
   mkdir -p deploy-package/nginx/conf.d
   ```

3. Загрузите ваши SSL-сертификаты в папку nginx/ssl:
   ```bash
   # Создайте сертификаты
   nano deploy-package/nginx/ssl/certificate.crt  # Скопируйте основной сертификат
   nano deploy-package/nginx/ssl/certificate.key  # Скопируйте ключ сертификата
   
   # Убедитесь, что права доступа к файлам настроены правильно
   chmod 644 deploy-package/nginx/ssl/certificate.crt
   chmod 600 deploy-package/nginx/ssl/certificate.key
   ```

4. Создайте конфигурацию Nginx:
   ```bash
   nano deploy-package/nginx/conf.d/default.conf
   ```
   
   Пример содержимого:

5. Сделайте скрипты исполняемыми:
   ```bash
   chmod +x deploy-package/*.sh
   ```

#### Шаг 6: Запуск приложения

1. Перейдите в директорию deploy-package:
   ```bash
   cd deploy-package
   ```

2. Запустите скрипт развертывания:
   ```bash
   ./deploy.sh ваш_домен
   ```

   Этот скрипт:
   - Экспортирует переменные окружения из .env.production
   - Устанавливает необходимые зависимости
   - Запускает Docker-контейнеры
   - Применяет миграции Prisma к базе данных

3. Проверьте статус контейнеров:
   ```bash
   docker-compose ps
   ```

   Все контейнеры должны быть в состоянии "Up"

### Проверка работоспособности и устранение неполадок

1. Откройте ваш домен в браузере: https://ваш_домен

2. Если приложение недоступно, проверьте логи:
   ```bash
   # Логи приложения Next.js
   docker-compose logs app
   
   # Логи Nginx
   docker-compose logs nginx
   
   # Логи базы данных
   docker-compose logs db
   ```

3. Частые проблемы:
   - "Cannot stat '.env.production'" - убедитесь, что вы создали файл .env.production в папке deploy-package
   - "SSL-сертификаты не найдены" - убедитесь, что вы создали файлы certificate.crt и certificate.key в папке nginx/ssl

### Обновление приложения

Для обновления приложения после внесения изменений:

1. Обновите код в GitHub репозитории
2. Соберите новый deploy-package и загрузите на сервер
3. Повторите шаги деплоя

### Резервное копирование базы данных

1. Создание резервной копии:
   ```bash
   docker-compose exec db pg_dump -U postgres -d $DB_NAME > backup_$(date +%Y%m%d).sql
   ```

2. Восстановление из резервной копии:
   ```bash
   docker-compose exec -T db psql -U postgres -d $DB_NAME < backup_filename.sql
   ```
