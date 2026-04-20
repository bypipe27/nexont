# 📘 Guía para Desarrolladores — Nexont

> Documento interno para el equipo de desarrollo. Contiene todos los comandos, flujos de trabajo y convenciones necesarios para trabajar en el proyecto.

---

## Tabla de contenidos

- [1. Requisitos previos](#1-requisitos-previos)
- [2. Primer setup (onboarding)](#2-primer-setup-onboarding)
- [3. Iniciar el proyecto (desarrollo)](#3-iniciar-el-proyecto-desarrollo)
- [4. Apagar el proyecto](#4-apagar-el-proyecto)
- [5. Comandos Docker importantes](#5-comandos-docker-importantes)
- [6. Base de datos (Prisma + PostgreSQL)](#6-base-de-datos-prisma--postgresql)
- [7. Trabajar con los microservicios](#7-trabajar-con-los-microservicios)
- [8. Variables de entorno](#8-variables-de-entorno)
- [9. Puertos y URLs](#9-puertos-y-urls)
- [10. Guía: Implementar una nueva funcionalidad](#10-guía-implementar-una-nueva-funcionalidad)
- [11. Guía: Crear un nuevo módulo en Core API](#11-guía-crear-un-nuevo-módulo-en-core-api)
- [12. Guía: Crear un nuevo microservicio](#12-guía-crear-un-nuevo-microservicio)
- [13. Guía: Modificar la base de datos](#13-guía-modificar-la-base-de-datos)
- [14. Guía: Agregar una nueva página al frontend](#14-guía-agregar-una-nueva-página-al-frontend)
- [15. Flujo de producción](#15-flujo-de-producción)
- [16. Troubleshooting (problemas comunes)](#16-troubleshooting-problemas-comunes)
- [17. Convenciones del equipo](#17-convenciones-del-equipo)

---

## 1. Requisitos previos

Antes de empezar, asegúrate de tener instalado:

| Herramienta       | Versión mínima | Verificar con               |
| ----------------- | -------------- | --------------------------- |
| Docker            | >= 24          | `docker --version`          |
| Docker Compose    | >= 2           | `docker compose version`    |
| Node.js           | >= 20          | `node -v`                   |
| npm               | >= 10          | `npm -v`                    |
| Python            | >= 3.11        | `python3 --version`         |
| Git               | >= 2           | `git --version`             |

> **Nota:** Node.js y Python se necesitan para desarrollo local. Docker es **obligatorio** para la infraestructura (bases de datos, Redis, RabbitMQ, Nginx).

---

## 2. Primer setup (onboarding)

Ejecuta estos pasos **una sola vez** al clonar el repositorio:

```bash
# 1. Clonar el repositorio
git clone https://github.com/<tu-usuario>/nexont.git
cd nexont

# 2. Crear archivos .env a partir de los ejemplos
#    (si no existen .env.example, crearlos manualmente — ver sección "Variables de entorno")
cp core-api/.env.example core-api/.env           2>/dev/null || true
cp services/chat-service/.env.example services/chat-service/.env       2>/dev/null || true
cp services/chatbot-service/.env.example services/chatbot-service/.env 2>/dev/null || true
cp services/search-service/.env.example services/search-service/.env   2>/dev/null || true

# 3. Levantar la infraestructura (bases de datos + message broker + proxy)
docker compose up postgres redis rabbitmq mongodb nginx -d

# 4. Instalar dependencias del Core API
cd core-api
npm install

# 5. Generar el cliente de Prisma y ejecutar migraciones
npx prisma generate
npx prisma migrate dev

# 6. Volver a la raíz e instalar dependencias del frontend
cd ../frontend
npm install

# 7. (Opcional) Instalar dependencias de microservicios si vas a trabajar en ellos
cd ../services/chat-service && npm install
cd ../search-service && npm install
cd ../chatbot-service && pip install -r requirements.txt
```

---

## 3. Iniciar el proyecto (desarrollo)

El flujo de desarrollo necesita **3 terminales** (mínimo 2):

### Terminal 1 — Infraestructura (Docker)

```bash
cd nexont
docker compose up postgres redis rabbitmq mongodb nginx -d
```

> Esto levanta: PostgreSQL, Redis, RabbitMQ, MongoDB y Nginx como reverse proxy.
> El flag `-d` ejecuta en segundo plano (detached).

### Terminal 2 — Core API (Backend)

```bash
cd nexont/core-api
npm run dev
```

> Usa **nodemon** para hot-reload. Cualquier cambio en `src/` reinicia el servidor automáticamente.
> El API queda disponible en `http://localhost:3000`.

### Terminal 3 — Frontend (React + Vite)

```bash
cd nexont/frontend
npm run dev
```

> Vite corre en `http://localhost:5173` con HMR (Hot Module Replacement).
> Nginx enruta `http://localhost` → frontend y `http://localhost/api/*` → Core API.

### Verificar que todo funciona

```bash
# Health check del Core API
curl http://localhost:3000/health
# Respuesta esperada: {"status":"ok","service":"core-api"}

# Verificar a través de Nginx (puerto 80)
curl http://localhost/api/v1/auth/login -X POST -H "Content-Type: application/json" -d '{}'
# Respuesta esperada: {"error":"Email y contraseña son requeridos"}

# Abrir en el navegador
# http://localhost
```

### Diagrama del flujo de inicio

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Terminal 1     │     │   Terminal 2     │     │   Terminal 3     │
│                  │     │                  │     │                  │
│ docker compose   │     │ cd core-api      │     │ cd frontend      │
│ up ... -d        │────▶│ npm run dev      │     │ npm run dev      │
│                  │     │                  │     │                  │
│ PostgreSQL :5432 │     │ Express  :3000   │     │ Vite     :5173   │
│ Redis      :6379 │     │                  │     │                  │
│ RabbitMQ   :5672 │     │                  │     │                  │
│ MongoDB    :27017│     │                  │     │                  │
│ Nginx      :80   │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                │                         │
                                └─────────┬───────────────┘
                                          │
                                    Nginx :80
                                /api/* → :3000
                                /     → :5173
```

---

## 4. Apagar el proyecto

### Opción A — Apagar todo (infraestructura + servidores locales)

```bash
# 1. Detener Core API y Frontend: Ctrl+C en cada terminal

# 2. Detener contenedores Docker (conserva datos)
docker compose down
```

### Opción B — Solo apagar infraestructura Docker

```bash
docker compose down
```

### Opción C — Apagar y BORRAR todos los datos (reset completo)

```bash
# ⚠️ CUIDADO: Esto elimina las bases de datos y todos los datos persistidos
docker compose down -v
```

| Comando                     | Contenedores | Redes | Volúmenes (datos) |
| --------------------------- | ------------ | ----- | ------------------ |
| `docker compose down`       | ✅ Elimina   | ✅ Elimina | ❌ Conserva     |
| `docker compose down -v`    | ✅ Elimina   | ✅ Elimina | ✅ **Elimina**   |
| `docker compose stop`       | ⏸️ Pausa     | ❌ Conserva | ❌ Conserva     |

---

## 5. Comandos Docker importantes

```bash
# ─── Estado ──────────────────────────────────────────────────────────
docker compose ps                          # Ver estado de los contenedores
docker compose logs                        # Ver logs de todos los servicios
docker compose logs postgres               # Ver logs de un servicio específico
docker compose logs -f postgres            # Seguir logs en tiempo real (Ctrl+C para salir)
docker compose logs --tail=50 core-api     # Últimas 50 líneas de un servicio

# ─── Iniciar / Detener ──────────────────────────────────────────────
docker compose up -d                       # Levantar todos los servicios en background
docker compose up postgres redis -d        # Levantar solo servicios específicos
docker compose stop                        # Pausar contenedores (sin eliminar)
docker compose start                       # Reanudar contenedores pausados
docker compose restart postgres            # Reiniciar un servicio específico
docker compose down                        # Detener y eliminar contenedores
docker compose down -v                     # Detener, eliminar contenedores Y volúmenes

# ─── Ejecutar comandos dentro de un contenedor ──────────────────────
docker compose exec postgres psql -U nexont -d nexont_db   # Abrir terminal SQL
docker compose exec redis redis-cli                        # Abrir terminal Redis

# ─── Volúmenes (persistencia de datos) ──────────────────────────────
docker volume ls                           # Listar volúmenes
docker volume inspect nexont_postgres_data # Ver detalles de un volumen
docker volume rm nexont_postgres_data      # Eliminar un volumen específico

# ─── Limpieza general ───────────────────────────────────────────────
docker system prune                        # Limpiar recursos no usados
docker system prune -a --volumes           # ⚠️ Limpieza total (imágenes, volúmenes, etc.)
```

---

## 6. Base de datos (Prisma + PostgreSQL)

### Comandos esenciales de Prisma

Todos estos comandos se ejecutan desde la carpeta `core-api/`:

```bash
cd core-api

# ─── Generar Cliente Prisma ─────────────────────────────────────────
npx prisma generate
# → Regenera el cliente de Prisma basado en schema.prisma
# → Ejecutar después de cualquier cambio al schema
# → Se necesita antes de poder usar Prisma en el código

# ─── Crear/Aplicar Migraciones (desarrollo) ─────────────────────────
npx prisma migrate dev
# → Compara tu schema con la BD, crea una migración SQL y la aplica
# → Te pide un nombre descriptivo para la migración
# → También ejecuta `prisma generate` automáticamente

npx prisma migrate dev --name agregar_tabla_products
# → Lo mismo pero con nombre predefinido (sin prompt interactivo)

# ─── Aplicar Migraciones (producción) ───────────────────────────────
npx prisma migrate deploy
# → Aplica migraciones pendientes SIN crear nuevas
# → Usado en producción / CI/CD

# ─── Ver estado de migraciones ──────────────────────────────────────
npx prisma migrate status
# → Muestra qué migraciones están aplicadas y cuáles pendientes

# ─── Abrir Prisma Studio (GUI para la BD) ──────────────────────────
npx prisma studio
# → Abre un navegador en http://localhost:5555
# → Permite ver, crear, editar y eliminar registros visualmente

# ─── Resetear la base de datos ──────────────────────────────────────
npx prisma migrate reset
# → ⚠️ BORRA toda la BD, re-aplica todas las migraciones y ejecuta seed
# → Útil cuando hay conflictos de migraciones

# ─── Introspeccionar BD existente ───────────────────────────────────
npx prisma db pull
# → Lee la BD actual y actualiza schema.prisma con lo que encuentra
# → Útil para sincronizar si alguien modificó la BD manualmente

# ─── Enviar schema directo a la BD (sin migración) ──────────────────
npx prisma db push
# → Sincroniza el schema con la BD sin generar migración
# → ⚠️ Solo para prototipado rápido, NO usar en producción
```

### Acceder directamente a PostgreSQL

```bash
# Desde Docker
docker compose exec postgres psql -U nexont -d nexont_db

# Comandos útiles dentro de psql:
\dt              -- Listar tablas
\d users         -- Ver estructura de la tabla users
SELECT * FROM users;  -- Consultar datos
\q               -- Salir
```

### Archivo de schema actual

El schema de Prisma está en `core-api/prisma/schema.prisma`. Ejemplo actual:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               Int      @id @default(autoincrement())
  email            String   @unique
  password         String
  firstName        String
  lastName         String
  phone            String?
  address          String?
  isEmailVerified  Boolean  @default(false)
  // ... más campos
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@map("users")
}
```

---

## 7. Trabajar con los microservicios

### Chat Service (Socket.io)

```bash
cd services/chat-service
npm install          # Solo la primera vez
npm run dev          # Si tiene script dev, sino: node src/index.js
# Puerto: 3001
```

### Chatbot Service (FastAPI / Python)

```bash
cd services/chatbot-service
python3 -m venv venv              # Crear entorno virtual (primera vez)
source venv/bin/activate          # Activar entorno virtual
pip install -r requirements.txt   # Instalar dependencias
uvicorn src.main:app --reload --port 8000
# Puerto: 8000
```

### Search Service (Express)

```bash
cd services/search-service
npm install          # Solo la primera vez
node src/index.js    # O npm run dev si configuras el script
# Puerto: 3002
```

### Health checks (verificar que un servicio está vivo)

```bash
curl http://localhost:3000/health   # Core API
curl http://localhost:3001/health   # Chat Service
curl http://localhost:3002/health   # Search Service
curl http://localhost:8000/health   # Chatbot Service
```

---

## 8. Variables de entorno

### Core API (`core-api/.env`)

```env
PORT=3000
DATABASE_URL=postgresql://nexont:nexont_pass@localhost:5432/nexont_db
JWT_SECRET=mi_secreto_super_seguro_cambiar_esto
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672

# Email (para verificación de correo)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password

# URLs
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost
```

> **Importante:** En desarrollo local la URL de PostgreSQL usa `localhost`, en Docker usa el nombre del servicio (`postgres`).

### Chat Service (`services/chat-service/.env`)

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/nexont_chat
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
```

### Chatbot Service (`services/chatbot-service/.env`)

```env
PORT=8000
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
OPENAI_API_KEY=sk-...
# o ANTHROPIC_API_KEY=sk-ant-...
```

### Search Service (`services/search-service/.env`)

```env
PORT=3002
DATABASE_URL=postgresql://nexont:nexont_pass@localhost:5432/nexont_db
REDIS_URL=redis://localhost:6379
```

---

## 9. Puertos y URLs

| Servicio        | Puerto | URL en desarrollo          | Contenedor Docker     |
| --------------- | ------ | -------------------------- | --------------------- |
| Nginx (proxy)   | 80     | `http://localhost`         | `nexont_nginx`        |
| Core API        | 3000   | `http://localhost:3000`    | —  (local)            |
| Frontend (Vite) | 5173   | `http://localhost:5173`    | —  (local)            |
| Chat Service    | 3001   | `http://localhost:3001`    | —  (local)            |
| Search Service  | 3002   | `http://localhost:3002`    | —  (local)            |
| Chatbot Service | 8000   | `http://localhost:8000`    | —  (local)            |
| PostgreSQL      | 5432   | `localhost:5432`           | `nexont_postgres`     |
| MongoDB         | 27017  | `localhost:27017`          | `nexont_mongo`        |
| Redis           | 6379   | `localhost:6379`           | `nexont_redis`        |
| RabbitMQ        | 5672   | `localhost:5672`           | `nexont_rabbitmq`     |
| RabbitMQ UI     | 15672  | `http://localhost:15672`   | `nexont_rabbitmq`     |

> **Tip:** Puedes acceder al panel de RabbitMQ en `http://localhost:15672` (user: `guest`, pass: `guest`).

---

## 10. Guía: Implementar una nueva funcionalidad

### Flujo general de trabajo

```
1. Crear una rama nueva
   └─ git checkout -b feature/nombre-descriptivo

2. ¿Qué necesitas modificar?
   ├─ ¿Base de datos?        → Sección 13 (Modificar la BD)
   ├─ ¿Nuevo módulo backend? → Sección 11 (Crear módulo en Core API)
   ├─ ¿Nuevo microservicio?  → Sección 12 (Crear microservicio)
   ├─ ¿Nueva página frontend?→ Sección 14 (Agregar página frontend)
   └─ ¿Lógica existente?     → Editar archivos del módulo correspondiente

3. Probar que todo funciona
   └─ Verificar health checks, probar endpoints, revisar logs

4. Commit y push
   └─ git add . && git commit -m "feat: descripción" && git push

5. Crear Pull Request
```

---

## 11. Guía: Crear un nuevo módulo en Core API

Los módulos siguen el patrón **Ruta → Controlador → Servicio**. Ejemplo para crear un módulo `reviews`:

### Paso 1 — Crear la estructura de carpetas

```bash
mkdir -p core-api/src/modules/reviews
touch core-api/src/modules/reviews/reviews.routes.js
touch core-api/src/modules/reviews/reviews.controller.js
touch core-api/src/modules/reviews/reviews.service.js
```

### Paso 2 — Definir las rutas (`reviews.routes.js`)

```javascript
const router = require('express').Router();
const authMiddleware = require('../../shared/middleware/auth.middleware');
const reviewsController = require('./reviews.controller');

// GET /api/v1/reviews
router.get('/', reviewsController.list);

// POST /api/v1/reviews (protegido)
router.post('/', authMiddleware, reviewsController.create);

// PUT /api/v1/reviews/:id (protegido)
router.put('/:id', authMiddleware, reviewsController.update);

// DELETE /api/v1/reviews/:id (protegido)
router.delete('/:id', authMiddleware, reviewsController.remove);

module.exports = router;
```

### Paso 3 — Crear el controlador (`reviews.controller.js`)

```javascript
const reviewsService = require('./reviews.service');

const list = async (req, res) => {
  try {
    const reviews = await reviewsService.list();
    res.json(reviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const review = await reviewsService.create(req.user.id, req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ... más métodos

module.exports = { list, create, update, remove };
```

### Paso 4 — Crear el servicio (`reviews.service.js`)

```javascript
const prisma = require('../../config/database');

const list = async () => {
  return prisma.review.findMany({
    include: { user: { select: { id: true, firstName: true } } },
  });
};

const create = async (userId, data) => {
  return prisma.review.create({
    data: { ...data, userId },
  });
};

// ... más métodos

module.exports = { list, create, update, remove };
```

### Paso 5 — Registrar las rutas en `app.js`

```javascript
// En core-api/src/app.js, agregar:
const reviewsRoutes = require('./modules/reviews/reviews.routes');

// ... junto con las demás rutas:
app.use('/api/v1/reviews', reviewsRoutes);
```

### Paso 6 — (Si necesitas BD) Agregar modelo en Prisma

Ver **Sección 13** para los pasos detallados de migración.

### Estructura de un módulo completo

```
core-api/src/modules/reviews/
├── reviews.routes.js       ← Define endpoints HTTP
├── reviews.controller.js   ← Recibe request, valida, llama al servicio
└── reviews.service.js      ← Lógica de negocio + queries a la BD
```

> **Regla:** Los controladores NO deben contener lógica de negocio ni queries directas. Todo pasa por el service.

---

## 12. Guía: Crear un nuevo microservicio

### Paso 1 — Crear la estructura

```bash
mkdir -p services/mi-servicio/src
cd services/mi-servicio
npm init -y
npm install express cors dotenv helmet winston
npm install -D nodemon
```

### Paso 2 — Crear el entry point (`src/index.js`)

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check (obligatorio para todos los servicios)
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'mi-servicio' }));

// Tus rutas aquí...

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`mi-servicio running on port ${PORT}`));
```

### Paso 3 — Crear `.env`

```env
PORT=3003
# Agregar las variables que necesites
```

### Paso 4 — Crear `Dockerfile`

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 3003
CMD ["node", "src/index.js"]
```

### Paso 5 — Agregar al `docker-compose.prod.yml`

```yaml
  mi-servicio:
    build: ./services/mi-servicio
    container_name: nexont_mi_servicio
    env_file:
      - ./services/mi-servicio/.env
    depends_on:
      - redis          # Solo si lo necesitas
    restart: always
```

### Paso 6 — (Opcional) Agregar ruta en Nginx si necesita ser accesible desde el frontend

Editar `nginx/dev.conf` para agregar un upstream y location:

```nginx
upstream mi_servicio {
    server localhost:3003;
}

# Dentro del bloque server:
location /mi-servicio/ {
    proxy_pass http://mi_servicio;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
}
```

---

## 13. Guía: Modificar la base de datos

### Agregar una nueva tabla

**1. Editar el schema** (`core-api/prisma/schema.prisma`):

```prisma
model Product {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  price       Float
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("products")
}
```

> **No olvides** agregar la relación inversa en el modelo `User`:
> ```prisma
> model User {
>   // ... campos existentes
>   products Product[]
> }
> ```

**2. Crear y aplicar la migración:**

```bash
cd core-api
npx prisma migrate dev --name agregar_tabla_products
```

**3. Verificar:**

```bash
npx prisma studio   # Abre GUI para ver la tabla nueva
```

### Agregar un campo a una tabla existente

**1. Editar el schema:**

```prisma
model User {
  // ... campos existentes
  avatarUrl String?    // ← Nuevo campo opcional
}
```

**2. Migrar:**

```bash
npx prisma migrate dev --name agregar_avatar_a_users
```

### Cambiar un campo existente

```prisma
// Antes:
phone String?

// Después (ahora es requerido):
phone String
```

```bash
npx prisma migrate dev --name hacer_phone_requerido
# ⚠️ Prisma te advertirá si hay datos que no cumplen la restricción
```

### Eliminar un campo o tabla

```bash
# 1. Eliminar del schema.prisma
# 2. Migrar
npx prisma migrate dev --name eliminar_campo_x
```

### Flujo visual

```
  Editar schema.prisma
         │
         ▼
  npx prisma migrate dev --name descripcion
         │
         ├─ Crea archivo SQL en prisma/migrations/
         ├─ Aplica la migración a la BD
         └─ Regenera el cliente Prisma
         │
         ▼
  Listo para usar en el código
  (prisma.product.create, etc.)
```

> **⚠️ Regla de oro:** NUNCA modifiques la base de datos con SQL manual. Siempre usa migraciones de Prisma para que todo el equipo esté sincronizado.

---

## 14. Guía: Agregar una nueva página al frontend

### Paso 1 — Crear el componente

```bash
touch frontend/src/pages/MiPagina.jsx
```

```jsx
// frontend/src/pages/MiPagina.jsx
import { useState, useEffect } from 'react';
import api from '../api/api';

export default function MiPagina() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('/mi-recurso')
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Mi Página</h1>
      {/* Tu contenido */}
    </div>
  );
}
```

### Paso 2 — Agregar la ruta en `App.jsx`

```jsx
import MiPagina from './pages/MiPagina';

// Dentro del <Routes>:
<Route path="/mi-pagina" element={<MiPagina />} />
```

### Paso 3 — Usar la instancia de Axios configurada

El proyecto tiene una instancia de Axios preconfigurada en `frontend/src/api/api.js`. Siempre úsala en lugar de `axios` directamente:

```javascript
import api from '../api/api';

// GET
const res = await api.get('/products');

// POST
const res = await api.post('/auth/login', { email, password });

// PUT
const res = await api.put('/users/1', { firstName: 'Nuevo' });

// DELETE
const res = await api.delete('/products/1');
```

---

## 15. Flujo de producción

### Desplegar en producción

```bash
# 1. Asegurar que existe el archivo .env.prod en la raíz con las variables de producción
# 2. Construir y levantar todo
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d

# 3. Ver logs
docker compose -f docker-compose.prod.yml logs -f

# 4. Apagar
docker compose -f docker-compose.prod.yml down
```

### Diferencias entre desarrollo y producción

| Aspecto          | Desarrollo (`docker-compose.yml`)         | Producción (`docker-compose.prod.yml`)      |
| ---------------- | ----------------------------------------- | ------------------------------------------- |
| Core API         | Corre local con `npm run dev` (nodemon)   | Corre en container con `node src/app.js`    |
| Frontend         | Vite dev server con HMR                   | Build estático servido por Nginx            |
| Nginx            | Proxy a Vite dev server (:5173)           | Sirve archivos estáticos desde `/dist`      |
| Migraciones      | `npx prisma migrate dev`                  | `npx prisma migrate deploy` (automático)    |
| Variables        | `.env` locales por servicio               | `.env.prod` centralizado                    |
| Puertos expuestos| Todos expuestos al host                   | Solo 80/443 (vía Nginx)                     |

---

## 16. Troubleshooting (problemas comunes)

### "Cannot find module '@prisma/client'"
```bash
cd core-api
npx prisma generate
```

### "Database nexont_db does not exist"
```bash
# Verificar que PostgreSQL está corriendo
docker compose ps postgres
# Reiniciar el contenedor
docker compose restart postgres
# Esperar 5 segundos y correr migraciones
npx prisma migrate dev
```

### "Port 5432 already in use"
```bash
# Buscar qué proceso usa el puerto
lsof -i :5432
# Matar el proceso o cambiar el puerto en docker-compose.yml
```

### "ECONNREFUSED 127.0.0.1:5432"
Asegúrate de que tu `DATABASE_URL` en `.env` usa `localhost` (desarrollo local) y no `postgres` (que es para Docker-to-Docker).

### Contenedor no levanta
```bash
docker compose logs nombre_servicio    # Ver por qué falló
docker compose up nombre_servicio      # Levantar sin -d para ver logs en vivo
```

### Migración con conflictos
```bash
# ⚠️ Nuclear option: resetear toda la BD y reaplicar migraciones
npx prisma migrate reset
# O eliminar la última migración manualmente (si no ha sido pusheada)
rm -rf core-api/prisma/migrations/TIMESTAMP_nombre/
npx prisma migrate dev
```

### "CORS error" en el frontend
Verificar que Nginx está corriendo (`docker compose ps nginx`) y que estás accediendo a través de `http://localhost` (puerto 80), no directamente al puerto 5173.

### Redis / RabbitMQ no conecta
```bash
docker compose restart redis rabbitmq
docker compose logs redis rabbitmq
```

---

## 17. Convenciones del equipo

### Estructura de archivos

```
core-api/src/modules/<nombre>/
├── <nombre>.routes.js        ← Rutas HTTP (router de Express)
├── <nombre>.controller.js    ← Controladores (req/res handling)
└── <nombre>.service.js       ← Servicios (lógica de negocio)
```

### Nombrado

| Elemento | Convención | Ejemplo |
| -------- | ---------- | ------- |
| Archivos | `kebab-case` | `auth.service.js`, `email.service.js` |
| Variables / funciones | `camelCase` | `findUserById`, `isEmailVerified` |
| Modelos Prisma | `PascalCase` | `User`, `Product`, `Order` |
| Tablas BD | `snake_case` (via `@@map`) | `users`, `products` |
| Rutas API | `kebab-case` plural | `/api/v1/products`, `/api/v1/order-items` |
| Variables de entorno | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `JWT_SECRET` |

### Commits (convención recomendada)

```
feat: agregar endpoint de listado de productos
fix: corregir validación de email en registro
refactor: extraer lógica de pago a servicio
docs: actualizar guía de desarrolladores
chore: actualizar dependencias
```

### Reglas generales

1. **Nunca** hacer queries directas a la BD desde un controlador → siempre a través del service
2. **Nunca** modificar la BD con SQL manual → siempre con migraciones de Prisma
3. **Siempre** agregar health check (`/health`) a cualquier servicio nuevo
4. **Siempre** usar la instancia `api.js` del frontend en lugar de `axios` directamente
5. **Nunca** commitear archivos `.env` → deben estar en `.gitignore`
6. **Siempre** documentar variables de entorno nuevas en esta guía

---

> **¿Dudas?** Consulta el [README principal](../README.md) o pregunta al equipo. 🚀
