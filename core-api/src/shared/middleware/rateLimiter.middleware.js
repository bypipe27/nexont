const rateLimit = require('express-rate-limit');

// ─── Rate limiter para login (anti brute-force) ─────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 intentos por IP
  message: {
    error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// ─── Rate limiter para registro ──────────────────────────────────────────────
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 registros por IP por hora
  message: {
    error: 'Demasiados registros desde esta IP. Intenta de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Rate limiter general para API ───────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const path = req.originalUrl || req.url || '';
    return (
      path.startsWith('/api/v1/users/me/verification') ||
      path.startsWith('/api/v1/users/me/documents') ||
      path.startsWith('/api/v1/users/me/verification/form')
    );
  },
});

module.exports = { loginLimiter, registerLimiter, apiLimiter };
