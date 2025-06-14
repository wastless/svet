# Настройка CI/CD с GitHub Actions

Для автоматического деплоя приложения при пуше в ветку `main` необходимо настроить GitHub Actions.

## Шаг 1: Создание SSH-ключа для деплоя

1. На вашем локальном компьютере сгенерируйте SSH-ключ:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -C "github-actions-deploy"
   ```

2. Добавьте публичный ключ на ваш VPS:
   ```bash
   # Скопируйте содержимое публичного ключа
   cat ~/.ssh/deploy_key.pub
   
   # На сервере добавьте ключ в ~/.ssh/authorized_keys
   ssh user@your_server_ip
   echo "скопированный_публичный_ключ" >> ~/.ssh/authorized_keys
   ```

## Шаг 2: Настройка секретов в GitHub

1. В вашем репозитории GitHub перейдите в раздел Settings > Secrets and variables > Actions
2. Добавьте следующие секреты:
   - `HOST`: IP-адрес вашего VPS
   - `USERNAME`: имя пользователя на VPS
   - `SSH_PRIVATE_KEY`: содержимое приватного ключа (~/.ssh/deploy_key)
   - `PROJECT_PATH`: путь к проекту на VPS (например, /home/user/lesya.svet)
   - `DOMAIN`: ваш домен (например, yourdomain.ru)

## Шаг 3: Проверка работы CI/CD

1. Внесите изменения в код и отправьте их в ветку `main`:
   ```bash
   git add .
   git commit -m "Update application"
   git push origin main
   ```

2. Перейдите в раздел Actions в вашем репозитории GitHub и проверьте статус выполнения workflow.

3. После успешного выполнения workflow ваше приложение должно быть автоматически обновлено на VPS.

## Дополнительные настройки

### Запуск деплоя вручную

Вы можете настроить возможность запуска деплоя вручную, добавив в файл `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches: [ main ]
  workflow_dispatch:
```

После этого вы сможете запускать деплой вручную из раздела Actions в GitHub.

### Настройка уведомлений

Для получения уведомлений о результатах деплоя добавьте в workflow:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # ... существующие шаги ...
      
      - name: Send notification
        if: always()
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_CHANNEL: deployments
          SLACK_COLOR: ${{ job.status }}
          SLACK_TITLE: Deployment Result
          SLACK_MESSAGE: 'Deployment to ${{ secrets.DOMAIN }} ${{ job.status }}'
```

Для этого вам потребуется добавить секрет `SLACK_WEBHOOK` с URL вашего Slack webhook. 