require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const productsRoutes = require('./modules/products/products.routes');
const ordersRoutes = require('./modules/orders/orders.routes');
const paymentsRoutes = require('./modules/payments/payments.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');

const app = express();

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ─── Rutas ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);

// ─── Healthcheck ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'core-api' }));

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`core-api running on port ${PORT}`));

module.exports = app;
