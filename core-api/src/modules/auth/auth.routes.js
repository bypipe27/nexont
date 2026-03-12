const router = require('express').Router();
const authController = require('./auth.controller');
const { authMiddleware } = require('../../shared/middleware/auth.middleware');
const { loginLimiter, registerLimiter } = require('../../shared/middleware/rateLimiter.middleware');
const { validate, registerSchema, loginSchema, refreshTokenSchema } = require('../../shared/validation/auth.validation');

// ─── Rutas públicas ──────────────────────────────────────────────────────────

// POST /api/v1/auth/register
router.post('/register', registerLimiter, validate(registerSchema), authController.register);

// GET  /api/v1/auth/verify-email?token=...
router.get('/verify-email', authController.verifyEmail);

// POST /api/v1/auth/login
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);

// ─── Rutas protegidas ────────────────────────────────────────────────────────

// GET /api/v1/auth/me
router.get('/me', authMiddleware, authController.me);

// POST /api/v1/auth/logout
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
