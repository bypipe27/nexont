const prisma = require('../../config/database');
const { normalizeCategory } = require('../../shared/utils/category.utils');

// ─── Mapa de condiciones ──────────────────────────────────────────────────────
const conditionMap = {
  'nuevo': 'NUEVO',
  'usado': 'USADO',
  'reacondicionado': 'REACONDICIONADO',
  'NUEVO': 'NUEVO',
  'USADO': 'USADO',
  'REACONDICIONADO': 'REACONDICIONADO',
  'CUALQUIERA': 'CUALQUIERA',
};

// ─── Crear producto ───────────────────────────────────────────────────────────
const createProduct = async ({ titulo, descripcion, precio, stock, sellerId, imageUrl, condicion, categoria, promedioCalificacion }) => {
  const prismaCondition = conditionMap[condicion] || 'NUEVO';
  const prismaCategoria = normalizeCategory(categoria) || 'SERVICIOS_OTROS';

  // Garantizar tipos correctos para Prisma
  const vendedorIdInt = parseInt(sellerId, 10);
  if (isNaN(vendedorIdInt)) throw new Error('sellerId inválido');

  const precioDecimal = parseFloat(precio);
  if (isNaN(precioDecimal)) throw new Error('precio inválido');

  const stockInt = parseInt(stock, 10) || 0;

  const product = await prisma.producto.create({
    data: {
      titulo,
      descripcion: descripcion || null,
      precio: precioDecimal,
      stock: stockInt,
      condicion: prismaCondition,
      categoria: prismaCategoria,
      vendedorId: vendedorIdInt,
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

// ─── Obtener las últimas N publicaciones (para la home) ───────────────────────
const getRecentProducts = async (limit = 6) => {
  const products = await prisma.producto.findMany({
    where: { estaActivo: true },
    include: {
      vendedor: {
        select: { id: true, nombres: true, apellidos: true, correo: true },
      },
      imagenes: true,
    },
    orderBy: { creadoEn: 'desc' },
    take: limit,
  });
  return products;
};

// ─── Obtener producto por ID ──────────────────────────────────────────────────
const getProductById = async (id) => {
  const product = await prisma.producto.findFirst({
    where: { id, estaActivo: true },
    include: {
      vendedor: { select: { id: true, nombres: true, apellidos: true, correo: true, fotoPerfil: true, creadoEn: true } },
      imagenes: true,
    },
  });
  if (!product) {
    throw new Error('Producto no encontrado');
  }
  return product;
};

// ─── Actualizar producto ──────────────────────────────────────────────────────
const updateProduct = async (id, sellerId, updateData) => {
  const product = await prisma.producto.findFirst({
    where: { id, estaActivo: true },
  });

  if (!product) throw new Error('Producto no encontrado');
  if (product.vendedorId !== sellerId) throw new Error('No tienes permiso para editar este producto');

  if (updateData.condicion) {
    updateData.condicion = conditionMap[updateData.condicion] || conditionMap[updateData.condicion?.toLowerCase()] || 'NUEVO';
  }

  if (updateData.categoria) {
    const normalizedCategory = normalizeCategory(updateData.categoria);
    if (!normalizedCategory) throw new Error('categoria inválida');
    updateData.categoria = normalizedCategory;
  }

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

  const updated = await prisma.producto.update({
    where: { id },
    data: updateData,
    include: {
      vendedor: { select: { id: true, nombres: true, apellidos: true, correo: true } },
      imagenes: true,
    },
  });
  return updated;
};

// ─── Eliminar producto (soft delete) ─────────────────────────────────────────
const deleteProduct = async (id, sellerId) => {
  const product = await prisma.producto.findFirst({
    where: { id, estaActivo: true },
    include: { imagenes: true },
  });

  if (!product) throw new Error('Producto no encontrado');
  if (product.vendedorId !== sellerId) throw new Error('No tienes permiso para eliminar este producto');

  await prisma.producto.update({
    where: { id },
    data: { estaActivo: false },
  });

  // Retornar URLs de imágenes para borrarlas de Cloudinary
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


const getProductsBySellerPublic = async (sellerId) => {
  const id = parseInt(sellerId, 10);
  if (isNaN(id)) throw new Error('ID de vendedor inválido');

  const seller = await prisma.usuario.findFirst({
    where: { id, esActivo: true },
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      creadoEn: true,
      fotoPerfil: true,
    },
  });

  if (!seller) throw new Error('Vendedor no encontrado');

  const products = await prisma.producto.findMany({
    where: { vendedorId: id, estaActivo: true },
    include: {
      imagenes: true,
      vendedor: {
        select: { id: true, nombres: true, apellidos: true, creadoEn: true },
      },
    },
    orderBy: { creadoEn: 'desc' },
  });

  return { seller, products, totalProductos: products.length };
};

module.exports = {
  createProduct,
  getProducts,
  getRecentProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySellerPublic,
};