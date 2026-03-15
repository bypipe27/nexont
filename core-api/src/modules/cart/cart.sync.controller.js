const router = require('express').Router();
const cartService = require('./cart.service');
const logger = require('../../shared/logger/logger');

/**
 * Sincronizar carrito anónimo con el carrito del usuario autenticado
 * POST /api/v1/cart/sync
 * Body: { items: [{ productId, quantity }, ...] }
 */
const syncAnonymousCart = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items debe ser un array' });
    }

    // Agregar cada item del carrito anónimo
    for (const item of items) {
      try {
        await cartService.addItemToCart({
          userId: req.user.userId,
          productId: item.productId,
          quantity: item.quantity,
        });
      } catch (err) {
        logger.warn(`Error sincronizando producto ${item.productId}:`, err.message);
        // Continuar con el siguiente item
      }
    }

    // Retornar el carrito final sincronizado
    const cart = await cartService.getCartByUser(req.user.userId);
    res.json({
      message: 'Carrito sincronizado',
      ...cart,
    });
  } catch (error) {
    logger.error('Error sincronizando carrito', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ error: 'No se pudo sincronizar el carrito' });
  }
};

module.exports = {
  syncAnonymousCart,
};