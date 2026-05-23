FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# En producción, usamos un contenedor de Nginx ligero para servir los estáticos
FROM nginx:alpine

# Copiar los estáticos generados en el builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Configurar Nginx para aplicaciones Single Page Application (SPA)
RUN echo "server { listen 80; location / { root /usr/share/nginx/html; index index.html index.htm; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
