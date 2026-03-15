const prisma = require('../../config/database');

// ─── Crear producto ───────────────────────────────────────────────────────────
const createProduct = async ({ name, description, price, stock, sellerId, imageUrl, condition, rating }) => {
  const product = await prisma.product.create({
    data: {
      name,
      description: description || null,
      price,
      stock,
      imageUrl: imageUrl || null,
      condition: condition || 'nuevo',
      rating: rating ? parseFloat(rating) : 0,
      sellerId,
    },
    include: {
      seller: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  return product;
};

// ─── Listar todos los productos activos ───────────────────────────────────────
const getProducts = async ({ search, condition, minPrice, maxPrice, minRating } = {}) => {
  const where = { isActive: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (condition) where.condition = condition;

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = parseFloat(minPrice);
    if (maxPrice !== undefined) where.price.lte = parseFloat(maxPrice);
  }

  if (minRating !== undefined && minRating > 0) {
    where.rating = { gte: parseFloat(minRating) };
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      seller: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return products;
};


// ─── Obtener producto por ID ──────────────────────────────────────────────────
const getProductById = async (id) => {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
    include: {
      seller: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  if (!product) {
    throw new Error('Producto no encontrado');
  }

  return product;
};

// ─── Actualizar producto ──────────────────────────────────────────────────────
const updateProduct = async (id, sellerId, data) => {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
  });

  if (!product) {
    throw new Error('Producto no encontrado');
  }

  if (product.sellerId !== sellerId) {
    throw new Error('No tienes permiso para modificar este producto');
  }

  const updateData = { ...data };

  if (Object.prototype.hasOwnProperty.call(updateData, 'description') && updateData.description === '') {
    updateData.description = null;
  }

  const updated = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      seller: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  return updated;
};

// ─── Eliminar producto (soft delete) ─────────────────────────────────────────
const deleteProduct = async (id, sellerId) => {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
  });

  if (!product) {
    throw new Error('Producto no encontrado');
  }

  if (product.sellerId !== sellerId) {
    throw new Error('No tienes permiso para eliminar este producto');
  }

  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
};

// ─── Listar productos del vendedor ────────────────────────────────────────────
const getMyProducts = async (sellerId) => { // <-- NUEVO
  const products = await prisma.product.findMany({
    where: { sellerId, isActive: true },
    include: {
      seller: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return products;
};


module.exports = {
  createProduct,
  getProducts,
  getMyProducts, // <-- NUEVO
  getProductById,
  updateProduct,
  deleteProduct,
};
