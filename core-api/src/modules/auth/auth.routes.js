const router = require('express').Router();
const authController = require('./auth.controller');

// POST /api/v1/auth/register
router.post('/register', authController.register);

// GET  /api/v1/auth/verify-email?token=...
router.get('/verify-email', authController.verifyEmail);

// POST /api/v1/auth/login
router.post('/login', authController.login);

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'logout - TODO' });
});

// GET /api/v1/auth/me
router.get('/me', (req, res) => {
  res.json({ message: 'me - TODO' });
});

module.exports = router;
