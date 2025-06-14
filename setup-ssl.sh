#!/bin/bash

# Проверка наличия домена в аргументах
if [ $# -eq 0 ]; then
    echo "Использование: $0 yourdomain.ru"
    exit 1
fi

DOMAIN=$1
EMAIL="admin@${DOMAIN}"

# Создание директорий для Nginx
mkdir -p nginx/ssl
mkdir -p nginx/logs
mkdir -p nginx/conf.d

# Установка Certbot
apt-get update
apt-get install -y certbot

# Получение SSL-сертификата с помощью Certbot
certbot certonly --standalone \
  --preferred-challenges http \
  --agree-tos \
  --email $EMAIL \
  -d $DOMAIN \
  -d www.$DOMAIN

# Копирование сертификатов в директорию Nginx
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/

# Обновление конфигурации Nginx
sed -i "s/yourdomain.ru/$DOMAIN/g" nginx/conf.d/default.conf

echo "SSL-сертификаты успешно получены и настроены для домена $DOMAIN"
echo "Теперь вы можете запустить приложение с помощью docker-compose up -d" 