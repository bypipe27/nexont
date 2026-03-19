const authService = require('./auth.service');
const logger = require('../../shared/logger/logger');

// ─── REGISTER ────────────────────────────────────────────────────────────────
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
    logger.warn('Error en registro', { error: error.message, email: req.body?.email });
    res.status(400).json({ error: error.message });
  }
};

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token de verificación requerido' });
    }

    const result = await authService.verifyEmail(token);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const result = await authService.login({ correo, contrasena });

    logger.info('Login exitoso', { userId: result.user.id, correo });

    res.json({
      message: 'Sesión iniciada correctamente',
      ...result,
    });
  } catch (error) {
    logger.warn('Intento de login fallido', { error: error.message, email: req.body?.email });
    res.status(400).json({ error: error.message });
  }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      message: 'Token renovado correctamente',
      ...result,
    });
  } catch (error) {
    logger.warn('Refresh token fallido', { error: error.message });
    res.status(401).json({ error: error.message });
  }
};

// ─── GET ME (requiere auth) ──────────────────────────────────────────────────
const me = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.userId);
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── LOGOUT (requiere auth) ─────────────────────────────────────────────────
const logout = async (req, res) => {
  // En un sistema con blacklist en Redis se agregaría el token aquí.
  // Por ahora el frontend elimina el token; el backend confirma la acción.
  logger.info('Logout', { userId: req.user.userId });
  res.json({ message: 'Sesión cerrada correctamente' });
};

module.exports = { register, verifyEmail, login, refresh, me, logout };
