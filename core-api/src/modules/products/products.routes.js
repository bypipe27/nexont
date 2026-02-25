const router = require('express').Router();

// GET /api/v1/products
router.get('/', (req, res) => res.json({ message: 'list products - TODO' }));

// GET /api/v1/products/:id
router.get('/:id', (req, res) => res.json({ message: 'get product - TODO' }));

// POST /api/v1/products
router.post('/', (req, res) => res.json({ message: 'create product - TODO' }));

// PUT /api/v1/products/:id
router.put('/:id', (req, res) => res.json({ message: 'update product - TODO' }));

// DELETE /api/v1/products/:id
router.delete('/:id', (req, res) => res.json({ message: 'delete product - TODO' }));

module.exports = router;
