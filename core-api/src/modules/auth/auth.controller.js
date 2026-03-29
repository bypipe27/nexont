const authService = require('./auth.service');
const logger = require('../../shared/logger/logger');

// ─── Mensajes de error amigables ──────────────────────────────────────────────
const friendlyError = (err) => {
  const msg = err.message || '';

  // Errores conocidos del service — devolverlos tal cual (ya son amigables)
  const knownMessages = [
    'El correo electrónico ya está registrado',
    'Credenciales incorrectas',
    'Debes verificar tu correo electrónico',
    'Tu cuenta ha sido desactivada',
    'El enlace de verificación es inválido o ha expirado',
    'Refresh token requerido',
    'Refresh token inválido o expirado',
    'Token de tipo incorrecto',
    'Usuario no disponible',
    'Usuario no encontrado',
  ];

  if (knownMessages.some(m => msg.includes(m))) return msg;

  // Errores técnicos de Prisma — reemplazar con mensaje genérico
  if (msg.includes('Unique constraint') || msg.includes('unique constraint')) {
    return 'Este correo electrónico ya está registrado.';
  }
  if (msg.includes('prisma') || msg.includes('Prisma')) {
    return 'Error al procesar la solicitud. Inténtalo de nuevo.';
  }
  if (msg.includes('bcrypt') || msg.includes('hash')) {
    return 'Error al procesar la solicitud. Inténtalo de nuevo.';
  }
  if (msg.includes('jwt') || msg.includes('JWT') || msg.includes('JsonWebToken')) {
    return 'Sesión inválida. Por favor inicia sesión de nuevo.';
  }

  // Cualquier otro error técnico
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { correo, contrasena, nombres, apellidos } = req.body;
    const { user } = await authService.register({ correo, contrasena, nombres, apellidos });
    logger.info('Nuevo registro de usuario', { correo });
    res.status(201).json({
      message: 'Usuario registrado con éxito. Revisa tu correo electrónico para verificar tu cuenta.',
      user,
    });
  } catch (error) {
    logger.warn('Error en registro', { error: error.message });
    res.status(400).json({ error: friendlyError(error) });
  }
};

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token de verificación requerido' });
    const result = await authService.verifyEmail(token);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: friendlyError(error) });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const result = await authService.login({ correo, contrasena });
    logger.info('Login exitoso', { userId: result.user.id, correo });
    res.json({ message: 'Sesión iniciada correctamente', ...result });
  } catch (error) {
    logger.warn('Intento de login fallido', { error: error.message });
    res.status(400).json({ error: friendlyError(error) });
  }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.json({ message: 'Token renovado correctamente', ...result });
  } catch (error) {
    logger.warn('Refresh token fallido', { error: error.message });
    res.status(401).json({ error: friendlyError(error) });
  }
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
const me = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.userId);
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: friendlyError(error) });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  logger.info('Logout', { userId: req.user.userId });
  res.json({ message: 'Sesión cerrada correctamente' });
};

module.exports = { register, verifyEmail, login, refresh, me, logout };