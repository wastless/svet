#!/bin/bash

# Проверка наличия домена в аргументах
if [ $# -eq 0 ]; then
    echo "Использование: $0 yourdomain.ru"
    exit 1
fi

DOMAIN=$1

# Обновление репозитория
git pull

# Копирование .env.production в .env для docker-compose
cp .env.production .env

# Создание директорий для Nginx, если они не существуют
mkdir -p nginx/ssl
mkdir -p nginx/logs
mkdir -p nginx/conf.d

# Проверка наличия SSL-сертификатов с уже имеющимися названиями файлов
if [ ! -f "nginx/ssl/certificate.crt" ] || [ ! -f "nginx/ssl/certificate.key" ]; then
    echo "SSL-сертификаты не найдены. Убедитесь, что файлы certificate.crt и certificate.key находятся в папке nginx/ssl"
    exit 1
fi

# Добавляем переменную для пропуска валидации переменных окружения
export SKIP_ENV_VALIDATION=1

# Сборка и запуск контейнеров
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Применение миграций Prisma
docker-compose exec app npx prisma migrate deploy

echo "Приложение успешно развернуто и доступно по адресу https://$DOMAIN" 