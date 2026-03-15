const router = require('express').Router();
const cartController = require('./cart.controller');
const { validateAddToCart, validateUpdateCartItem } = require('./cart.validation');

// GET /api/v1/cart
router.get('/', cartController.getCart);

// POST /api/v1/cart/items
router.post('/items', validateAddToCart, cartController.addToCart);

// PATCH /api/v1/cart/items/:productId
router.patch('/items/:productId', validateUpdateCartItem, cartController.updateCartItem);

// DELETE /api/v1/cart/items/:productId
router.delete('/items/:productId', cartController.removeItem);

// DELETE /api/v1/cart
router.delete('/', cartController.clearUserCart);

module.exports = router;
