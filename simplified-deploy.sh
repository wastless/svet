#!/bin/bash

# Проверка наличия домена в аргументах
if [ $# -eq 0 ]; then
    echo "Использование: $0 yourdomain.ru"
    exit 1
fi

DOMAIN=$1
REPO_URL="https://github.com/wastless/lesya.svet.git"
DEPLOY_DIR="/root/svet"

# Обновление пакетов
apt-get update
apt-get install -y git nodejs npm

# Клонирование/обновление репозитория
if [ -d "$DEPLOY_DIR" ]; then
    echo "Обновление существующего репозитория..."
    cd "$DEPLOY_DIR"
    git pull
else
    echo "Клонирование репозитория..."
    git clone "$REPO_URL" "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
fi

# Копирование .env.production в .env для docker-compose
cp .env.production .env

# Создание директорий для Nginx
mkdir -p nginx/ssl
mkdir -p nginx/logs
mkdir -p nginx/conf.d

# Проверка наличия SSL-сертификатов
if [ ! -f "nginx/ssl/certificate.crt" ] || [ ! -f "nginx/ssl/certificate.key" ]; then
    echo "SSL-сертификаты не найдены. Убедитесь, что файлы certificate.crt и certificate.key находятся в папке nginx/ssl"
    exit 1
fi

# Сборка проекта локально (на сервере)
export SKIP_ENV_VALIDATION=1
npm install
npm run build

# Сборка и запуск Docker контейнеров
docker-compose down
docker-compose up -d

# Применение миграций Prisma
docker-compose exec -T app npx prisma migrate deploy

echo "Приложение успешно развернуто и доступно по адресу https://$DOMAIN" 