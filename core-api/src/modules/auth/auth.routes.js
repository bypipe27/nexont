const router = require('express').Router();

// POST /api/v1/auth/register
router.post('/register', (req, res) => {
  res.json({ message: 'register - TODO' });
});

// POST /api/v1/auth/login
router.post('/login', (req, res) => {
  res.json({ message: 'login - TODO' });
});

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'logout - TODO' });
});

// GET /api/v1/auth/me
router.get('/me', (req, res) => {
  res.json({ message: 'me - TODO' });
});

module.exports = router;
