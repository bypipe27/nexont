const prisma = require('../../config/database');

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

const categoryKeywords = {
  tecnologia: ['laptop', 'pc', 'teclado', 'mouse', 'monitor', 'celular', 'tablet', 'iphone', 'android', 'audifonos', 'smartwatch', 'consola', 'gaming'],
  hogar: ['silla', 'mesa', 'sofa', 'cocina', 'nevera', 'microondas', 'lampara', 'colchon', 'decoracion', 'hogar'],
  moda: ['chaqueta', 'camisa', 'zapatos', 'tenis', 'bolso', 'reloj', 'ropa', 'vestido', 'jean', 'moda'],
  deportes: ['bicicleta', 'balon', 'pesas', 'deporte', 'gym', 'patines', 'raqueta', 'casco', 'guantes'],
  gaming: ['playstation', 'xbox', 'nintendo', 'gpu', 'rtx', 'joystick', 'gaming', 'monitor', 'teclado'],
};

const budgetRanges = {
  '0-100': { min: 0, max: 100 },
  '100-300': { min: 100, max: 300 },
  '300-700': { min: 300, max: 700 },
  '700+': { min: 700, max: Number.POSITIVE_INFINITY },
};

const normalizeLimit = (limit, fallback = 6) => {
  const parsed = parseInt(limit, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, 6);
};

const getFallbackProducts = async (limit = 6) => {
  return prisma.producto.findMany({
    where: { estaActivo: true },
    include: {
      vendedor: {
        select: { id: true, nombres: true, apellidos: true },
      },
      imagenes: true,
    },
    orderBy: [
      { stock: 'desc' },
      { creadoEn: 'desc' },
    ],
    take: limit,
  });
};

const getAssistedRecommendations = async ({ answers = {}, limit = 6 } = {}) => {
  const safeLimit = normalizeLimit(limit);

  const requiredAnswers = [
    answers.objetivoCompra,
    answers.condicionPreferida,
    answers.presupuesto,
    answers.preferenciaClave,
    answers.prioridad,
  ];

  const hasCompleteSurvey = requiredAnswers.every((value) => typeof value === 'string' && value.trim() !== '');

  if (!hasCompleteSurvey) {
    return {
      products: await getFallbackProducts(safeLimit),
      usedFallback: true,
    };
  }

  const products = await prisma.producto.findMany({
    where: { estaActivo: true },
    include: {
      vendedor: {
        select: { id: true, nombres: true, apellidos: true },
      },
      imagenes: true,
    },
    take: 120,
  });

  const now = Date.now();
  const selectedCondition = (answers.condicionPreferida || '').toUpperCase();
  const budgetRange = budgetRanges[answers.presupuesto] || budgetRanges['700+'];
  const selectedKeywords = categoryKeywords[answers.objetivoCompra] || [];

  const scored = products.map((product) => {
    let score = 0;
    const price = Number(product.precio || 0);
    const rating = Number(product.promedioCalificacion || 0);
    const stock = Number(product.stock || 0);
    const condition = String(product.condicion || 'NUEVO').toUpperCase();
    const titleAndDescription = `${product.titulo || ''} ${product.descripcion || ''}`.toLowerCase();
    const ageDays = Math.max(0, (now - new Date(product.creadoEn).getTime()) / (1000 * 60 * 60 * 24));

    if (selectedCondition === 'CUALQUIERA') {
      score += 8;
    } else if (condition === selectedCondition) {
      score += 18;
    }

    if (price >= budgetRange.min && price <= budgetRange.max) {
      score += 25;
    } else {
      const targetMid = Number.isFinite(budgetRange.max)
        ? (budgetRange.min + budgetRange.max) / 2
        : budgetRange.min;
      const distance = Math.abs(price - targetMid);
      const closeness = Math.max(0, 1 - distance / Math.max(targetMid || 1, 1));
      score += closeness * 10;
    }

    if (selectedKeywords.length > 0) {
      const keywordMatches = selectedKeywords.filter((keyword) => titleAndDescription.includes(keyword)).length;
      score += Math.min(20, keywordMatches * 5);
    }

    if (answers.preferenciaClave === 'ahorro') {
      score += Math.max(0, 15 - price / 100);
    }
    if (answers.preferenciaClave === 'durabilidad' && condition === 'NUEVO') {
      score += 8;
    }
    if (answers.preferenciaClave === 'rendimiento' && rating >= 4) {
      score += 8;
    }
    if (answers.preferenciaClave === 'portabilidad') {
      const portableHints = ['celular', 'tablet', 'reloj', 'smartwatch', 'audifonos', 'tenis', 'bolso'];
      const portableMatch = portableHints.some((hint) => titleAndDescription.includes(hint));
      if (portableMatch) score += 8;
    }
    if (answers.preferenciaClave === 'estetica') {
      const aestheticHints = ['edicion', 'premium', 'diseno', 'estilo', 'vintage', 'minimal'];
      const aestheticMatch = aestheticHints.some((hint) => titleAndDescription.includes(hint));
      if (aestheticMatch) score += 8;
    }

    if (answers.prioridad === 'ahorro') {
      score += Math.max(0, 12 - price / 120);
    }
    if (answers.prioridad === 'calidad') {
      score += rating * 3;
    }
    if (answers.prioridad === 'disponibilidad') {
      score += Math.min(15, stock);
    }
    if (answers.prioridad === 'novedad') {
      score += Math.max(0, 16 - ageDays / 2);
    }

    if (stock > 0) score += 4;

    return { product, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.product.stock !== a.product.stock) return b.product.stock - a.product.stock;
    return new Date(b.product.creadoEn).getTime() - new Date(a.product.creadoEn).getTime();
  });

  return {
    products: scored.slice(0, safeLimit).map((entry) => entry.product),
    usedFallback: false,
  };
};

// ─── Crear producto ───────────────────────────────────────────────────────────
const createProduct = async ({ titulo, descripcion, precio, stock, sellerId, imageUrl, condicion, promedioCalificacion }) => {
  const prismaCondition = conditionMap[condicion] || 'NUEVO';

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
const updateProduct = async (id, sellerId, updateData) => {
  const product = await prisma.producto.findFirst({
    where: { id, estaActivo: true },
  });

  if (!product) throw new Error('Producto no encontrado');
  if (product.vendedorId !== sellerId) throw new Error('No tienes permiso para editar este producto');

  if (updateData.condicion) {
    updateData.condicion = conditionMap[updateData.condicion] || conditionMap[updateData.condicion?.toLowerCase()] || 'NUEVO';
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

module.exports = {
  createProduct,
  getProducts,
  getRecentProducts,
  getAssistedRecommendations,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};