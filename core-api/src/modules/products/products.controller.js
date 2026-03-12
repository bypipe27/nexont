const productsService = require('./products.service');
const logger = require('../../shared/logger/logger');

// ─── POST /api/v1/products ────────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const sellerId = req.user.userId;

    const product = await productsService.createProduct({
      name,
      description,
      price,
      stock,
      sellerId,
    });

    logger.info('Producto creado', { productId: product.id, sellerId });

    res.status(201).json({
      message: 'Producto publicado correctamente',
      product,
    });
  } catch (error) {
    logger.warn('Error al crear producto', { error: error.message, userId: req.user?.userId });
    res.status(400).json({ error: error.message });
  }
};

// ─── GET /api/v1/products ─────────────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const products = await productsService.getProducts();
    res.json({ products });
  } catch (error) {
    logger.error('Error al listar productos', { error: error.message });
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

// ─── GET /api/v1/products/:id ─────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await productsService.getProductById(id);
    res.json({ product });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// ─── PUT /api/v1/products/:id ─────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sellerId = req.user.userId;

    const product = await productsService.updateProduct(id, sellerId, req.body);

    logger.info('Producto actualizado', { productId: id, sellerId });

    res.json({
      message: 'Producto actualizado correctamente',
      product,
    });
  } catch (error) {
    logger.warn('Error al actualizar producto', { error: error.message });
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
};

// ─── DELETE /api/v1/products/:id ──────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sellerId = req.user.userId;

    await productsService.deleteProduct(id, sellerId);

    logger.info('Producto eliminado', { productId: id, sellerId });

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    logger.warn('Error al eliminar producto', { error: error.message });
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
