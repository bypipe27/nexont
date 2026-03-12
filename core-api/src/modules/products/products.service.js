const prisma = require('../../config/database');
const AppError = require('../../shared/errors/AppError');

// ─── Crear producto ───────────────────────────────────────────────────────────
const createProduct = async ({ name, description, price, stock, sellerId }) => {
  const product = await prisma.product.create({
    data: {
      name,
      description: description || null,
      price,
      stock,
      sellerId,
    },
    include: {
      seller: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  return product;
};

// ─── Listar todos los productos activos ───────────────────────────────────────
const getProducts = async () => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
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
    throw new AppError('Producto no encontrado', 404);
  }

  return product;
};

// ─── Actualizar producto ──────────────────────────────────────────────────────
const updateProduct = async (id, sellerId, data) => {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
  });

  if (!product) {
    throw new AppError('Producto no encontrado', 404);
  }

  if (product.sellerId !== sellerId) {
    throw new AppError('No tienes permiso para modificar este producto', 403);
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
        select: { id: true, firstName: true, lastName: true },
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
    throw new AppError('Producto no encontrado', 404);
  }

  if (product.sellerId !== sellerId) {
    throw new AppError('No tienes permiso para eliminar este producto', 403);
  }

  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
