#!/bin/bash

# Проверка наличия домена в аргументах
if [ $# -eq 0 ]; then
    echo "Использование: $0 yourdomain.ru"
    exit 1
fi

DOMAIN=$1

# Обновление сертификатов с помощью Certbot
certbot renew --quiet

# Копирование обновленных сертификатов в директорию Nginx
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/

# Перезапуск Nginx для применения новых сертификатов
docker-compose restart nginx

echo "SSL-сертификаты успешно обновлены для домена $DOMAIN" 