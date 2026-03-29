const prisma = require('../../config/database');

// ─── Formatear carrito para el cliente ───────────────────────────────────────
const formatCart = (items) => {
  const subtotal = items.reduce((acc, item) => {
    const price = Number(item.producto?.precio || 0);
    return acc + (price * item.cantidad);
  }, 0);

  return {
    items: items.map(item => ({
      id: item.id,
      quantity: item.cantidad,
      product: {
        id: item.producto.id,
        titulo: item.producto.titulo,
        price: Number(item.producto.precio),
        stock: item.producto.stock,
        estaActivo: item.producto.estaActivo,
        imagenes: item.producto.imagenes,
      },
    })),
    totalItems: items.reduce((acc, item) => acc + item.cantidad, 0),
    subtotal: Number(subtotal.toFixed(2)),
  };
};

// ─── Obtener carrito del usuario ─────────────────────────────────────────────
const getCartByUser = async (userId) => {
  const items = await prisma.itemCarrito.findMany({
    where: {
      usuarioId: userId,
      producto: { estaActivo: true },
    },
    include: {
      producto: {
        select: {
          id: true,
          titulo: true,
          precio: true,
          stock: true,
          estaActivo: true,
          imagenes: {
            where: { esPrincipal: true },
            select: { url: true },
          },
        },
      },
    },
    orderBy: { creadoEn: 'desc' },
  });

  return formatCart(items);
};

// ─── Agregar item al carrito ──────────────────────────────────────────────────
const addItemToCart = async ({ userId, productId, quantity }) => {
  const product = await prisma.producto.findFirst({
    where: { id: productId, estaActivo: true },
    select: { id: true, stock: true },
  });

  if (!product) throw new Error('Producto no encontrado');

  // Buscar si ya existe en el carrito
  const existing = await prisma.itemCarrito.findUnique({
    where: {
      usuarioId_productoId: { usuarioId: userId, productoId: productId },
    },
    select: { cantidad: true },
  });

  const currentQuantity = existing ? existing.cantidad : 0;
  const finalQuantity   = currentQuantity + quantity;

  if (finalQuantity > product.stock) {
    throw new Error('No puedes agregar más cantidad que el stock disponible');
  }

  await prisma.itemCarrito.upsert({
    where: {
      usuarioId_productoId: { usuarioId: userId, productoId: productId },
    },
    update: { cantidad: finalQuantity },
    create: { usuarioId: userId, productoId: productId, cantidad: quantity },
  });

  return getCartByUser(userId);
};

// ─── Actualizar cantidad de un item ──────────────────────────────────────────
const updateCartItemQuantity = async ({ userId, productId, quantity }) => {
  const cartItem = await prisma.itemCarrito.findUnique({
    where: {
      usuarioId_productoId: { usuarioId: userId, productoId: productId },
    },
  });

  if (!cartItem) throw new Error('El producto no está en tu carrito');

  // Si quantity es 0, eliminar el item
  if (quantity === 0) {
    await prisma.itemCarrito.delete({
      where: {
        usuarioId_productoId: { usuarioId: userId, productoId: productId },
      },
    });
    return getCartByUser(userId);
  }

  const product = await prisma.producto.findFirst({
    where: { id: productId, estaActivo: true },
    select: { id: true, stock: true },
  });

  if (!product) throw new Error('Producto no encontrado');

  if (quantity > product.stock) {
    throw new Error('No puedes guardar más cantidad que el stock disponible');
  }

  await prisma.itemCarrito.update({
    where: {
      usuarioId_productoId: { usuarioId: userId, productoId: productId },
    },
    data: { cantidad: quantity },
  });

  return getCartByUser(userId);
};

// ─── Eliminar un item del carrito ─────────────────────────────────────────────
const removeCartItem = async ({ userId, productId }) => {
  await prisma.itemCarrito.deleteMany({
    where: { usuarioId: userId, productoId: productId },
  });
  return getCartByUser(userId);
};

// ─── Vaciar carrito completo ──────────────────────────────────────────────────
const clearCart = async (userId) => {
  await prisma.itemCarrito.deleteMany({ where: { usuarioId: userId } });
  return getCartByUser(userId);
};

module.exports = { getCartByUser, addItemToCart, updateCartItemQuantity, removeCartItem, clearCart };