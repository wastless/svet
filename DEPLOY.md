# Инструкция по развертыванию приложения на VPS

## Предварительные требования

1. VPS с операционной системой Ubuntu/Debian
2. Установленные Docker и Docker Compose
3. Зарегистрированный домен lesyasvet.ru
4. Открытые порты 80 и 443 на VPS
5. SSL-сертификаты для домена

## Шаг 1: Настройка DNS

1. В панели управления доменом убедитесь, что A-записи указывают на IP-адрес вашего VPS:
   - А-запись для корневого домена (@) указывает на 185.185.69.255
   - А-запись для поддомена www указывает на 185.185.69.255
2. Дождитесь обновления DNS (может занять до 24 часов)

## Шаг 2: Подключение к серверу

1. Подключитесь к VPS через SSH:
   ```bash
   ssh root@185.185.69.255
   ```

## Шаг 3: Установка необходимых компонентов

1. Обновите индекс пакетов и установите Git, Docker и Docker Compose:
   ```bash
   apt-get update
   apt-get install -y git docker.io docker-compose
   ```

## Шаг 4: Клонирование репозитория и настройка проекта

1. Клонируйте репозиторий проекта с веткой deploy-branch:
   ```bash
   git clone -b deploy-branch https://github.com/wastless/svet.git
   cd svet
   ```

2. Создайте файл .env.production с нужными переменными окружения:
   ```bash
   nano .env.production
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
   
   # База данных: также устанавливаем для Docker Compose
   DB_PASSWORD="надежный_пароль"
   DB_NAME="lesya_svet_db"
   ```

3. Создайте директории для Nginx и подготовьте SSL-сертификаты:
   ```bash
   mkdir -p nginx/ssl
   mkdir -p nginx/logs
   mkdir -p nginx/conf.d
   ```

4. Загрузите ваши SSL-сертификаты в папку nginx/ssl:
   ```bash
   # Если у вас есть сертификаты локально, вы можете загрузить их через SCP
   # или скопировать содержимое в файлы на сервере
   nano nginx/ssl/certificate.crt  # Скопируйте основной сертификат
   nano nginx/ssl/certificate.key  # Скопируйте ключ сертификата
   
   # Убедитесь, что права доступа к файлам настроены правильно
   chmod 644 nginx/ssl/certificate.crt
   chmod 600 nginx/ssl/certificate.key
   ```

5. Сделайте скрипты исполняемыми:
   ```bash
   chmod +x *.sh
   ```

## Шаг 5: Развертывание приложения

1. Запустите скрипт развертывания:
   ```bash
   ./simplified-deploy.sh lesyasvet.ru
   ```

   Этот скрипт:
   - Экспортирует переменные окружения из .env.production
   - Устанавливает необходимые зависимости
   - Собирает приложение Next.js
   - Запускает Docker-контейнеры
   - Применяет миграции Prisma к базе данных

2. Проверьте статус контейнеров:
   ```bash
   docker-compose ps
   ```

   Все контейнеры должны быть в состоянии "Up"

## Шаг 6: Проверка работоспособности и устранение неполадок

1. Откройте ваш домен в браузере: https://lesyasvet.ru

2. Если приложение недоступно, проверьте логи:
   ```bash
   # Логи приложения Next.js
   docker-compose logs app
   
   # Логи Nginx
   docker-compose logs nginx
   
   # Логи базы данных
   docker-compose logs db
   ```

3. Распространенные проблемы и их решения:
   
   - Проблема с базой данных:
     ```bash
     # Проверьте переменные окружения
     cat .env
     
     # Проверьте статус контейнера базы данных
     docker-compose ps db
     ```
   
   - Проблемы с Nginx или SSL:
     ```bash
     # Проверьте наличие сертификатов
     ls -la nginx/ssl/
     
     # Проверьте конфигурацию Nginx
     cat nginx/conf.d/default.conf
     ```

## Обновление приложения

1. Для обновления приложения после внесения изменений в код:
   ```bash
   cd ~/svet
   git pull
   ./simplified-deploy.sh lesyasvet.ru
   ```

## Резервное копирование базы данных

1. Создание резервной копии:
   ```bash
   docker-compose exec db pg_dump -U postgres -d $DB_NAME > backup_$(date +%Y%m%d).sql
   ```

2. Восстановление из резервной копии:
   ```bash
   docker-compose exec -T db psql -U postgres -d $DB_NAME < backup_filename.sql
   ```

## Мониторинг логов

Для просмотра логов приложения:

```bash
docker-compose logs -f app
```

Для просмотра логов Nginx:

```bash
docker-compose logs -f nginx
```

## Устранение неполадок

1. Если приложение недоступно, проверьте статус контейнеров:
   ```bash
   docker-compose ps
   ```

2. Проверьте логи приложения:
   ```bash
   docker-compose logs app
   ```

3. Проверьте логи Nginx:
   ```bash
   docker-compose logs nginx
   ```

4. Проверьте настройки DNS на Reg.ru и убедитесь, что A-записи указывают на правильный IP-адрес 


docker-compose down
docker-compose up -d
docker-compose logs app