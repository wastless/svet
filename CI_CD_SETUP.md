# Настройка CI/CD для автоматического деплоя на VPS через GitHub Actions

## Предварительные требования

1. VPS с Ubuntu/Debian (1 ядро, 1 ГБ RAM, 20 ГБ NVMe)
2. Установленные Docker и Docker Compose на VPS
3. Доступ к GitHub репозиторию с правами администратора
4. SSH-доступ к VPS (логин, пароль или SSH-ключ)
5. SSL-сертификаты от Регру для вашего домена
6. База данных Supabase (уже настроена)

## Шаг 1: Первоначальная настройка сервера

1. **Подключение к серверу и установка необходимого ПО**:
   ```bash
   # Подключитесь к VPS
   ssh root@IP_ВАШЕГО_VPS
   
   # Обновите систему
   apt-get update && apt-get upgrade -y
   
   # Установите Docker и Docker Compose, если они еще не установлены
   apt-get install -y docker.io docker-compose curl git
   
   # Проверьте установку
   docker --version
   docker-compose --version
   ```

2. **Создание базовой структуры каталогов**:
   ```bash
   # Создаем директорию для проекта
   mkdir -p ~/deploy-package
   mkdir -p ~/deploy-package/nginx/ssl
   mkdir -p ~/deploy-package/nginx/conf.d
   mkdir -p ~/deploy-package/nginx/logs
   
   # Создаем директории для SSL сертификатов
   mkdir -p /etc/ssl/certs/ /etc/ssl/private/
   ```

3. **Загрузка сертификатов на VPS**:
   ```powershell
   # На Windows загрузите файлы сертификатов на сервер
  scp .\nginx\ssl\certificate.crt root@45.91.8.162:/etc/ssl/certs/certificate.crt
  scp .\nginx\ssl\certificate.key root@45.91.8.162:/etc/ssl/private/certificate.key
   ```

4. **Копирование сертификатов в директорию для Nginx**:
   ```bash
   # На VPS
   cp /etc/ssl/certs/certificate.crt ~/deploy-package/nginx/ssl/certificate.crt
   cp /etc/ssl/private/certificate.key ~/deploy-package/nginx/ssl/certificate.key
   
   # Настройте правильные права доступа
   chmod 644 /etc/ssl/certs/certificate.crt
   chmod 644 ~/deploy-package/nginx/ssl/certificate.crt
   chmod 600 /etc/ssl/private/certificate.key
   chmod 600 ~/deploy-package/nginx/ssl/certificate.key
   ```

5. **Создание базовой конфигурации Nginx**:
   ```bash
   # Создаем файл конфигурации Nginx
   nano ~/deploy-package/nginx/conf.d/default.conf

## Шаг 2: Настройка SSH-ключей для безопасного доступа (из Windows)

1. **Создание SSH-ключа** (выполните локально на Windows):
   ```powershell
   # Создаем директорию .ssh, если ее еще нет
   mkdir -Force "$env:USERPROFILE\.ssh"
   
   # Генерируем SSH-ключ
   ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\github_deploy_key" -C "github-actions-deploy"
   ```

2. **Добавление публичного ключа на VPS**:
   ```powershell
   # Скопируйте содержимое публичного ключа
   cat "$env:USERPROFILE\.ssh\github_deploy_key.pub"
   ```
   
   Затем подключитесь к VPS и добавьте ключ:
   ```bash
   # На VPS
   ssh root@IP_ВАШЕГО_VPS
   mkdir -p ~/.ssh
   echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICM9eBZaBEZGfCmzpJwimSlNXQhY1PivCrzgoBvxueND github-actions-deploy" >> ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

## Шаг 3: Настройка секретов в GitHub

1. В вашем GitHub репозитории перейдите в **Settings** → **Secrets and variables** → **Actions**

2. Добавьте следующие секреты (нажмите "New repository secret" для каждого):

   - `SSH_PRIVATE_KEY`: Содержимое приватного ключа (выполните `cat "$env:USERPROFILE\.ssh\github_deploy_key"` и скопируйте весь вывод)
   - `VPS_HOST`: IP-адрес вашего VPS
   - `VPS_USERNAME`: Имя пользователя для SSH (обычно root)
   - `SSH_PORT`: Порт SSH (обычно 22)
   - `DOMAIN_NAME`: Ваш домен (например, lesyasvet.ru)
   
3. Добавьте секретные переменные для внешнего подключения к Supabase:
   - `AUTH_SECRET`
   - `DATABASE_URL`: URL подключения к Supabase PostgreSQL
   - `DIRECT_URL`: Прямой URL для Prisma (обычно совпадает с DATABASE_URL)
   - `YANDEX_ACCESS_KEY_ID`
   - `YANDEX_SECRET_ACCESS_KEY`
   - `YANDEX_BUCKET_NAME`

## Шаг 4: Файл конфигурации GitHub Actions

Поскольку файл `.github/workflows/deploy.yml` уже настроен, убедитесь, что он содержит все необходимые шаги:

- Checkout кода и настройка Node.js
- Установка зависимостей и сборка приложения
- Подготовка пакета для деплоя
- Создание файла конфигурации с секретами
- Установка SSH ключа и загрузка пакета на VPS
- Запуск деплоя на сервере

Проверьте, что созданы все необходимые директории для файла:

```powershell
# На Windows
mkdir -Force .github\workflows
```

## Шаг 5: Создание скрипта для обновления сертификатов

Создайте скрипт для обновления сертификатов после их ручного обновления от Регру:

