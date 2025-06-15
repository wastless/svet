# Инструкция по развертыванию приложения на VPS

## Предварительные требования

1. VPS с операционной системой Ubuntu/Debian
2. Установленный Docker и Docker Compose
3. Зарегистрированный домен на Reg.ru
4. Открытые порты 80 и 443 на VPS

## Шаг 1: Настройка DNS на Reg.ru

1. Войдите в панель управления Reg.ru
2. Перейдите в раздел управления доменом
3. Добавьте A-запись, указывающую на IP-адрес вашего VPS:
   - Имя: @ (или оставьте пустым для корневого домена)
   - Тип: A
   - Значение: IP-адрес вашего VPS
4. Добавьте также A-запись для поддомена www:
   - Имя: www
   - Тип: A
   - Значение: IP-адрес вашего VPS
5. Сохраните изменения и дождитесь обновления DNS (может занять до 24 часов)

## Шаг 2: Подготовка сервера

1. Подключитесь к вашему VPS через SSH:
   ```bash
   ssh user@your_server_ip
   ```

2. Установите Docker и Docker Compose:
   ```bash
   # Установка Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Установка Docker Compose
   sudo apt-get update
   sudo apt-get install -y docker-compose-plugin
   ```

3. Установите Git:
   ```bash
   sudo apt-get install -y git
   ```

## Шаг 3: Клонирование и настройка проекта

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/wastless/svet.git
   cd lesya.svet
   ```

2. Отредактируйте файл .env.production, указав реальные значения:
   ```bash
   nano .env.production
   ```

   Укажите:
   - DB_PASSWORD - надежный пароль для базы данных
   - DB_NAME - имя базы данных (например, lesya_svet_db)
   - AUTH_SECRET - секретный ключ для авторизации (сгенерируйте с помощью `openssl rand -base64 32`)
   - YANDEX_ACCESS_KEY_ID - ваш ключ доступа к Yandex Object Storage
   - YANDEX_SECRET_ACCESS_KEY - ваш секретный ключ к Yandex Object Storage
   - YANDEX_BUCKET_NAME - имя бакета в Yandex Object Storage

3. Сделайте скрипты исполняемыми:
   ```bash
   chmod +x *.sh
   ```

## Шаг 4: Развертывание приложения

1. Запустите скрипт развертывания, указав ваш домен:
   ```bash
   ./deploy.sh lesyasvet.ru
   ```

   Этот скрипт:
   - Настроит SSL-сертификаты с помощью Certbot
   - Соберет и запустит Docker-контейнеры
   - Применит миграции Prisma к базе данных

2. Настройте автоматическое обновление SSL-сертификатов:
   ```bash
   ./setup-cron.sh yourdomain.ru
   ```

## Шаг 5: Проверка работоспособности

1. Откройте ваш домен в браузере: https://yourdomain.ru
2. Убедитесь, что приложение работает корректно и SSL-сертификат установлен (замок в адресной строке)

## Обновление приложения

Для обновления приложения после внесения изменений в код:

1. Подключитесь к серверу через SSH
2. Перейдите в директорию проекта
3. Запустите скрипт развертывания:
   ```bash
   ./deploy.sh yourdomain.ru
   ```

## Резервное копирование базы данных

Для создания резервной копии базы данных:

```bash
docker-compose exec db pg_dump -U postgres -d lesya_svet_db > backup_$(date +%Y%m%d).sql
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