# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY babel.config.js ./
COPY tsconfig*.json ./
COPY apps ./apps
COPY libs ./libs
COPY shared ./shared

RUN npm install
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/apps/worker/wait-for.sh ./wait-for.sh
COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

CMD ["./wait-for.sh", "rabbitmq:5672", "--", "node", "dist/apps/worker/src/main.js"]