```bash
# На VPS создайте скрипт
cat > ~/update-ssl.sh << 'EOF'
#!/bin/bash

# Проверяем, что новые сертификаты предоставлены
if [ "$#" -ne 2 ]; then
  echo "Использование: $0 путь_к_сертификату путь_к_ключу"
  exit 1
fi

CERT_FILE=$1
KEY_FILE=$2

# Копируем новые сертификаты в системные директории
cp "$CERT_FILE" /etc/ssl/certs/certificate.crt
cp "$KEY_FILE" /etc/ssl/private/certificate.key

# Копируем сертификаты для использования в Nginx
cp /etc/ssl/certs/certificate.crt ~/deploy-package/nginx/ssl/certificate.crt
cp /etc/ssl/private/certificate.key ~/deploy-package/nginx/ssl/certificate.key

# Устанавливаем правильные права
chmod 644 /etc/ssl/certs/certificate.crt
chmod 644 ~/deploy-package/nginx/ssl/certificate.crt
chmod 600 /etc/ssl/private/certificate.key
chmod 600 ~/deploy-package/nginx/ssl/certificate.key

# Перезапускаем Nginx для применения новых сертификатов
cd ~/deploy-package
docker-compose restart nginx

echo "SSL сертификаты обновлены для домена $DOMAIN"
EOF

# Сделайте скрипт исполняемым
chmod +x ~/update-ssl.sh
```

## Шаг 6: Проверка и запуск CI/CD

1. Закоммитьте изменения и отправьте их в ветку main:
   ```powershell
   # На Windows
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Actions deployment workflow"
   git push origin main
   ```

2. Перейдите в раздел "Actions" вашего GitHub репозитория, чтобы отслеживать процесс деплоя.

3. После успешного завершения деплоя проверьте ваш сайт, открыв его в браузере: https://ваш_домен

## Как происходит деплой

После настройки CI/CD процесс деплоя выглядит следующим образом:

1. **Триггер**: Вы делаете push в ветку main
2. **Сборка**: GitHub Actions запускает сборку приложения
   - Устанавливает зависимости
   - Компилирует код
   - Создает оптимизированную сборку
3. **Подготовка пакета**:
   - Создаёт архив с необходимыми файлами для деплоя
   - Копирует файлы конфигурации
   - Создаёт .env.production с секретами
4. **Деплой**:
   - Подключается к вашему VPS через SSH
   - Загружает архив на сервер
   - Распаковывает архив на сервере
   - Проверяет/копирует SSL сертификаты
   - Запускает приложение через docker-compose
5. **Проверка**: Приложение становится доступным по вашему домену

## Устранение неполадок

### Проблема: Деплой не запускается

1. Проверьте раздел "Actions" в GitHub для просмотра логов ошибок
2. Убедитесь, что все секреты корректно добавлены в GitHub
3. Проверьте настройки подключения к Supabase в секретах

### Проблема: Ошибка доступа SSH

1. Проверьте, правильно ли настроен SSH-ключ на VPS
2. Убедитесь, что секрет SSH_PRIVATE_KEY содержит весь приватный ключ, включая строки BEGIN и END
3. Проверьте права доступа к директории ~/.ssh на VPS (должно быть 700)

### Проблема: Ошибка с сертификатами SSL

1. Проверьте, что сертификаты находятся в правильных местах
2. Убедитесь, что формат сертификатов правильный
3. Проверьте, что файлы сертификатов имеют правильные права доступа

### Проблема: Приложение запустилось, но не работает

1. Проверьте логи контейнеров:
   ```bash
   cd ~/deploy-package
   docker-compose logs app
   docker-compose logs nginx
   ```
2. Убедитесь, что переменные окружения правильно переданы контейнерам

## Дополнительные рекомендации для VPS с ограниченными ресурсами

Учитывая, что ваш VPS имеет 1 ядро и 1 ГБ RAM, вот несколько рекомендаций:

1. **Оптимизация Docker**:
   ```bash
   echo '{
     "storage-driver": "overlay2",
     "log-driver": "json-file",
     "log-opts": {
       "max-size": "10m",
       "max-file": "3"
     }
   }' | sudo tee /etc/docker/daemon.json
   sudo systemctl restart docker
   ```

2. **Настройка SWAP-файла** для предотвращения ошибок из-за нехватки памяти:
   ```bash
   # Создаем swap-файл размером 2 ГБ
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   
   # Добавляем в /etc/fstab для автоматического монтирования при перезагрузке
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

3. **Оптимизация Nginx**:
   Добавьте в конфигурацию Nginx (nginx/conf.d/default.conf):
   ```
   worker_processes 1;
   worker_connections 512;
   client_max_body_size 10M;
   ``` 



# Найдите и остановите все запущенные контейнер
docker ps -a
docker stop $(docker ps -q)
docker rm $(docker ps -aq)

# Удалите все образы (опционально)
docker rmi $(docker images -q)

# Проверьте, что все контейнеры остановлены
docker ps

# Удалите папку deploy-package, если она осталась
rm -rf ~/deploy-package

# Проверьте, что в GitHub настроены правильные секреты для CI/CD
# Затем сделайте небольшое изменение в коде и отправьте его в main ветку

-----------------



Перейдите в директорию с проектом:
cd ~/deploy-package

Остановите все контейнеры:
docker-compose down

Удалите старые образы (чтобы точно пересобрать их с новым кодом):
docker rmi $(docker images -q 'deploy-package_app')

Проверьте, что в папке deploy-package находится актуальная версия кода:
ls -la

Пересоберите и запустите контейнеры:
docker-compose build --no-cache
docker-compose up -d

Проверьте логи, чтобы убедиться, что всё запустилось корректно:
docker-compose logs -f app
