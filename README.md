# Lesya Svet

## Развертывание на VPS (Base-ready метод)

Для деплоя на маломощный VPS (1 ядро, 1 ГБ RAM) используется метод "base-ready":

1. Сборка приложения происходит локально или в GitHub Actions
2. На сервер отправляется только готовая сборка 
3. На сервере выполняется только запуск Docker контейнеров

### Автоматический деплой

Настроен автоматический деплой через GitHub Actions при следующих событиях:
- Push в ветку `main`
- Ручной запуск workflow

### Необходимые секреты в GitHub

Для корректной работы CI/CD pipeline необходимо настроить следующие секреты в GitHub:

1. `HOST` - IP-адрес VPS сервера
2. `USERNAME` - имя пользователя SSH
3. `SSH_PRIVATE_KEY` - приватный SSH ключ для доступа к серверу
4. `PROJECT_PATH` - путь к директории проекта на сервере
5. `DOMAIN` - домен сайта
6. `AUTH_SECRET` - секрет для Next.js Auth
7. `DATABASE_URL` - URL подключения к базе данных (формат `postgres://postgres:password@db:5432/dbname`)
8. `DIRECT_URL` - URL прямого подключения к базе данных
9. `YANDEX_ACCESS_KEY_ID` - идентификатор доступа к Yandex Object Storage
10. `YANDEX_SECRET_ACCESS_KEY` - секретный ключ доступа к Yandex Object Storage
11. `YANDEX_BUCKET_NAME` - имя бакета в Yandex Object Storage
12. `DB_PASSWORD` - пароль базы данных
13. `DB_NAME` - имя базы данных

### Проверка работоспособности CI/CD

1. После настройки всех секретов можно выполнить пуш в ветку `main` или вручную запустить workflow в разделе Actions.

2. После успешного выполнения workflow приложение будет доступно по указанному домену.

### Ручной деплой

Если необходимо выполнить ручной деплой:

1. Соберите приложение локально:
   ```bash
   npm ci
   npm run build
   ```

2. Создайте пакет для деплоя:
   ```bash
   mkdir -p deploy-package
   cp -r .next deploy-package/
   cp -r public deploy-package/
   cp -r prisma deploy-package/
   Copy-Item -Path package.json, package-lock.json, next.config.js -Destination deploy-package/
   mkdir -p deploy-package/src
   cp src/env.js deploy-package/src/
   cp Dockerfile.production deploy-package/
   cp docker-compose.yml deploy-package/
   cp deploy.sh deploy-package/
   cp .env.production deploy-package/
   ```

3. Загрузите пакет на сервер:
   ```bash
   tar -czvf deploy-package.tar.gz deploy-package
   scp deploy-package.tar.gz root:~/
   ```

4. Подключитесь к серверу и выполните деплой:
   ```bash
   ssh 
   cd ~/
   tar -xzvf deploy-package.tar.gz
   cd deploy-package
   ./deploy.sh yourdomain.ru
   ```

### Требования к серверу

- Docker и Docker Compose
- Открытые порты 80 и 443
- SSL-сертификаты (должны быть размещены на сервере в папке `nginx/ssl/`)
