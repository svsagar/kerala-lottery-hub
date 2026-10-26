# Multi-stage build

# Stage 1: Base with dependencies
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g npm@latest

# Stage 2: Dependencies installation
FROM base AS dependencies
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/statistics/package*.json ./packages/statistics/
COPY packages/data-ingestion/package*.json ./packages/data-ingestion/
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
RUN npm ci

# Stage 3: Builder
FROM dependencies AS builder
COPY . .
RUN npm run build
RUN npm run prisma:generate

# Stage 4: API Runtime
FROM base AS api-runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/prisma ./prisma
COPY .env.example .env
EXPOSE 3001
CMD ["npm", "-w", "apps/api", "run", "start"]

# Stage 5: Web Runtime
FROM node:20-alpine AS web-runtime
WORKDIR /app
RUN npm install -g http-server
COPY --from=builder /app/apps/web/dist ./dist
EXPOSE 3000
CMD ["http-server", "dist", "-p", "3000"]
