const router = require('express').Router();

// GET /api/v1/payments
router.get('/', (req, res) => res.json({ message: 'list payments - TODO' }));

// GET /api/v1/payments/:id
router.get('/:id', (req, res) => res.json({ message: 'get payment - TODO' }));

// POST /api/v1/payments
router.post('/', (req, res) => res.json({ message: 'create payment - TODO' }));

// PATCH /api/v1/payments/:id/status
router.patch('/:id/status', (req, res) => res.json({ message: 'update payment status - TODO' }));

module.exports = router;
