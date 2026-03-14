const cartService = require('./cart.service');
const logger = require('../../shared/logger/logger');

const parseProductId = (paramValue) => {
  const productId = parseInt(paramValue, 10);
  if (Number.isNaN(productId)) {
    throw new Error('ID de producto inválido');
  }
  return productId;
};

const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCartByUser(req.user.userId);
    res.json(cart);
  } catch (error) {
    logger.error('Error al obtener carrito', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addItemToCart({
      userId: req.user.userId,
      productId,
      quantity,
    });

    res.status(201).json({
      message: 'Producto agregado al carrito',
      ...cart,
    });
  } catch (error) {
    logger.warn('Error al agregar al carrito', { error: error.message, userId: req.user?.userId });
    const status = error.message === 'Producto no encontrado' ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const productId = parseProductId(req.params.productId);
    const { quantity } = req.body;

    const cart = await cartService.updateCartItemQuantity({
      userId: req.user.userId,
      productId,
      quantity,
    });

    res.json({
      message: 'Cantidad actualizada',
      ...cart,
    });
  } catch (error) {
    logger.warn('Error al actualizar item del carrito', { error: error.message, userId: req.user?.userId });

    if (error.message === 'ID de producto inválido') {
      return res.status(400).json({ error: error.message });
    }

    const status = ['Producto no encontrado', 'El producto no está en tu carrito'].includes(error.message)
      ? 404
      : 400;

    return res.status(status).json({ error: error.message });
  }
};

const removeItem = async (req, res) => {
  try {
    const productId = parseProductId(req.params.productId);

    const cart = await cartService.removeCartItem({
      userId: req.user.userId,
      productId,
    });

    res.json({
      message: 'Producto removido del carrito',
      ...cart,
    });
  } catch (error) {
    logger.warn('Error al eliminar item del carrito', { error: error.message, userId: req.user?.userId });

    if (error.message === 'ID de producto inválido') {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: 'No se pudo eliminar el item del carrito' });
  }
};

const clearUserCart = async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.user.userId);
    res.json({
      message: 'Carrito limpiado',
      ...cart,
    });
  } catch (error) {
    logger.error('Error al limpiar carrito', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ error: 'No se pudo limpiar el carrito' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeItem,
  clearUserCart,
};
