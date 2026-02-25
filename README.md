# Nexont

> Plataforma de comercio digital para artículos de segunda mano, impulsada por inteligencia artificial para automatizar y acompañar al comprador y al vendedor en cada paso del proceso.

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [API Reference](#api-reference)
- [Roadmap](#roadmap)
- [Licencia](#licencia)

---

## Descripción

**Nexont** es una aplicación web fullstack orientada a la compra y venta de artículos usados. Combina un monolito modular para las funciones principales del negocio con microservicios especializados para chat en tiempo real, búsqueda inteligente y un chatbot con IA que guía a los usuarios durante toda la experiencia.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                    │
│                       Puerto 80                         │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP / WebSocket
        ┌───────────────────┼─────────────────────┐
        │                   │                     │
┌───────▼────────┐ ┌────────▼───────┐ ┌──────────▼──────┐
│   Core API     │ │  Chat Service  │ │ Search Service  │
│  (Express)     │ │ (Socket.io)    │ │   (Express)     │
│  Puerto 3000   │ │  Puerto 3001   │ │  Puerto 3002    │
└───────┬────────┘ └────────┬───────┘ └──────────┬──────┘
        │                   │                     │
        │          ┌────────▼───────┐             │
        │          │Chatbot Service │             │
        │          │   (FastAPI)    │             │
        │          │  Puerto 8000   │             │
        │          └────────────────┘             │
        │                                         │
┌───────▼─────────────────────────────────────────▼──────┐
│              Infraestructura (Docker)                   │
│  PostgreSQL 5432 │ MongoDB 27017 │ Redis 6379           │
│  RabbitMQ 5672 / UI 15672                               │
└─────────────────────────────────────────────────────────┘
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18, Vite, React Router v6, Axios |
| Core API | Node.js, Express, Prisma ORM, JWT, bcryptjs, Joi, Winston |
| Chat Service | Node.js, Express, Socket.io |
| Chatbot Service | Python, FastAPI |
| Search Service | Node.js, Express |
| Mensajería | RabbitMQ |
| Caché / Sesiones | Redis |
| Base de datos principal | PostgreSQL 16 |
| Base de datos de chat | MongoDB 7 |
| Contenedores | Docker, Docker Compose |

---

## Estructura del proyecto

```
nexont/
├── core-api/                  # Monolito modular (Node.js / Express)
│   ├── prisma/                # Esquema y migraciones de base de datos
│   └── src/
│       ├── modules/           # auth · users · products · orders · payments · notifications
│       ├── shared/middleware/  # JWT auth middleware
│       └── app.js
├── frontend/                  # SPA (React + Vite)
│   └── src/
│       └── pages/             # Home · Login · Register · Products · Orders
├── services/
│   ├── chat-service/          # Chat en tiempo real (Socket.io)
│   ├── chatbot-service/       # Chatbot IA (FastAPI / Python)
│   └── search-service/        # Motor de búsqueda (Express)
├── docs/diagrams/             # Diagramas de arquitectura
├── n8n-workflows/             # Automatizaciones con n8n
├── infrastructure/            # Configuración de infraestructura
└── docker-compose.yml
```

---

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) >= 24
- [Docker Compose](https://docs.docker.com/compose/) >= 2

Para desarrollo local sin Docker:

- Node.js >= 20
- Python >= 3.11
- PostgreSQL >= 16
- MongoDB >= 7
- Redis >= 7

---

## Instalación y ejecución

### Con Docker (recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/<tu-usuario>/nexont.git
cd nexont

# 2. Copiar y configurar las variables de entorno (ver sección siguiente)
cp core-api/.env.example core-api/.env
cp services/chat-service/.env.example services/chat-service/.env
cp services/chatbot-service/.env.example services/chatbot-service/.env
cp services/search-service/.env.example services/search-service/.env

# 3. Levantar todos los servicios
docker compose up --build
```

Los servicios quedarán disponibles en:

| Servicio | URL |
|---|---|
| Frontend | http://localhost |
| Core API | http://localhost:3000 |
| Core API Health | http://localhost:3000/health |
| Chat Service | http://localhost:3001 |
| Chatbot Service | http://localhost:8000 |
| Search Service | http://localhost:3002 |
| RabbitMQ UI | http://localhost:15672 |

### Migraciones de base de datos

```bash
docker compose exec core-api npm run db:migrate
```

### Desarrollo local (sin Docker)

```bash
# Core API
cd core-api && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev

# Chat Service
cd services/chat-service && npm install && npm run dev

# Search Service
cd services/search-service && npm install && npm run dev

# Chatbot Service
cd services/chatbot-service
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

---

## Variables de entorno

### `core-api/.env`

```env
PORT=3000
DATABASE_URL=postgresql://nexont:nexont_pass@postgres:5432/nexont_db
JWT_SECRET=tu_secreto_jwt
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://rabbitmq:5672
```

### `services/chat-service/.env`

```env
PORT=3001
MONGODB_URI=mongodb://mongodb:27017/nexont_chat
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://rabbitmq:5672
```

### `services/chatbot-service/.env`

```env
PORT=8000
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://rabbitmq:5672
OPENAI_API_KEY=tu_api_key   # o ANTHROPIC_API_KEY
```

### `services/search-service/.env`

```env
PORT=3002
REDIS_URL=redis://redis:6379
```

---

## API Reference

Todos los endpoints de la Core API tienen el prefijo `/api/v1`.

| Módulo | Prefijo |
|---|---|
| Autenticación | `/api/v1/auth` |
| Usuarios | `/api/v1/users` |
| Productos | `/api/v1/products` |
| Órdenes | `/api/v1/orders` |
| Pagos | `/api/v1/payments` |
| Notificaciones | `/api/v1/notifications` |

> La documentación completa de endpoints estará disponible próximamente via Swagger/OpenAPI.

---

## Roadmap

- [x] Arquitectura base con Docker Compose
- [x] Core API modular (auth, users, products, orders, payments, notifications)
- [x] Chat en tiempo real con Socket.io
- [x] Esquema de base de datos con Prisma (PostgreSQL)
- [x] Frontend base con React + Vite
- [ ] Integración del chatbot con LLM (OpenAI / Anthropic)
- [ ] Motor de búsqueda inteligente (Elasticsearch / Algolia)
- [ ] Pasarela de pagos (Stripe / MercadoPago)
- [ ] Sistema de notificaciones push
- [ ] Workflows de automatización con n8n
- [ ] Documentación Swagger / OpenAPI
- [ ] Tests unitarios e integración
- [ ] CI/CD (GitHub Actions)

---

## Licencia

Distribuido bajo la licencia incluida en [LICENSE](LICENSE).
