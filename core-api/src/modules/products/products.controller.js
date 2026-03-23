const productsService = require('./products.service');
const cloudinary = require('cloudinary').v2;

// ─── Configuración de Cloudinary ──────────────────────────────────────────────
cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });

// ─── Helper: authMiddleware expone req.user.userId (no .id) ───────────────────
const getSellerIdFromReq = (req) => parseInt(req.user.userId, 10);

// ─── Listar todos los productos activos ───────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { search, condition, minPrice, maxPrice, minRating } = req.query;
    const products = await productsService.getProducts({ search, condition, minPrice, maxPrice, minRating });

    const mapped = products.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      descripcion: p.descripcion,
      price: parseFloat(p.precio),
      stock: p.stock,
      condition: p.condicion?.toLowerCase() || 'nuevo',
      rating: p.promedioCalificacion || 0,
      imagenes: p.imagenes || [],
      seller: p.vendedor,
      creadoEn: p.creadoEn,
    }));

    res.json({ products: mapped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Obtener las últimas N publicaciones (Hero / Home) ────────────────────────
const getRecentProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 6;
    const products = await productsService.getRecentProducts(limit);

    const mapped = products.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      descripcion: p.descripcion,
      price: parseFloat(p.precio),
      stock: p.stock,
      condition: p.condicion?.toLowerCase() || 'nuevo',
      rating: p.promedioCalificacion || 0,
      imagenes: p.imagenes || [],
      seller: p.vendedor,
      creadoEn: p.creadoEn,
    }));

    res.json({ products: mapped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Obtener producto por ID ──────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const product = await productsService.getProductById(id);

    res.json({
      product: {
        id: product.id,
        titulo: product.titulo,
        descripcion: product.descripcion,
        price: parseFloat(product.precio),
        stock: product.stock,
        condition: product.condicion?.toLowerCase() || 'nuevo',
        rating: product.promedioCalificacion || 0,
        imagenes: product.imagenes || [],
        seller: product.vendedor,
        creadoEn: product.creadoEn,
      },
    });
  } catch (err) {
    if (err.message === 'Producto no encontrado') return res.status(404).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

// ─── Publicar nuevo producto ──────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { titulo, descripcion, precio, stock, condicion } = req.body;

    const sellerId = getSellerIdFromReq(req);
    if (isNaN(sellerId)) {
      return res.status(401).json({ error: 'Usuario no válido en el token' });
    }

    if (!titulo || precio === undefined || precio === null || precio === '') {
      return res.status(400).json({ error: 'titulo y precio son requeridos' });
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum < 0) {
      return res.status(400).json({ error: 'precio debe ser un número positivo' });
    }

    let imageUrl = null;

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'nexont/products', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    const product = await productsService.createProduct({
      titulo,
      descripcion,
      precio: precioNum,
      stock: parseInt(stock, 10) || 0,
      sellerId,
      imageUrl,
      condicion: condicion || 'NUEVO',
    });

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product: {
        id: product.id,
        titulo: product.titulo,
        descripcion: product.descripcion,
        price: parseFloat(product.precio),
        stock: product.stock,
        condition: product.condicion?.toLowerCase() || 'nuevo',
        imagenes: product.imagenes || [],
        seller: product.vendedor,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Actualizar producto ──────────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const sellerId = getSellerIdFromReq(req);
    const updated = await productsService.updateProduct(id, sellerId, req.body);

    res.json({
      message: 'Producto actualizado',
      product: {
        id: updated.id,
        titulo: updated.titulo,
        descripcion: updated.descripcion,
        price: parseFloat(updated.precio),
        stock: updated.stock,
        condition: updated.condicion?.toLowerCase() || 'nuevo',
        imagenes: updated.imagenes || [],
        seller: updated.vendedor,
      },
    });
  } catch (err) {
    if (err.message === 'Producto no encontrado') return res.status(404).json({ error: err.message });
    if (err.message.includes('permiso')) return res.status(403).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

// ─── Eliminar producto ────────────────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const sellerId = getSellerIdFromReq(req);
    await productsService.deleteProduct(id, sellerId);

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (err) {
    if (err.message === 'Producto no encontrado') return res.status(404).json({ error: err.message });
    if (err.message.includes('permiso')) return res.status(403).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

// ─── Listar productos del vendedor autenticado ────────────────────────────────
const getMyProducts = async (req, res) => {
  try {
    const sellerId = getSellerIdFromReq(req);
    const products = await productsService.getMyProducts(sellerId);

    const mapped = products.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      descripcion: p.descripcion,
      price: parseFloat(p.precio),
      stock: p.stock,
      condition: p.condicion?.toLowerCase() || 'nuevo',
      rating: p.promedioCalificacion || 0,
      imagenes: p.imagenes || [],
      seller: p.vendedor,
      creadoEn: p.creadoEn,
    }));

    res.json({ products: mapped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getProducts,
  getRecentProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
};