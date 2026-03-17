const router = require('express').Router();
const ordersController = require('./orders.controller');

// POST /api/v1/orders → confirmar compra
router.post('/', ordersController.confirm);

// GET /api/v1/orders → listar mis órdenes
router.get('/', ordersController.getMyOrders);

// GET /api/v1/orders/:id → detalle de una orden
router.get('/:id', ordersController.getOrderDetail);

// PATCH /api/v1/orders/:id/status → (reservado para futuro, ej: admin cambia estado)
router.patch('/:id/status', (req, res) => res.json({ message: 'update order status - TODO' }));

// DELETE /api/v1/orders/:id → (reservado para futuro cancelación)
router.delete('/:id', (req, res) => res.json({ message: 'cancel order - TODO' }));

module.exports = router;
