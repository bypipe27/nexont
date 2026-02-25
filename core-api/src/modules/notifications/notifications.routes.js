const router = require('express').Router();

// GET /api/v1/notifications
router.get('/', (req, res) => res.json({ message: 'list notifications - TODO' }));

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', (req, res) => res.json({ message: 'mark as read - TODO' }));

// DELETE /api/v1/notifications/:id
router.delete('/:id', (req, res) => res.json({ message: 'delete notification - TODO' }));

module.exports = router;
