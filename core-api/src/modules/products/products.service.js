const prisma = require('../../config/database');

// ─── Crear producto ───────────────────────────────────────────────────────────
const createProduct = async ({ titulo, descripcion, precio, stock, sellerId, imageUrl, condicion, promedioCalificacion }) => {
  // Usar destructuring alineado al schema
  // Mapear valores de condición del frontend a enum Prisma
  const conditionMap = {
    'NUEVO': 'NUEVO',
    'USADO': 'USADO',
    'REACONDICIONADO': 'REACONDICIONADO',
  };
  const prismaCondition = conditionMap[condicion] || 'NUEVO';

  // Crear producto
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

  // Si hay imagen, crear ProductoImagen
  if (imageUrl) {
    await prisma.productoImagen.create({
      data: {
        productoId: product.id,
        url: imageUrl,
        esPrincipal: true,
      },
    });
  }

  // Volver a traer el producto con imágenes
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
    const conditionMap = {
      'nuevo': 'NUEVO',
      'usado': 'USADO',
      'reacondicionado': 'SEMINUEVO',
      'seminuevo': 'SEMINUEVO',
      'NUEVO': 'NUEVO',
      'USADO': 'USADO',
      'SEMINUEVO': 'SEMINUEVO',
    };
    where.condicion = conditionMap[condition.toLowerCase()] || 'NUEVO';
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
        select: { id: true, nombres: true, apellidos: true, correo: true },
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

// ─── Actualizar producto ──────────────────────────────────────────────────────
const updateProduct = async (id, sellerId, data) => {
  const product = await prisma.producto.findFirst({
    where: { id, estaActivo: true },
  });

  if (!product) {
    throw new Error('Producto no encontrado');
  }

  if (product.vendedorId !== sellerId) {
    throw new Error('No tienes permiso para modificar este producto');
  }

  const updateData = { ...data };
  if (Object.prototype.hasOwnProperty.call(updateData, 'descripcion') && updateData.descripcion === '') {
    updateData.descripcion = null;
  }
  // Mapear condición si viene del frontend
  if (updateData.condicion) {
    const conditionMap = {
      'nuevo': 'NUEVO',
      'usado': 'USADO',
      'reacondicionado': 'SEMINUEVO',
      'seminuevo': 'SEMINUEVO',
      'NUEVO': 'NUEVO',
      'USADO': 'USADO',
      'SEMINUEVO': 'SEMINUEVO',
    };
    updateData.condicion = conditionMap[updateData.condicion.toLowerCase()] || 'NUEVO';
  }
  // Si hay nueva imagen, agregarla a ProductoImagen (Cloudinary)
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
  });

  if (!product) {
    throw new Error('Producto no encontrado');
  }

  if (product.vendedorId !== sellerId) {
    throw new Error('No tienes permiso para eliminar este producto');
  }

  await prisma.producto.update({
    where: { id },
    data: { estaActivo: false },
  });
  // Opcional: eliminar imágenes de Cloudinary (no implementado aquí)
};

// ─── Listar productos del vendedor ────────────────────────────────────────────
const getMyProducts = async (sellerId) => { // <-- NUEVO
  const products = await prisma.producto.findMany({
    where: { vendedorId: sellerId, estaActivo: true },
    include: {
      vendedor: {
        select: { id: true, nombres: true, apellidos: true, correo: true },
      },
      imagenes: true,
    },
    orderBy: { creadoEn: 'desc' },
  });
  console.log('IMAGENES DE MIS PRODUCTOS:', products.map(p => ({ id: p.id, imagenes: p.imagenes })));
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
