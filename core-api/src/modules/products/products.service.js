const prisma = require('../../config/database');
const logger = require('../../shared/logger/logger');

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
    logger.warn('Producto no encontrado', { productId: id });
    throw new Error('Producto no encontrado');
  }
  return product;
};

// ─── Actualizar producto ─────────────────────────────────────────────────────
const updateProduct = async (id, sellerId, updateData) => {
  if (Number.isNaN(id)) {
    logger.warn('ID de producto inválido al actualizar', { productId: id, sellerId });
    throw new Error('ID de producto inválido');
  }

  // Buscar el producto
  const product = await prisma.producto.findFirst({
    where: { id, estaActivo: true },
    include: { imagenes: true },
  });
  if (!product) {
    logger.warn('Producto no encontrado al actualizar', { productId: id, sellerId });
    throw new Error('Producto no encontrado');
  }
  if (product.vendedorId !== sellerId) {
    logger.warn('Intento de actualizar producto sin permiso', { productId: id, sellerId });
    throw new Error('No tienes permiso para actualizar este producto');
  }

  // Si hay nueva imagen, agregarla
  if (updateData.imageUrl) {
    await prisma.productoImagen.create({
      data: {
        productoId: id,
        url: updateData.imageUrl,
        esPrincipal: true,
      },
    });
    delete updateData.imageUrl;
  }

  // Actualizar el producto
  const updated = await prisma.producto.update({
    where: { id },
    data: updateData,
    include: {
      vendedor: { select: { id: true, nombres: true, apellidos: true, correo: true } },
      imagenes: true,
    },
  });
  logger.info('Producto actualizado', { productId: id, sellerId });
  return updated;
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
