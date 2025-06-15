FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package.json package-lock.json ./

# Копируем prisma директорию
COPY prisma ./prisma

# Устанавливаем зависимости
RUN npm ci

# ВАЖНО: копируем src/env.js до копирования остальных файлов
COPY src/env.js ./src/env.js

# Копируем остальные файлы проекта
COPY . .

# Собираем приложение
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

# Копируем необходимые файлы
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
# Обязательно копируем src/env.js
COPY --from=builder /app/src/env.js ./src/env.js

# Настройка переменных окружения
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1

EXPOSE 3000

CMD ["npm", "start"]