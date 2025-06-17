#!/bin/bash

# Проверка наличия домена в аргументах
if [ $# -eq 0 ]; then
    echo "Использование: $0 lesyasvet.ru"
    exit 1
fi

DOMAIN=$1

# Копирование .env.production в .env для docker-compose
cp .env.production .env

# Создание директорий для Nginx, если они не существуют
mkdir -p nginx/ssl
mkdir -p nginx/logs
mkdir -p nginx/conf.d

# Проверка наличия конфига Nginx и создание, если он отсутствует
if [ ! -f "nginx/conf.d/default.conf" ]; then
    echo "Создание конфигурации Nginx..."
    cat > nginx/conf.d/default.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name $DOMAIN www.$DOMAIN;

    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/certificate.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
fi

# Проверка наличия SSL-сертификатов
if [ ! -f "nginx/ssl/certificate.crt" ] || [ ! -f "nginx/ssl/certificate.key" ]; then
    echo "SSL-сертификаты не найдены. Убедитесь, что файлы certificate.crt и certificate.key находятся в папке nginx/ssl"
    exit 1
fi

# Добавляем переменную для пропуска валидации переменных окружения
export SKIP_ENV_VALIDATION=1

# Сборка и запуск контейнеров
docker-compose down
docker-compose up -d

echo "Приложение успешно развернуто и доступно по адресу https://$DOMAIN" 