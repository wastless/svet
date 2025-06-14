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

# Проверка наличия SSL-сертификатов
if [ ! -f "nginx/ssl/fullchain.pem" ] || [ ! -f "nginx/ssl/privkey.pem" ]; then
    echo "SSL-сертификаты не найдены. Запуск скрипта setup-ssl.sh..."
    bash setup-ssl.sh $DOMAIN
fi

# Сборка и запуск контейнеров
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Применение миграций Prisma
docker-compose exec app npx prisma migrate deploy

echo "Приложение успешно развернуто и доступно по адресу https://$DOMAIN" 