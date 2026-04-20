# ⚡ Comandos Rápidos — Nexont

> Referencia rápida de los comandos más usados. Para explicaciones detalladas ver [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md).

---

## 🟢 Iniciar el proyecto

```bash
# 1. Infraestructura (Docker)
docker compose up postgres redis rabbitmq mongodb nginx -d

# 2. Backend (nueva terminal)
cd core-api && npm run dev

# 3. Frontend (nueva terminal)
cd frontend && npm run dev

# Abrir → http://localhost
```

## 🔴 Apagar el proyecto

```bash
# Ctrl+C en terminales de backend y frontend, luego:
docker compose down          # Conserva datos
docker compose down -v       # ⚠️ Borra datos
```

## 🗄️ Base de datos

```bash
cd core-api
npx prisma migrate dev --name descripcion   # Crear migración
npx prisma generate                          # Regenerar cliente
npx prisma studio                            # GUI visual (:5555)
npx prisma migrate reset                     # ⚠️ Reset completo
```

## 🐘 PostgreSQL directo

```bash
docker compose exec postgres psql -U nexont -d nexont_db
# \dt = tablas | \d tabla = estructura | \q = salir
```

## 🐳 Docker

```bash
docker compose ps                    # Estado
docker compose logs -f servicio      # Logs en vivo
docker compose restart servicio      # Reiniciar
docker compose exec servicio sh      # Shell dentro del container
```

## ✅ Health checks

```bash
curl localhost:3000/health    # Core API
curl localhost:3001/health    # Chat
curl localhost:3002/health    # Search
curl localhost:8000/health    # Chatbot
```

## 🚀 Producción

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml down
```
