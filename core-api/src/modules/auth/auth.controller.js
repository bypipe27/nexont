const authService = require('./auth.service');

// ─── REGISTER ────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Todos los campos son requeridos: email, password, firstName, lastName' });
    }

    const { user } = await authService.register({ email, password, firstName, lastName });

    res.status(201).json({
      message: 'Usuario registrado con éxito. Revisa tu correo electrónico para verificar tu cuenta.',
      user,
    });
  } catch (error) {
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const result = await authService.login({ email, password });

    res.json({
      message: 'Sesión iniciada correctamente',
      ...result,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { register, verifyEmail, login };
