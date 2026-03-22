const prisma = require('../../config/database');

// ─── Mapa de condiciones ──────────────────────────────────────────────────────
const conditionMap = {
  'nuevo': 'NUEVO',
  'usado': 'USADO',
  'reacondicionado': 'REACONDICIONADO',
  'NUEVO': 'NUEVO',
  'USADO': 'USADO',
  'REACONDICIONADO': 'REACONDICIONADO',
};

// ─── Crear producto ───────────────────────────────────────────────────────────
const createProduct = async ({ titulo, descripcion, precio, stock, sellerId, imageUrl, condicion, promedioCalificacion }) => {

  const prismaCondition = conditionMap[condicion] || 'NUEVO';


  const product = await prisma.producto.create({
    data: {
      titulo,
      descripcion: descripcion || null,
      precio,
      stock,
      condicion: prismaCondition,
      vendedorId: sellerId,
      promedioCalificacion: promedioCalificacion ? parseFloat(promedioCalificacion) : 0,
    },
    include: {
      vendedor: {
        select: { id: true, nombres: true, apellidos: true, correo: true },
      },
      imagenes: true,
    },
  });

  
  if (imageUrl) {
    await prisma.productoImagen.create({
      data: {
        productoId: product.id,
        url: imageUrl,
        esPrincipal: true,
      },
    });
  }


  const fullProduct = await prisma.producto.findUnique({
    where: { id: product.id },
    include: {
      vendedor: { select: { id: true, nombres: true, apellidos: true, correo: true } },
      imagenes: true,
    },
  });
  return fullProduct;
};

// ─── Listar todos los productos activos ───────────────────────────────────────
const getProducts = async ({ search, condition, minPrice, maxPrice, minRating } = {}) => {
  const where = { estaActivo: true };

  if (search) {
    where.OR = [
      { titulo: { contains: search, mode: 'insensitive' } },
      { descripcion: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (condition) {
    where.condicion = conditionMap[condition] || conditionMap[condition?.toLowerCase()] || 'NUEVO';
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.precio = {};
    if (minPrice !== undefined) where.precio.gte = parseFloat(minPrice);
    if (maxPrice !== undefined) where.precio.lte = parseFloat(maxPrice);
  }

  if (minRating !== undefined && minRating > 0) {
    where.promedioCalificacion = { gte: parseFloat(minRating) };
  }

  const products = await prisma.producto.findMany({
    where,
    include: {
      vendedor: {
        select: { id: true, nombres: true, apellidos: true },
      },
      imagenes: true,
    },
    orderBy: { creadoEn: 'desc' },
  });
  return products;
};


// ─── Obtener producto por ID ──────────────────────────────────────────────────
const getProductById = async (id) => {
  const product = await prisma.producto.findFirst({
    where: { id, estaActivo: true },
    include: {
      vendedor: { select: { id: true, nombres: true, apellidos: true, correo: true } },
      imagenes: true,
    },
  });
  if (!product) {
    throw new Error('Producto no encontrado');
  }
  return product;
};

// ─── PUT /api/v1/products/:id ─────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'ID de producto inválido' });

    const sellerId = req.user.userId;
    let imageUrl = null;

    // Si hay nueva imagen, subirla a Cloudinary desde buffer // <-- MODIFICADO
    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'productos' }, (error, result) => {
          if (error) return reject(new Error('Error al subir imagen a Cloudinary'));
          resolve(result.secure_url);
        });
        stream.end(req.file.buffer);
      });
    }

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

// ─── Eliminar producto (soft delete) ─────────────────────────────────────────
const deleteProduct = async (id, sellerId) => {
  const product = await prisma.producto.findFirst({
    where: { id, estaActivo: true },
    include: { imagenes: true }, // <-- NUEVO: incluir imágenes
  });

  if (!product) throw new Error('Producto no encontrado');
  if (product.vendedorId !== sellerId) throw new Error('No tienes permiso para eliminar este producto');

  // Soft delete
  await prisma.producto.update({
    where: { id },
    data: { estaActivo: false },
  });

  // Retornar URLs de imágenes para borrarlas de Cloudinary // <-- NUEVO
  return product.imagenes.map(img => img.url);
};

// ─── Listar productos del vendedor ────────────────────────────────────────────
const getMyProducts = async (sellerId) => {
  const products = await prisma.producto.findMany({
    where: { vendedorId: sellerId, estaActivo: true },
    include: {
      vendedor: {
        select: { id: true, nombres: true, apellidos: true },
      },
      imagenes: true,
    },
    orderBy: { creadoEn: 'desc' },
  });

  return products;
};


module.exports = {
  createProduct,
  getProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
