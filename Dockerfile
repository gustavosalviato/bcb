FROM node:24-bookworm-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

RUN DATABASE_URL="postgresql://docker:docker@db:5432/bcb?schema=public" \
    npx prisma generate

EXPOSE 3333

CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx src/server.ts"]