// const router = require('express').Router();
// const paymentsController = require('./payments.controller');
// console.log('Valor del controlador:', paymentsController);
// const authMiddleware = require('../../shared/middleware/auth.middleware');

// // POST /api/v1/payments/intent - Crear Payment Intent
// router.post('/intent', authMiddleware, paymentsController.createPaymentIntent);

// // POST /api/v1/payments/confirm - Confirmar Payment Intent
// router.post('/confirm', authMiddleware, paymentsController.confirmPaymentIntent);

// // GET /api/v1/payments (legacy)
// router.get('/', (req, res) => res.json({ message: 'list payments - TODO' }));

// // GET /api/v1/payments/:id (legacy)
// router.get('/:id', (req, res) => res.json({ message: 'get payment - TODO' }));

// module.exports = router;
const router = require('express').Router();
const paymentsController = require('./payments.controller');
// Aplicamos desestructuración aquí para obtener la función, no el objeto
const { authMiddleware } = require('../../shared/middleware/auth.middleware');

// Validar en consola (opcional, puedes borrarlo después)

// POST /api/v1/payments/intent - Crear Payment Intent
// Ahora authMiddleware es una función válida para Express
router.post('/intent', authMiddleware, paymentsController.createPaymentIntent);

// POST /api/v1/payments/confirm - Confirmar Payment Intent
router.post('/confirm', authMiddleware, paymentsController.confirmPaymentIntent);

// GET /api/v1/payments (legacy)
router.get('/', (req, res) => res.json({ message: 'list payments - TODO' }));

// GET /api/v1/payments/:id (legacy)
router.get('/:id', (req, res) => res.json({ message: 'get payment - TODO' }));

module.exports = router;