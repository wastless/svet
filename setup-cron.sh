#!/bin/bash

# Проверка наличия домена в аргументах
if [ $# -eq 0 ]; then
    echo "Использование: $0 yourdomain.ru"
    exit 1
fi

DOMAIN=$1

# Получение абсолютного пути к директории проекта
PROJECT_DIR=$(pwd)

# Создание задачи cron для обновления SSL-сертификатов каждые 2 месяца
(crontab -l 2>/dev/null; echo "0 0 1 */2 * cd $PROJECT_DIR && bash renew-ssl.sh $DOMAIN") | crontab -

echo "Задача cron для автоматического обновления SSL-сертификатов успешно настроена" 