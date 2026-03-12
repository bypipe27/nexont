require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./shared/logger/logger');
const path = require('path'); // <-- NUEVO
require('./shared/cron/cleanup.cron');

const { authMiddleware } = require('./shared/middleware/auth.middleware');
const { apiLimiter } = require('./shared/middleware/rateLimiter.middleware');

const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const productsRoutes = require('./modules/products/products.routes');
const ordersRoutes = require('./modules/orders/orders.routes');
const paymentsRoutes = require('./modules/payments/payments.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');

const app = express();

// ─── Security Middlewares ────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// ─── CORS configurado (restringir en producción) ────────────────────────────
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost', 'http://localhost:5173', 'http://localhost:80'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('No permitido por CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── General Middlewares ─────────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(apiLimiter);

// ─── Servir imágenes estáticas ────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); // <-- NUEVO

// ─── Rutas públicas ─────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);

// ─── Rutas protegidas (requieren JWT válido) ─────────────────────────────────
app.use('/api/v1/users', authMiddleware, usersRoutes);
app.use('/api/v1/products', authMiddleware, productsRoutes);
app.use('/api/v1/orders', authMiddleware, ordersRoutes);
app.use('/api/v1/payments', authMiddleware, paymentsRoutes);
app.use('/api/v1/notifications', authMiddleware, notificationsRoutes);


// ─── Healthcheck ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'core-api' }));

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// ─── Error handler global ────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  logger.error('Error no controlado', { error: err.message, stack: err.stack, path: req.path });
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`core-api running on port ${PORT}`);
});

module.exports = app;
