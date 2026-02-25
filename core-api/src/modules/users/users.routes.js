const router = require('express').Router();

// GET /api/v1/users
router.get('/', (req, res) => res.json({ message: 'list users - TODO' }));

// GET /api/v1/users/:id
router.get('/:id', (req, res) => res.json({ message: 'get user - TODO' }));

// PUT /api/v1/users/:id
router.put('/:id', (req, res) => res.json({ message: 'update user - TODO' }));

// DELETE /api/v1/users/:id
router.delete('/:id', (req, res) => res.json({ message: 'delete user - TODO' }));

module.exports = router;
