const authService = require('./auth.service');

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const { user, token } = await authService.register({ email, password, firstName, lastName });
    res.status(201).json({ message: 'Usuario registrado con éxito', user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  register,
};
