const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── Validar JWT_SECRET al cargar el módulo ──────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

// ─── Middleware principal de autenticación ────────────────────────────────────
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verificar firma y expiración del JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Verificar que el usuario aún existe y está activo en BD
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        isActive: true,
        isAdmin: true,
        isVerifiedSeller: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Cuenta desactivada' });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ error: 'Email no verificado' });
    }

    // 3. Adjuntar datos completos del usuario al request
    req.user = {
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerifiedSeller: user.isVerifiedSeller,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    return res.status(401).json({ error: 'Error de autenticación' });
  }
};

// ─── Middleware de autorización por roles ─────────────────────────────────────
const requireRole = (...roles) => {
  return (req, res, next) => {
    // roles puede ser: 'isAdmin', 'isVerifiedSeller'
    const hasRole = roles.some((role) => req.user[role] === true);

    if (!hasRole) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }

    next();
  };
};

// ─── Middleware opcional: auth si hay token, pero no bloquea ─────────────────
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        isActive: true,
        isAdmin: true,
        isVerifiedSeller: true,
      },
    });

    req.user = user && user.isActive
      ? { userId: user.id, email: user.email, isAdmin: user.isAdmin, isVerifiedSeller: user.isVerifiedSeller }
      : null;
  } catch {
    req.user = null;
  }

  next();
};

module.exports = { authMiddleware, requireRole, optionalAuth };
