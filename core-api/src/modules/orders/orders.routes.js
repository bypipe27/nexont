const router = require('express').Router();

// GET /api/v1/orders
router.get('/', (req, res) => res.json({ message: 'list orders - TODO' }));

// GET /api/v1/orders/:id
router.get('/:id', (req, res) => res.json({ message: 'get order - TODO' }));

// POST /api/v1/orders
router.post('/', (req, res) => res.json({ message: 'create order - TODO' }));

// PATCH /api/v1/orders/:id/status
router.patch('/:id/status', (req, res) => res.json({ message: 'update order status - TODO' }));

// DELETE /api/v1/orders/:id
router.delete('/:id', (req, res) => res.json({ message: 'cancel order - TODO' }));

module.exports = router;
