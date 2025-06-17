#!/bin/bash

# Обновление сертификатов
certbot renew --quiet

# Получаем домен из аргумента или используем значение по умолчанию
DOMAIN=${1:-"lesyasvet.ru"}

# Копирование обновленных сертификатов в нужные директории
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/ssl/certs/$DOMAIN.crt
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/ssl/private/$DOMAIN.key

# Копирование обновленных сертификатов для Docker контейнеров
cp /etc/ssl/certs/$DOMAIN.crt ~/deploy-package/nginx/ssl/certificate.crt
cp /etc/ssl/private/$DOMAIN.key ~/deploy-package/nginx/ssl/certificate.key

# Перезапуск Nginx чтобы применить новые сертификаты
cd ~/deploy-package
docker-compose restart nginx

echo "SSL сертификаты обновлены и применены для $DOMAIN" 