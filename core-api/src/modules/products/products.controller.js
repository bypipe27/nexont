const productsService = require('./products.service');
const logger = require('../../shared/logger/logger');
const cloudinary = require('../../shared/image/cloudinary');
const fs = require('fs');

// ─── POST /api/v1/products ────────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    console.log('BODY RECIBIDO:', req.body);
    const { titulo, descripcion, precio, stock, condicion, promedioCalificacion } = req.body;
    const sellerId = req.user.userId;
    let imageUrl = null;

    if (req.file) {
      // Subir imagen a Cloudinary desde buffer usando promesa
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'productos' }, (error, result) => {
          if (error) return reject(new Error('Error al subir imagen a Cloudinary'));
          resolve(result.secure_url);
        });
        stream.end(req.file.buffer);
      });
    }

    const product = await productsService.createProduct({
      titulo, descripcion, precio, stock, sellerId, imageUrl, condicion, promedioCalificacion,
    });

    logger.info('Producto creado', { productId: product.id, sellerId });

    res.status(201).json({ message: 'Producto publicado correctamente', product });
  } catch (error) {
    logger.warn('Error al crear producto', { error: error.message, userId: req.user?.userId });
    res.status(400).json({ error: error.message });
  }
};

// ─── GET /api/v1/products ─────────────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { search, condition, minPrice, maxPrice, minRating } = req.query;
    const products = await productsService.getProducts({ search, condition, minPrice, maxPrice, minRating });
    res.json({ products });
  } catch (error) {
    logger.error('Error al listar productos', { error: error.message });
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

// ─── GET /api/v1/products/my ──────────────────────────────────────────────────
const getMyProducts = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const products = await productsService.getMyProducts(sellerId);
    res.json({ products });
  } catch (error) {
    logger.error('Error al listar productos del vendedor', { error: error.message });
    res.status(500).json({ error: 'Error al obtener tus productos' });
  }
};

// ─── GET /api/v1/products/:id ─────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      logger.warn('ID de producto inválido al obtener', { id: req.params.id, userId: req.user?.userId });
      return res.status(400).json({ error: 'ID de producto inválido' });
    }
    const product = await productsService.getProductById(id);
    res.json({ product });
  } catch (error) {
    logger.warn('Error al obtener producto', { error: error.message });
    res.status(404).json({ error: error.message });
  }
};

// ─── PUT /api/v1/products/:id ─────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      logger.warn('ID de producto inválido al actualizar', { id: req.params.id, userId: req.user?.userId });
      return res.status(400).json({ error: 'ID de producto inválido' });
    }
    const sellerId = req.user.userId;
    let imageUrl = null;
    // Si hay archivo, subir a Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'productos' });
      imageUrl = result.secure_url;
      fs.unlink(req.file.path, () => {});
    }
    // Pasar imageUrl en el body
    const updateData = { ...req.body };
    if (imageUrl) updateData.imageUrl = imageUrl;
    const product = await productsService.updateProduct(id, sellerId, updateData);
    logger.info('Producto actualizado', { productId: id, sellerId });
    res.json({ message: 'Producto actualizado correctamente', product });
  } catch (error) {
    logger.warn('Error al actualizar producto', { error: error.message });
    const status = error.message.includes('permiso') ? 403 : 404;
    res.status(status).json({ error: error.message });
  }
};

// ─── DELETE /api/v1/products/:id ──────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      logger.warn('ID de producto inválido al eliminar', { id: req.params.id, userId: req.user?.userId });
      return res.status(400).json({ error: 'ID de producto inválido' });
    }
    const sellerId = req.user.userId;

    await productsService.deleteProduct(id, sellerId);

    logger.info('Producto eliminado', { productId: id, sellerId });

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    logger.warn('Error al eliminar producto', { error: error.message });
    const status = error.message.includes('permiso') ? 403 : 404;
    res.status(status).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
