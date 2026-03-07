FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# En produccion, Nginx sirve los archivos desde el volumen compartido
# El dist se copia al volumen frontend_build via docker-compose
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/dist ./dist
